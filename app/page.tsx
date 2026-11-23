"use client";

import { useEffect, useState } from "react";

type Diet = "Any" | "Vegetarian" | "Vegan" | "Gluten-free";
type MaxTime = 15 | 30 | 45 | 60 | null;

type Recipe = {
  title: string;
  timeMinutes: number;
  servings: number;
  difficulty: "Easy" | "Medium" | "Hard";
  ingredientsUsed: string[];
  ingredientsNeeded: string[];
  ingredients: string[];
  steps: string[];
  tip?: string;
};

const DIETS: Diet[] = ["Any", "Vegetarian", "Vegan", "Gluten-free"];
const MAX_TIMES: { label: string; value: MaxTime }[] = [
  { label: "Any", value: null },
  { label: "15 min", value: 15 },
  { label: "30 min", value: 30 },
  { label: "45 min", value: 45 },
  { label: "60 min", value: 60 },
];
const CUISINES = [
  "Any",
  "Italian",
  "Mexican",
  "Chinese",
  "Indian",
  "Japanese",
  "Mediterranean",
  "American",
  "Thai",
  "French",
];
const COMMON_INGREDIENTS = [
  "rice",
  "chicken",
  "eggs",
  "tomatoes",
  "onion",
  "garlic",
  "pasta",
  "potatoes",
  "bread",
  "cheese",
  "beans",
  "spinach",
  "carrots",
  "milk",
  "butter",
  "beef",
  "salmon",
  "mushrooms",
  "peppers",
  "lemon",
];

const STORAGE_KEY = "recipe-finder:last";

const inputClass =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-700/20";
const labelClass = "mb-1.5 block text-sm font-medium text-slate-800";

function recipeToText(recipe: Recipe): string {
  const lines = [
    recipe.title,
    `${recipe.timeMinutes} min · Serves ${recipe.servings} · ${recipe.difficulty}`,
    "",
    "Ingredients:",
    ...recipe.ingredients.map((i) => `- ${i}`),
    "",
    "Steps:",
    ...recipe.steps.map((s, i) => `${i + 1}. ${s}`),
  ];
  if (recipe.tip) lines.push("", `Tip: ${recipe.tip}`);
  return lines.join("\n");
}

