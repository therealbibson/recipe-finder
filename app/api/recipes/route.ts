import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { z } from "zod";

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
// them for new users in Sep 2026 and suggests gemini-3.8-flash). Primary is
// gemini-3.5-flash, which works on a free AI Studio key; 3.8-flash is
// Google's suggested replacement but is often overloaded (503), so the
// lite model is a third fallback.
const MODELS = [
  "gemini-3.5-flash",
  "gemini-3.8-flash",
  "gemini-3.5-flash-lite",
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

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          "GEMINI_API_KEY is not configured. Add it to .env.local (copy .env.example to .env.local and fill in your key).",
      },
      { status: 503 },
    );
  }

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

  let lastError: unknown = null;
  for (const modelName of MODELS) {
    try {
      const raw = await generateWithModel(apiKey, modelName, prompt);
      const recipes = parseRecipes(raw);
      return NextResponse.json({ recipes });
    } catch (err) {
      lastError = err;
      const message = err instanceof Error ? err.message : String(err);
      // Fall back to the second model for a model-not-found error, or
      // for an unparseable/invalid response — the second model may
      // return clean JSON. Any other error (e.g. bad key, quota) is
      // not worth a second call.
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

  console.error("Gemini recipe generation failed:", lastError);
  return NextResponse.json(
    {
      error:
        "Could not generate recipes right now. Please try again in a moment.",
    },
    { status: 502 },
  );
}
