import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { z } from "zod";
import { findLocalRecipes } from "./fallback-recipes";

const bodySchema = z.object({
  ingredients: z
    .string()
    .trim()
    .min(3, "Tell us at least one ingredient you have.")
    .max(2000, "Ingredients must be 2,000 characters or fewer."),
  servings: z.number().int().min(1).max(12).optional().default(4),
  maxTime: z
    .union([z.literal(15), z.literal(30), z.literal(45), z.literal(60)])
    .optional(),
  diet: z
    .enum(["Any", "Vegetarian", "Vegan", "Gluten-free"])
    .optional()
    .default("Any"),
  cuisine: z.string().trim().max(60).optional().default(""),
});

const recipeSchema = z.object({
  title: z.string().min(1).max(200),
  timeMinutes: z.number().int().min(1).max(600),
  servings: z.number().int().min(1).max(24),
  difficulty: z.enum(["Easy", "Medium", "Hard"]),
  ingredientsUsed: z.array(z.string().min(1)).min(1),
  ingredientsNeeded: z.array(z.string().min(1)).default([]),
  ingredients: z.array(z.string().min(1)).min(1),
  steps: z.array(z.string().min(1)).min(1).max(20),
  tip: z.string().max(300).optional(),
});

const recipesSchema = z.array(recipeSchema).length(3);

// Gemini 2.x models return 404 for new API keys/projects (Google retired
// them for new users in Sep 2026). The 3.x Flash models are the current
// ones, but individual models often return 503 "high demand" on the free
// tier, so try several in turn — including the moving alias
// gemini-flash-latest, which Google routes to whichever Flash model is
// currently serving.
const MODELS = [
  "gemini-3.5-flash",
  "gemini-3.6-flash",
  "gemini-3.8-flash",
  "gemini-3.5-flash-lite",
  "gemini-flash-latest",
] as const;

async function generateWithModel(
  apiKey: string,
  modelName: string,
  prompt: string,
): Promise<string> {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: modelName });
  const result = await model.generateContent(prompt);
  const text = result.response.text().trim();
  if (!text) throw new Error("Empty response from Gemini");
  return text;
}

// Groq fallback. Plain fetch, no new dependency. Do NOT use
// llama-3.3-70b-versatile or llama-3.1-8b-instant — they are
// Enterprise-only since Aug 2026. The gpt-oss models below are the
// current Groq-hosted open models.
const GROQ_MODELS = ["openai/gpt-oss-120b", "openai/gpt-oss-20b"] as const;

async function generateWithGroq(
  apiKey: string,
  modelName: string,
  systemInstruction: string,
  prompt: string,
): Promise<string> {
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: modelName,
      messages: [
        { role: "system", content: systemInstruction },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      response_format: { type: "json_object" },
    }),
    signal: AbortSignal.timeout(25000),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Groq ${modelName} returned HTTP ${res.status}: ${body.slice(0, 200)}`);
  }
  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const text = data.choices?.[0]?.message?.content?.trim();
  if (!text) throw new Error(`Empty response from Groq ${modelName}`);
  return text;
}

function parseRecipes(raw: string) {
  // Strip ```json / ``` fences if Gemini added them, then parse.
  const cleaned = raw
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```\s*$/, "")
    .trim();
  const parsed: unknown = JSON.parse(cleaned);
  return recipesSchema.parse(parsed);
}