export default function Home() {
  const [ingredients, setIngredients] = useState("");
  // Kept as a string so the field can be cleared and typed freely.
  // It starts empty — 0 is only a placeholder, not a value — and the
  // user enters their own number. It is parsed and validated (1-12)
  // only when finding recipes.
  const [servings, setServings] = useState("");
  const [maxTime, setMaxTime] = useState<MaxTime>(null);
  const [diet, setDiet] = useState<Diet>("Any");
  const [cuisine, setCuisine] = useState("Any");
  const [recipes, setRecipes] = useState<Recipe[]>(() => {
    // Restore the last result so a refresh does not lose it.
    // Lazy initializer (not an effect) to avoid a cascading render.
    try {
      if (typeof window === "undefined") return [];
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return [];
      const parsed: unknown = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length === 3) {
        return parsed as Recipe[];
      }
      return [];
    } catch {
      // localStorage unavailable or saved data invalid — ignore.
      return [];
    }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [source, setSource] = useState<"gemini" | "groq" | "local" | null>(null);
  // How long the successful search took, for the success banner.
  const [searchSeconds, setSearchSeconds] = useState<number | null>(null);

  useEffect(() => {
    try {
      if (recipes.length) localStorage.setItem(STORAGE_KEY, JSON.stringify(recipes));
    } catch {
      // localStorage unavailable — ignore.
    }
  }, [recipes]);

  function ingredientList(): string[] {
    return ingredients
      .split(",")
      .map((i) => i.trim())
      .filter(Boolean);
  }

  function addChip(ingredient: string) {
    const list = ingredientList();
    if (list.some((i) => i.toLowerCase() === ingredient.toLowerCase())) return;
    setIngredients([...list, ingredient].join(", "));
  }

  function removeChip(ingredient: string) {
    setIngredients(
      ingredientList()
        .filter((i) => i.toLowerCase() !== ingredient.toLowerCase())
        .join(", "),
    );
  }

  async function handleFind() {
    setError("");
    setCopiedIndex(null);
    setSource(null);
    setSearchSeconds(null);

    if (ingredients.trim().length < 3) {
      setError("Tell us at least one ingredient you have — type it or tap a chip below.");
      return;
    }

    // No default: the user must enter their own servings. Blank, 0, or
    // anything outside 1-12 is rejected here.
    const servingsNumber = parseInt(servings, 10);
    if (
      servings.trim() === "" ||
      Number.isNaN(servingsNumber) ||
      servingsNumber < 1 ||
      servingsNumber > 12
    ) {
      setError("Enter servings — a whole number between 1 and 12.");
      return;
    }

    // The API can hang when Gemini/Groq are overloaded — without a
    // timeout the button would spin forever. Abort after 75 seconds.
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 75_000);
    const startedAt = Date.now();
    setLoading(true);
    try {
      const res = await fetch("/api/recipes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ingredients,
          servings: servingsNumber,
          maxTime: maxTime ?? undefined,
          diet,
          cuisine: cuisine === "Any" ? "" : cuisine,
        }),
        signal: controller.signal,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(
          typeof data?.error === "string"
            ? data.error
            : "Something went wrong. Please try again.",
        );
        return;
      }
      if (!Array.isArray(data?.recipes) || data.recipes.length !== 3) {
        setError("The generator returned an unexpected result. Please try again.");
        return;
      }
      setRecipes(data.recipes as Recipe[]);
      setSearchSeconds(
        Math.max(1, Math.round((Date.now() - startedAt) / 1000)),
      );
      setSource(
        data?.source === "local"
          ? "local"
          : data?.source === "groq"
            ? "groq"
            : data?.source === "gemini"
              ? "gemini"
              : null,
      );
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        setError("That took too long. Please try again.");
      } else {
        setError("Could not reach the server. Check your connection and try again.");
      }
    } finally {
      clearTimeout(timeoutId);
      setLoading(false);
    }
  }

  async function handleCopy(index: number) {
    try {
      await navigator.clipboard.writeText(recipeToText(recipes[index]));
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch {
      setError("Could not copy. Select the text and copy it manually.");
    }
  }

  function handleClear() {
    setIngredients("");
    setServings("");
    setMaxTime(null);
    setDiet("Any");
    setCuisine("Any");
    setRecipes([]);
    setError("");
    setSource(null);
    setSearchSeconds(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  }

  const selected = ingredientList();
  const difficultyColor: Record<Recipe["difficulty"], string> = {
    Easy: "bg-green-100 text-green-800",
    Medium: "bg-amber-100 text-amber-800",
    Hard: "bg-red-100 text-red-800",
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          Recipe Finder
        </h1>
        <p className="mt-2 text-base text-slate-600">
          What can I cook with what I have? Tell us what&apos;s in your
          kitchen — get 3 recipes you can make right now.
        </p>
      </header>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div>
          <label htmlFor="ingredients" className={labelClass}>
            Ingredients you have <span className="text-red-600">*</span>
          </label>
          <textarea
            id="ingredients"
            value={ingredients}
            onChange={(e) => setIngredients(e.target.value)}
            placeholder="e.g. rice, chicken, eggs, tomatoes, onion…"
            rows={3}
            maxLength={2000}
            className={inputClass}
          />
          <p className="mt-1 text-xs text-slate-400">
            Separate ingredients with commas.
          </p>
        </div>

        {selected.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2" aria-label="Selected ingredients">
            {selected.map((item) => (
              <span
                key={item.toLowerCase()}
                className="flex items-center gap-1.5 rounded-full bg-teal-50 px-3 py-1 text-xs font-medium text-teal-800"
              >
                {item}
                <button
                  type="button"
                  onClick={() => removeChip(item)}
                  aria-label={`Remove ${item}`}
                  className="font-bold hover:text-red-600"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}

        <div className="mt-4">
          <span className={labelClass}>Quick add</span>
          <div className="flex flex-wrap gap-2">
            {COMMON_INGREDIENTS.map((item) => {
              const added = selected.some(
                (i) => i.toLowerCase() === item.toLowerCase(),
              );
              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => (added ? removeChip(item) : addChip(item))}
                  aria-pressed={added}
                  title={added ? "Tap to remove" : "Tap to add"}
                  className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
                    added
                      ? "cursor-pointer border-teal-700 bg-teal-700 text-white hover:bg-teal-800"
                      : "border-slate-300 bg-white text-slate-700 hover:border-teal-700 hover:text-teal-700"
                  }`}
                >
                  {added ? `✓ ${item}` : `+ ${item}`}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="servings" className={labelClass}>
              Servings
            </label>
            <input
              id="servings"
              type="number"
              min={1}
              max={12}
              value={servings}
              onChange={(e) => setServings(e.target.value)}
              placeholder="0"
              className={inputClass}
            />
            <p className="mt-1 text-xs text-slate-400">
              Enter how many servings you want, from 1 to 12.
            </p>
          </div>
          <div>
            <label htmlFor="cuisine" className={labelClass}>
              Cuisine <span className="font-normal text-slate-500">(optional)</span>
            </label>
            <select
              id="cuisine"
              value={cuisine}
              onChange={(e) => setCuisine(e.target.value)}
              className={inputClass}
            >
              {CUISINES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4">
          <span className={labelClass}>Max time</span>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Max time">
            {MAX_TIMES.map(({ label, value }) => (
              <button
                key={label}
                type="button"
                onClick={() => setMaxTime(value)}
                aria-pressed={maxTime === value}
                className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                  maxTime === value
                    ? "border-teal-700 bg-teal-700 text-white"
                    : "border-slate-300 bg-white text-slate-700 hover:border-teal-700 hover:text-teal-700"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4">
          <span className={labelClass}>Diet</span>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Diet">
            {DIETS.map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDiet(d)}
                aria-pressed={diet === d}
                className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                  diet === d
                    ? "border-teal-700 bg-teal-700 text-white"
                    : "border-slate-300 bg-white text-slate-700 hover:border-teal-700 hover:text-teal-700"
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <p role="alert" className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">
            {error}
          </p>
        )}

        <button
          type="button"
          onClick={handleFind}
          disabled={loading}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-teal-700 px-4 py-3 text-base font-semibold text-white transition-colors hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-80"
        >
          {loading && (
            <svg
              aria-hidden="true"
              className="h-5 w-5 animate-spin text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          )}
          {loading ? "Finding recipes…" : "Find recipes"}
        </button>
        <p className="mt-2 text-center text-xs text-slate-400">
          No login. No signup. Your ingredients are only used to find these recipes.
        </p>
      </section>

      {loading && (
        <section aria-live="polite" className="mt-6">
          <p className="mb-4 flex items-center gap-2 text-sm font-medium text-slate-600">
            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-teal-700 border-t-transparent" />
            Searching for recipes you can make with what you have…
          </p>
          <div className="grid gap-5">
            {[0, 1, 2].map((i) => (
              <article
                key={i}
                className="animate-pulse rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
              >
                <div className="h-6 w-2/3 rounded bg-slate-200" />
                <div className="mt-2 h-4 w-1/3 rounded bg-slate-100" />
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="h-16 rounded-lg bg-slate-100" />
                  <div className="h-16 rounded-lg bg-slate-100" />
                </div>
                <div className="mt-4 space-y-2">
                  <div className="h-3 w-full rounded bg-slate-100" />
                  <div className="h-3 w-5/6 rounded bg-slate-100" />
                  <div className="h-3 w-4/6 rounded bg-slate-100" />
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {recipes.length > 0 && !loading && (
        <section id="print-recipes" className="mt-6">
          {source === "local" ? (
            <p className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm text-amber-800">
              ✓ Found 3 saved recipes
              {searchSeconds !== null ? ` in ${searchSeconds}s` : ""} — AI
              was busy, so here are saved recipes you can make with what you
              have. Try again later for fresh AI recipes.
            </p>
          ) : (
            <p className="mb-4 rounded-lg border border-green-200 bg-green-50 px-3 py-2.5 text-sm text-green-800">
              ✓ Found 3 fresh recipes
              {searchSeconds !== null ? ` in ${searchSeconds}s` : ""} — made
              with AI for the ingredients you have.
            </p>
          )}
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-lg font-semibold text-slate-900">
              3 recipes you can make now
            </h2>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:border-teal-700 hover:text-teal-700"
              >
                Print / Save as PDF
              </button>
              <button
                type="button"
                onClick={handleFind}
                disabled={loading}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:border-teal-700 hover:text-teal-700 disabled:opacity-60"
              >
                {loading ? "Regenerating…" : "Regenerate"}
              </button>
              <button
                type="button"
                onClick={handleClear}
                className="rounded-lg px-4 py-2 text-sm font-medium text-slate-500 hover:text-red-600"
              >
                Clear
              </button>
            </div>
          </div>

          <div className="grid gap-5">
            {recipes.map((recipe, index) => (
              <article
                key={`${recipe.title}-${index}`}
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <h3 className="text-xl font-semibold text-slate-900">
                    {recipe.title}
                  </h3>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${difficultyColor[recipe.difficulty]}`}
                  >
                    {recipe.difficulty}
                  </span>
                </div>
                <p className="mt-1 text-sm text-slate-500">
                  {recipe.timeMinutes} min · Serves {recipe.servings}
                </p>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-lg bg-teal-50 px-3 py-2.5">
                    <p className="text-xs font-semibold uppercase tracking-wide text-teal-800">
                      You have
                    </p>
                    <ul className="mt-1 list-disc pl-4 text-sm text-slate-700">
                      {recipe.ingredientsUsed.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                  <div
                    className={`rounded-lg px-3 py-2.5 ${
                      recipe.ingredientsNeeded.length
                        ? "bg-amber-50"
                        : "bg-slate-50"
                    }`}
                  >
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-700">
                      You&apos;ll need
                    </p>
                    {recipe.ingredientsNeeded.length ? (
                      <ul className="mt-1 list-disc pl-4 text-sm text-slate-700">
                        {recipe.ingredientsNeeded.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="mt-1 text-sm text-slate-600">
                        Nothing extra — you have everything.
                      </p>
                    )}
                  </div>
                </div>

                <h4 className="mt-4 text-sm font-semibold text-slate-900">
                  Ingredients
                </h4>
                <ul className="mt-1 list-disc pl-5 text-sm leading-6 text-slate-700">
                  {recipe.ingredients.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>

                <h4 className="mt-4 text-sm font-semibold text-slate-900">
                  Steps
                </h4>
                <ol className="mt-1 list-decimal space-y-1.5 pl-5 text-sm leading-6 text-slate-700">
                  {recipe.steps.map((step, i) => (
                    <li key={i}>{step}</li>
                  ))}
                </ol>

                {recipe.tip && (
                  <p className="mt-4 rounded-lg bg-slate-50 px-3 py-2.5 text-sm text-slate-600">
                    <span className="font-semibold text-slate-800">Tip: </span>
                    {recipe.tip}
                  </p>
                )}

                <button
                  type="button"
                  onClick={() => handleCopy(index)}
                  className="mt-4 rounded-lg bg-teal-700 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800"
                >
                  {copiedIndex === index ? "Copied!" : "Copy recipe"}
                </button>
              </article>
            ))}
          </div>
        </section>
      )}

      <footer className="mt-8 text-center text-xs text-slate-400">
        Built for home cooks everywhere. Check quantities and cooking times
        before you serve.
      </footer>
    </main>
  );
}
