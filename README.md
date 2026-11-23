# Recipe Finder

Tell us what you have — get 3 recipes you can cook right now.

Dead-simple v1 for home cooks, worldwide. No login, no signup, no database.

## What it does

- One page: type the ingredients you have (comma-separated), or tap the quick-add chips for common ingredients — rice, chicken, eggs, tomatoes, onion, garlic, pasta, potatoes, bread, cheese, beans, spinach, carrots, milk, butter, and more
- Optional: servings (1–12, default 4), max time (15 / 30 / 45 / 60 min or Any), diet (Any, Vegetarian, Vegan, Gluten-free), cuisine (Any + Italian, Mexican, Chinese, Indian, Japanese, Mediterranean, American, Thai, French)
- Generates exactly 3 recipes built around the ingredients you have, using Google Gemini
- Each recipe card shows: time, servings, difficulty (Easy / Medium / Hard), "You have" vs "You'll need" ingredients, the full ingredient list with quantities, numbered steps, and a tip when there is one
- Output: per-recipe Copy, Print / Save as PDF for all, Regenerate, Clear
- The last result is saved in the browser (localStorage) so a refresh does not lose it

## Stack

- Next.js 16 (App Router) + TypeScript + Tailwind CSS 4
- Google Gemini (`@google/generative-ai`, model `gemini-2.5-flash`, with fallback to `gemini-2.0-flash`)
- Input validation with Zod, on both the client and the API
- Single repo, Vercel-ready. No separate backend, no auth, no database in v1.

## Run locally

```bash
npm install
# Create .env.local and add your key to it:
# GEMINI_API_KEY=your-key-here
# Get a free key from Google AI Studio: https://aistudio.google.com/app/apikey
npm run dev
```

Open http://localhost:3000

You can copy `.env.example` to `.env.local` as a starting point — it only holds the key name, no real key. `.env.example` is gitignored (like `.env.local`), so neither is committed.

## Deploy to Vercel

1. Push this repo to GitHub (do not commit `.env.local` or `.env.example` — both are gitignored).
2. Import it in Vercel.
3. Add the environment variable `GEMINI_API_KEY` in the Vercel project settings.
4. Deploy. No other configuration needed.

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

Success: `200 { "recipes": [ { "title", "timeMinutes", "servings", "difficulty": "Easy | Medium | Hard", "ingredientsUsed": [], "ingredientsNeeded": [], "ingredients": [], "steps": [], "tip?": "" } ] }` — always exactly 3 recipes.

Errors (JSON `{ "error": "..." }`, no stack traces or keys):
- `400` — invalid / too-short / too-long input
- `503` — `GEMINI_API_KEY` is not configured
- `502` — Gemini failed, or returned a response that could not be parsed as 3 valid recipes

## Deliberately left out of v1

- Login / signup, accounts, saved history on a server
- Database / a fixed recipe library (recipes are generated from the ingredients you enter)
- Payments / paywall
- Shopping lists, favourites, or meal planning for the week
- Separate Express backend

Add those only if v1 gets real use.