export async function POST(request: Request) {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request. Send a JSON body." },
      { status: 400 },
    );
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return NextResponse.json(
      { error: issue?.message ?? "Invalid input." },
      { status: 400 },
    );
  }

  const { ingredients, servings, maxTime, diet, cuisine } = parsed.data;

  const geminiKey = process.env.GEMINI_API_KEY;
  const groqKey = process.env.GROQ_API_KEY;

  const prompt = [
    "You are a helpful worldwide recipe finder. Return STRICT JSON only — no markdown, no code fences, no extra text, no explanation.",
    "Return a JSON array of exactly 3 recipe objects. Each object must have exactly these fields:",
    '{ "title": string, "timeMinutes": number, "servings": number, "difficulty": "Easy" | "Medium" | "Hard", "ingredientsUsed": string[], "ingredientsNeeded": string[], "ingredients": string[] (each with a quantity, e.g. "2 cups rice"), "steps": string[], "tip": string (optional) }',
    "",
    "Rules:",
    "- Use the supplied ingredients as the core of every recipe. Do not invent a main ingredient the user does not have.",
    "- ingredientsUsed: the supplied ingredients each recipe uses. ingredientsNeeded: any extra ingredients required, kept minimal and common (salt, oil, spices and everyday pantry items are fine). ingredients: the full list with quantities for the recipe.",
    "- Respect the diet, max time and servings below. If a recipe cannot meet the max time, do not include it — pick a faster one instead.",
    "- Worldwide recipes, not Nigeria-only. Vary the 3 recipes — different dishes, not 3 versions of the same thing.",
    "- Steps: clear, numbered-style short steps a home cook can follow (4-10 steps).",
    "- timeMinutes must be the total cooking time in minutes. servings must match the requested servings.",
    "",
    `Ingredients the user has: ${ingredients}`,
    `Servings: ${servings}`,
    `Max time: ${maxTime ? `${maxTime} minutes` : "any"}`,
    `Diet: ${diet}`,
    `Cuisine preference: ${cuisine || "any"}`,
  ].join("\n");

  // Flow: Gemini -> Groq -> local fallback. A valid request never
  // returns 502/503 — the local library always returns 3 recipes.
  const failures: string[] = [];

  // 1. Gemini, if a key is set.
  if (geminiKey) {
    for (const modelName of MODELS) {
      try {
        const raw = await generateWithModel(geminiKey, modelName, prompt);
        const recipes = parseRecipes(raw);
        return NextResponse.json({ recipes, source: "gemini" });
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        // Log every attempt, not just the last one — otherwise the logs
        // only show the final fallback model and hide why the earlier
        // models failed.
        failures.push(`gemini/${modelName}: ${message}`);
        console.error(`Gemini recipe generation failed (${modelName}):`, err);
        // Try the next model for a retired-model (404), overloaded (503),
        // or rate-limited (429) error, or an unparseable response — the
        // next model may return clean JSON. Any other error (e.g. a bad
        // key) is not worth another call.
        const isModelError = /not found|404|model/i.test(message);
        const isOverloaded = /503|429|overloaded|high demand|unavailable/i.test(
          message,
        );
        const isParseError =
          err instanceof SyntaxError ||
          (err instanceof Error && err.name === "ZodError");
        if (!isModelError && !isOverloaded && !isParseError) break;
      }
    }
    console.error("Gemini recipe generation failed (all models):", failures);
  } else {
    console.error("Gemini recipe generation skipped: no GEMINI_API_KEY set.");
  }

  // 2. Groq, if a key is set. Same prompt, same strict-JSON parsing.
  if (groqKey) {
    // prompt is a single joined string, so spell the system instruction
    // out — it is the same strict-JSON instruction as the Gemini prompt.
    const systemInstruction =
      'You are a helpful worldwide recipe finder. Return STRICT JSON only — no markdown, no code fences, no extra text, no explanation. ' +
      "Return a JSON array of exactly 3 recipe objects. Each object must have exactly these fields: " +
      '{ "title": string, "timeMinutes": number, "servings": number, "difficulty": "Easy" | "Medium" | "Hard", "ingredientsUsed": string[], "ingredientsNeeded": string[], "ingredients": string[] (each with a quantity, e.g. "2 cups rice"), "steps": string[], "tip": string (optional) }';
    for (const modelName of GROQ_MODELS) {
      try {
        const raw = await generateWithGroq(
          groqKey,
          modelName,
          systemInstruction,
          prompt,
        );
        const recipes = parseRecipes(raw);
        return NextResponse.json({ recipes, source: "groq" });
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        failures.push(`groq/${modelName}: ${message}`);
        console.error(`Groq recipe generation failed (${modelName}):`, err);
      }
    }
    console.error("Groq recipe generation failed (all models):", failures);
  } else {
    console.error("Groq recipe generation skipped: no GROQ_API_KEY set.");
  }

  // 3. Local fallback — always returns exactly 3 recipes, no key needed.
  try {
    const recipes = findLocalRecipes({
      ingredients,
      servings,
      maxTime: maxTime ?? null,
      diet,
    });
    return NextResponse.json({ recipes, source: "local" });
  } catch (err) {
    console.error("Local fallback failed:", err, "failures:", failures);
    return NextResponse.json(
      { error: "Could not generate recipes right now. Please try again in a moment." },
      { status: 502 },
    );
  }
}
