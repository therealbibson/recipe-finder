# Recipe Finder

Tell us what you have — get 3 recipes you can cook right now.

Dead-simple v1 for home cooks, worldwide. No login, no signup, no database.

## What it does

- One page: type the ingredients you have (comma-separated), or tap the quick-add chips for common ingredients — rice, chicken, eggs, tomatoes, onion, garlic, pasta, potatoes, bread, cheese, beans, spinach, carrots, milk, butter, and more
- Optional: servings (1–12 — enter your own number, the box starts empty), max time (15 / 30 / 45 / 60 min or Any), diet (Any, Vegetarian, Vegan, Gluten-free), cuisine (Any + Italian, Mexican, Chinese, Indian, Japanese, Mediterranean, American, Thai, French)
- Generates exactly 3 recipes built around the ingredients you have. It tries Google Gemini first, then Groq if Gemini fails, then a built-in library of saved recipes if both AI services fail — so a valid search always returns 3 recipes, never an error page. When the saved recipes are used, the page says so in a small amber note.
- Each recipe card shows: time, servings, difficulty (Easy / Medium / Hard), "You have" vs "You'll need" ingredients, the full ingredient list with quantities, numbered steps, and a tip when there is one
- Output: per-recipe Copy, Print / Save as PDF for all, Regenerate, Clear
- The last result is saved in the browser (localStorage) so a refresh does not lose it

## Stack

- Next.js 16 (App Router) + TypeScript + Tailwind CSS 4
- Google Gemini (`@google/generative-ai`, models `gemini-3.5-flash`, `gemini-3.6-flash`, `gemini-3.8-flash`, `gemini-3.5-flash-lite`, `gemini-flash-latest`) — first choice
- Groq (plain `fetch` to `https://api.groq.com/openai/v1/chat/completions`, no extra dependency; models `openai/gpt-oss-120b`, `openai/gpt-oss-20b`) — second choice, only if `GROQ_API_KEY` is set
- Built-in recipe library (`app/api/recipes/fallback-recipes.ts`, 26 recipes) — last resort, no key needed
- Input validation with Zod, on both the client and the API
- Single repo, Vercel-ready. No separate backend, no auth, no database in v1.

Fallback order: Gemini → Groq → local saved recipes. The API returns a `source` field (`"gemini"`, `"groq"` or `"local"`) with every success response. The app works with no keys at all — then every search returns saved recipes (`source: "local"`).

## Run locally

```bash
npm install
# Create .env.local and add your keys to it:
# GEMINI_API_KEY=your-key-here
# GROQ_API_KEY=your-key-here
# Get a free Gemini key from Google AI Studio: https://aistudio.google.com/app/apikey
# Get a free Groq key from: https://console.groq.com/keys
npm run dev
```

Open http://localhost:3000

You can copy `.env.example` to `.env.local` as a starting point — it only holds the key names, no real keys. `.env.example` is gitignored (like `.env.local`), so neither is committed.

## Deploy to Vercel

1. Push this repo to GitHub (do not commit `.env.local` or `.env.example` — both are gitignored).
2. Import it in Vercel.
3. Add the environment variables in the Vercel project settings (Production): `GEMINI_API_KEY`, and `GROQ_API_KEY` for the Groq fallback (get a free key at https://console.groq.com/keys).
4. Deploy. No other configuration needed. If you skip both keys, the app still works — it serves saved recipes only.

## API

`POST /api/recipes`

Body (JSON):

```json
{
  "ingredients": "rice, chicken, eggs, tomatoes (required, 3-2,000 chars)",
  "servings": 4,
  "maxTime": 30,
  "diet": "Any | Vegetarian | Vegan | Gluten-free (optional, default Any)",
  "cuisine": "Italian (optional)"
}
```

Success: `200 { "recipes": [ { "title", "timeMinutes", "servings", "difficulty": "Easy | Medium | Hard", "ingredientsUsed": [], "ingredientsNeeded": [], "ingredients": [], "steps": [], "tip?": "" } ], "source": "gemini" | "groq" | "local" }` — always exactly 3 recipes.

Errors (JSON `{ "error": "..." }`, no stack traces or keys):
- `400` — invalid / too-short / too-long input
- `502` — only if even the local fallback fails (it should not); a valid request with no keys set still returns `200` with `source: "local"`, never a 502/503.

## Deliberately left out of v1

- Login / signup, accounts, saved history on a server
- Database (the fallback recipe library is a fixed list in code, not a database)
- Payments / paywall
- Shopping lists, favourites, or meal planning for the week
- Separate Express backend

Add those only if v1 gets real use.
