// Local fallback recipe library — used only when both AI paths fail
// (or no API key is set). No key, no network, no cost: Find Recipes
// always returns 3 real recipes instead of a 502.
//
// Every recipe's core ingredients come from the app's quick-add chips
// (rice, chicken, eggs, tomatoes, onion, garlic, pasta, potatoes, bread,
// cheese, beans, spinach, carrots, milk, butter, beef, salmon, mushrooms,
// peppers, lemon) plus everyday pantry items (salt, oil, spices, water).

export type Diet = "Any" | "Vegetarian" | "Vegan" | "Gluten-free";

export type FallbackRecipe = {
  title: string;
  timeMinutes: number;
  difficulty: "Easy" | "Medium" | "Hard";
  // Canonical core ingredient names (from the quick-add chip list).
  core: string[];
  ingredients: string[];
  steps: string[];
  tip?: string;
  vegetarian: boolean;
  vegan: boolean;
  glutenFree: boolean;
};

export type LocalRecipe = {
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

const V = { vegetarian: true, vegan: false, glutenFree: true };
const VG = { vegetarian: true, vegan: true, glutenFree: true };
const MEAT = { vegetarian: false, vegan: false, glutenFree: true };

export const FALLBACK_RECIPES: FallbackRecipe[] = [
  {
    title: "Egg Fried Rice",
    timeMinutes: 20,
    difficulty: "Easy",
    core: ["rice", "eggs", "onion", "garlic"],
    ingredients: [
      "3 cups cooked rice, cooled",
      "3 eggs, beaten",
      "1 onion, diced",
      "2 cloves garlic, minced",
      "2 tbsp oil",
      "1 tsp salt",
      "1/2 tsp black pepper",
    ],
    steps: [
      "Heat the oil in a large pan or wok over medium-high heat.",
      "Add the onion and garlic and cook for 2 minutes until soft.",
      "Push everything to one side, pour in the eggs and scramble until just set.",
      "Add the rice, salt and pepper, and stir-fry for 5 minutes, breaking up any clumps.",
      "Taste and adjust the salt, then serve hot.",
    ],
    tip: "Cold, day-old rice fries best — fresh rice turns sticky.",
    ...V,
  },
  {
    title: "Tomato Egg Stir-Fry",
    timeMinutes: 15,
    difficulty: "Easy",
    core: ["eggs", "tomatoes", "onion", "garlic"],
    ingredients: [
      "4 eggs, beaten",
      "3 tomatoes, chopped",
      "1 onion, sliced",
      "2 cloves garlic, minced",
      "1 tbsp oil",
      "1/2 tsp salt",
      "1/2 tsp sugar",
    ],
    steps: [
      "Heat the oil in a pan over medium heat and cook the onion and garlic for 2 minutes.",
      "Add the tomatoes and cook for 4 minutes until they soften and release juice.",
      "Pour in the beaten eggs and let them set for 30 seconds.",
      "Gently stir until the eggs are just cooked through.",
      "Season with salt and sugar and serve straight away.",
    ],
    tip: "Take it off the heat while the eggs still look slightly wet — they finish cooking in the pan.",
    ...V,
  },
  {
    title: "Chicken Tomato Stew",
    timeMinutes: 40,
    difficulty: "Medium",
    core: ["chicken", "tomatoes", "onion", "garlic", "peppers"],
    ingredients: [
      "500 g chicken pieces",
      "4 tomatoes, blended or chopped",
      "1 onion, chopped",
      "3 cloves garlic, minced",
      "1 pepper, chopped",
      "2 tbsp oil",
      "1 tsp salt",
      "1 tsp paprika",
    ],
    steps: [
      "Heat the oil in a pot and brown the chicken on all sides, then set aside.",
      "In the same pot, cook the onion, garlic and pepper for 3 minutes.",
      "Add the tomatoes, salt and paprika and simmer for 10 minutes.",
      "Return the chicken to the pot, cover and simmer for 20 minutes until cooked through.",
      "Serve hot with rice or bread.",
    ],
    tip: "Let the tomato sauce simmer until the oil starts to separate — that is when the flavour is ready.",
    ...MEAT,
  },
  {
    title: "Garlic Butter Pasta",
    timeMinutes: 20,
    difficulty: "Easy",
    core: ["pasta", "garlic", "butter", "cheese"],
    ingredients: [
      "250 g pasta",
      "4 cloves garlic, thinly sliced",
      "3 tbsp butter",
      "50 g cheese, grated",
      "1 tsp salt",
      "1/2 tsp black pepper",
    ],
    steps: [
      "Boil the pasta in salted water until al dente, then drain, saving a cup of pasta water.",
      "Melt the butter in the same pot and cook the garlic for 1 minute — do not let it brown.",
      "Add the pasta and a splash of pasta water and toss for 1 minute.",
      "Stir in the cheese until melted and glossy.",
      "Season with pepper and serve immediately.",
    ],
    tip: "The starchy pasta water is what makes the sauce coat the pasta instead of pooling.",
    vegetarian: true,
    vegan: false,
    glutenFree: false,
  },
  {
    title: "Cheesy Pasta",
    timeMinutes: 20,
    difficulty: "Easy",
    core: ["pasta", "cheese", "milk", "butter"],
    ingredients: [
      "250 g pasta",
      "150 g cheese, grated",
      "1 cup milk",
      "2 tbsp butter",
      "1 tsp salt",
      "1/2 tsp black pepper",
    ],
    steps: [
      "Boil the pasta in salted water until al dente and drain.",
      "Melt the butter in the pot, add the milk and warm it gently — do not boil.",
      "Add the cheese a handful at a time, stirring until melted.",
      "Return the pasta to the pot and toss until coated.",
      "Season with salt and pepper and serve hot.",
    ],
    tip: "Add the cheese off the boil so the sauce stays smooth instead of grainy.",
    vegetarian: true,
    vegan: false,
    glutenFree: false,
  },
  {
    title: "Creamy Mushroom Pasta",
    timeMinutes: 25,
    difficulty: "Easy",
    core: ["pasta", "mushrooms", "garlic", "milk", "cheese"],
    ingredients: [
      "250 g pasta",
      "250 g mushrooms, sliced",
      "2 cloves garlic, minced",
      "1 cup milk",
      "50 g cheese, grated",
      "2 tbsp oil",
      "1 tsp salt",
      "1/2 tsp black pepper",
    ],
    steps: [
      "Boil the pasta in salted water until al dente and drain.",
      "Heat the oil in a pan and fry the mushrooms for 5 minutes until golden.",
      "Add the garlic and cook for 1 minute.",
      "Pour in the milk, simmer for 3 minutes, then stir in the cheese.",
      "Toss the pasta through the sauce, season and serve.",
    ],
    tip: "Do not crowd the mushrooms or they steam instead of browning — use a wide pan.",
    vegetarian: true,
    vegan: false,
    glutenFree: false,
  },
  {
    title: "Tomato Pasta",
    timeMinutes: 20,
    difficulty: "Easy",
    core: ["pasta", "tomatoes", "garlic", "onion"],
    ingredients: [
      "250 g pasta",
      "4 tomatoes, chopped",
      "1 onion, diced",
      "3 cloves garlic, minced",
      "2 tbsp oil",
      "1 tsp salt",
      "1/2 tsp black pepper",
    ],
    steps: [
      "Boil the pasta in salted water until al dente and drain.",
      "Heat the oil and cook the onion and garlic for 3 minutes.",
      "Add the tomatoes and simmer for 8 minutes until saucy.",
      "Season, then toss the pasta through the sauce.",
      "Serve hot.",
    ],
    tip: "Crush a few of the tomatoes with a spoon as they cook for a thicker sauce.",
    vegetarian: true,
    vegan: true,
    glutenFree: false,
  },
  {
    title: "Mashed Potatoes",
    timeMinutes: 25,
    difficulty: "Easy",
    core: ["potatoes", "milk", "butter"],
    ingredients: [
      "800 g potatoes, peeled and cubed",
      "1/2 cup milk, warmed",
      "3 tbsp butter",
      "1 tsp salt",
      "1/2 tsp black pepper",
    ],
    steps: [
      "Boil the potatoes in salted water for 15 minutes until very tender.",
      "Drain well and return to the hot pot for 1 minute to dry out.",
      "Add the butter and warm milk.",
      "Mash until smooth, adding more milk if needed.",
      "Season with salt and pepper and serve.",
    ],
    tip: "Warm milk mashes in far better than cold milk and keeps the potatoes fluffy.",
    ...V,
  },
  {
    title: "Potato Egg Hash",
    timeMinutes: 25,
    difficulty: "Easy",
    core: ["potatoes", "eggs", "onion", "peppers"],
    ingredients: [
      "500 g potatoes, diced small",
      "4 eggs",
      "1 onion, diced",
      "1 pepper, diced",
      "2 tbsp oil",
      "1 tsp salt",
      "1/2 tsp paprika",
    ],
    steps: [
      "Heat the oil in a large pan and fry the potatoes for 10 minutes until golden, stirring often.",
      "Add the onion and pepper and cook for 5 minutes.",
      "Season with salt and paprika.",
      "Make 4 wells, crack an egg into each, cover and cook for 4 minutes until the whites set.",
      "Serve straight from the pan.",
    ],
    tip: "Small, even potato pieces are the secret — big chunks stay raw inside while the outside burns.",
    ...V,
  },
  {
    title: "Cheese Omelette",
    timeMinutes: 10,
    difficulty: "Easy",
    core: ["eggs", "cheese", "milk", "butter"],
    ingredients: [
      "3 eggs",
      "50 g cheese, grated",
      "2 tbsp milk",
      "1 tbsp butter",
      "1/4 tsp salt",
      "1/4 tsp black pepper",
    ],
    steps: [
      "Beat the eggs with the milk, salt and pepper.",
      "Melt the butter in a pan over medium heat.",
      "Pour in the eggs and stir gently until they start to set.",
      "Sprinkle the cheese over one half and fold the omelette over.",
      "Cook for 1 more minute and slide onto a plate.",
    ],
    tip: "Keep the heat at medium — high heat makes a rubbery omelette.",
    ...V,
  },
  {
    title: "Spinach Egg Scramble",
    timeMinutes: 10,
    difficulty: "Easy",
    core: ["eggs", "spinach", "onion", "cheese"],
    ingredients: [
      "4 eggs, beaten",
      "2 cups spinach",
      "1/2 onion, diced",
      "50 g cheese, grated",
      "1 tbsp oil",
      "1/4 tsp salt",
    ],
    steps: [
      "Heat the oil and cook the onion for 2 minutes.",
      "Add the spinach and cook for 1 minute until wilted.",
      "Pour in the eggs and stir gently over low heat.",
      "When almost set, sprinkle over the cheese and stir once.",
      "Serve immediately.",
    ],
    tip: "Low heat and constant stirring are what make scrambled eggs creamy.",
    ...V,
  },
  {
    title: "Bean Stew",
    timeMinutes: 35,
    difficulty: "Easy",
    core: ["beans", "tomatoes", "onion", "garlic", "peppers", "carrots"],
    ingredients: [
      "2 cups cooked beans",
      "3 tomatoes, chopped",
      "1 onion, diced",
      "2 cloves garlic, minced",
      "1 pepper, diced",
      "1 carrot, diced",
      "2 tbsp oil",
      "1 tsp salt",
      "1 tsp paprika",
    ],
    steps: [
      "Heat the oil and cook the onion, garlic, pepper and carrot for 5 minutes.",
      "Add the tomatoes and simmer for 10 minutes.",
      "Stir in the beans, salt and paprika.",
      "Simmer for 15 minutes until thick.",
      "Serve with rice or bread.",
    ],
    tip: "A splash of water during the last simmer stops the stew catching on the bottom.",
    ...VG,
  },
];

const MORE_RECIPES: FallbackRecipe[] = [
  {
    title: "Lemon Garlic Salmon",
    timeMinutes: 20,
    difficulty: "Medium",
    core: ["salmon", "lemon", "garlic", "butter"],
    ingredients: [
      "4 salmon fillets",
      "1 lemon, half juiced and half sliced",
      "3 cloves garlic, minced",
      "2 tbsp butter",
      "1 tsp salt",
      "1/2 tsp black pepper",
    ],
    steps: [
      "Season the salmon with salt and pepper.",
      "Melt the butter in a pan over medium-high heat.",
      "Cook the salmon skin-side down for 4 minutes, then flip for 3 minutes.",
      "Add the garlic and lemon juice and spoon the butter over the fish for 1 minute.",
      "Serve with the lemon slices.",
    ],
    tip: "Do not move the salmon while the skin is crisping — it releases on its own when ready.",
    ...MEAT,
  },
  {
    title: "Beef Stir-Fry",
    timeMinutes: 25,
    difficulty: "Medium",
    core: ["beef", "peppers", "onion", "garlic", "carrots"],
    ingredients: [
      "400 g beef, sliced thin",
      "1 pepper, sliced",
      "1 onion, sliced",
      "2 cloves garlic, minced",
      "1 carrot, sliced thin",
      "2 tbsp oil",
      "1 tsp salt",
      "1/2 tsp black pepper",
    ],
    steps: [
      "Heat the oil in a wok or large pan over high heat.",
      "Fry the beef in batches for 2 minutes per batch and set aside.",
      "Stir-fry the onion, pepper, carrot and garlic for 4 minutes.",
      "Return the beef, season and toss for 1 minute.",
      "Serve hot with rice.",
    ],
    tip: "Slice the beef against the grain and keep it thin so it stays tender.",
    ...MEAT,
  },
  {
    title: "Lemon Chicken",
    timeMinutes: 30,
    difficulty: "Easy",
    core: ["chicken", "lemon", "garlic", "butter"],
    ingredients: [
      "500 g chicken breast or thighs",
      "1 lemon, juiced",
      "3 cloves garlic, minced",
      "2 tbsp butter",
      "1 tbsp oil",
      "1 tsp salt",
      "1/2 tsp black pepper",
    ],
    steps: [
      "Season the chicken with salt and pepper.",
      "Heat the oil and brown the chicken for 5 minutes per side.",
      "Add the butter and garlic and cook for 1 minute.",
      "Pour in the lemon juice and simmer for 5 minutes until the chicken is cooked through.",
      "Spoon the pan sauce over the chicken and serve.",
    ],
    tip: "Let the chicken rest for 3 minutes before cutting so the juices stay in.",
    ...MEAT,
  },
  {
    title: "Chicken Fried Rice",
    timeMinutes: 25,
    difficulty: "Easy",
    core: ["chicken", "rice", "eggs", "onion", "garlic"],
    ingredients: [
      "3 cups cooked rice, cooled",
      "300 g chicken, diced",
      "2 eggs, beaten",
      "1 onion, diced",
      "2 cloves garlic, minced",
      "2 tbsp oil",
      "1 tsp salt",
    ],
    steps: [
      "Heat the oil and cook the chicken for 5 minutes until done, then set aside.",
      "Cook the onion and garlic for 2 minutes.",
      "Scramble the eggs in the pan until just set.",
      "Add the rice and chicken and stir-fry for 5 minutes.",
      "Season and serve hot.",
    ],
    tip: "Cook the chicken first and set it aside so it does not overcook while the rice fries.",
    ...MEAT,
  },
  {
    title: "Tomato Rice",
    timeMinutes: 30,
    difficulty: "Easy",
    core: ["rice", "tomatoes", "onion", "garlic", "peppers"],
    ingredients: [
      "2 cups rice",
      "3 tomatoes, blended or chopped",
      "1 onion, diced",
      "2 cloves garlic, minced",
      "1 pepper, diced",
      "2 tbsp oil",
      "1 tsp salt",
    ],
    steps: [
      "Rinse the rice until the water runs clear.",
      "Heat the oil and cook the onion, garlic and pepper for 3 minutes.",
      "Add the tomatoes and simmer for 5 minutes.",
      "Stir in the rice and 3 cups of water, season with salt and bring to a boil.",
      "Cover, turn the heat low and cook for 18 minutes, then rest for 5 minutes before serving.",
    ],
    tip: "Do not lift the lid while the rice steams — the trapped steam is what cooks it.",
    ...VG,
  },
  {
    title: "Garlic Butter Mushrooms on Toast",
    timeMinutes: 15,
    difficulty: "Easy",
    core: ["mushrooms", "garlic", "butter", "bread"],
    ingredients: [
      "300 g mushrooms, sliced",
      "2 cloves garlic, minced",
      "2 tbsp butter",
      "4 slices bread",
      "1/2 tsp salt",
      "1/2 tsp black pepper",
    ],
    steps: [
      "Toast the bread until golden.",
      "Melt the butter in a pan and fry the mushrooms for 5 minutes until golden.",
      "Add the garlic and cook for 1 minute.",
      "Season with salt and pepper.",
      "Spoon the mushrooms over the toast and serve.",
    ],
    tip: "Cook the mushrooms in a single layer so they brown instead of steaming.",
    vegetarian: true,
    vegan: false,
    glutenFree: false,
  },
  {
    title: "Carrot Potato Soup",
    timeMinutes: 30,
    difficulty: "Easy",
    core: ["carrots", "potatoes", "onion", "garlic"],
    ingredients: [
      "3 carrots, chopped",
      "3 potatoes, cubed",
      "1 onion, diced",
      "2 cloves garlic, minced",
      "4 cups water",
      "1 tbsp oil",
      "1 tsp salt",
    ],
    steps: [
      "Heat the oil and cook the onion and garlic for 3 minutes.",
      "Add the carrots and potatoes and stir for 1 minute.",
      "Pour in the water, season and bring to a boil.",
      "Simmer for 20 minutes until everything is soft.",
      "Blend until smooth and serve.",
    ],
    tip: "Blend in batches and leave the lid slightly open so steam can escape safely.",
    ...VG,
  },
  {
    title: "Spinach Pasta",
    timeMinutes: 20,
    difficulty: "Easy",
    core: ["pasta", "spinach", "garlic", "cheese", "milk"],
    ingredients: [
      "250 g pasta",
      "3 cups spinach",
      "2 cloves garlic, minced",
      "50 g cheese, grated",
      "1/2 cup milk",
      "1 tbsp oil",
      "1 tsp salt",
    ],
    steps: [
      "Boil the pasta in salted water until al dente and drain.",
      "Heat the oil and cook the garlic for 1 minute.",
      "Add the spinach and cook until wilted.",
      "Pour in the milk, simmer for 2 minutes, then stir in the cheese.",
      "Toss the pasta through the sauce and serve.",
    ],
    tip: "Add the spinach in handfuls — it looks like a lot but wilts down to almost nothing.",
    vegetarian: true,
    vegan: false,
    glutenFree: false,
  },
  {
    title: "Cheesy Baked Potatoes",
    timeMinutes: 45,
    difficulty: "Easy",
    core: ["potatoes", "cheese", "butter", "milk"],
    ingredients: [
      "4 large potatoes",
      "100 g cheese, grated",
      "2 tbsp butter",
      "3 tbsp milk",
      "1 tsp salt",
      "1/2 tsp black pepper",
    ],
    steps: [
      "Heat the oven to 200°C and bake the potatoes for 35 minutes until soft.",
      "Cut each potato open and scoop out the flesh.",
      "Mash the flesh with butter, milk and half the cheese.",
      "Spoon the mash back into the skins and top with the remaining cheese.",
      "Bake for 10 more minutes until golden.",
    ],
    tip: "Rub the potato skins with a little oil and salt before baking for a crisp skin.",
    ...V,
  },
  {
    title: "Cheesy Bean Toast",
    timeMinutes: 15,
    difficulty: "Easy",
    core: ["beans", "cheese", "bread", "tomatoes"],
    ingredients: [
      "1 cup cooked beans",
      "100 g cheese, grated",
      "4 slices bread",
      "1 tomato, sliced",
      "1 tbsp oil",
      "1/2 tsp salt",
    ],
    steps: [
      "Heat the oil and warm the beans with the salt for 3 minutes.",
      "Toast the bread until golden.",
      "Spoon the beans over the toast.",
      "Top with tomato slices and cheese.",
      "Grill for 3 minutes until the cheese melts.",
    ],
    tip: "Warm the beans first so the cheese melts quickly and the toast stays crisp.",
    vegetarian: true,
    vegan: false,
    glutenFree: false,
  },
  {
    title: "Garlic Butter Chicken",
    timeMinutes: 25,
    difficulty: "Easy",
    core: ["chicken", "garlic", "butter", "lemon"],
    ingredients: [
      "500 g chicken breast, sliced",
      "3 cloves garlic, minced",
      "3 tbsp butter",
      "1 lemon, juiced",
      "1 tsp salt",
      "1/2 tsp black pepper",
    ],
    steps: [
      "Season the chicken with salt and pepper.",
      "Melt half the butter in a pan and cook the chicken for 5 minutes per side.",
      "Add the remaining butter and garlic and cook for 1 minute.",
      "Pour in the lemon juice and toss for 1 minute.",
      "Serve hot.",
    ],
    tip: "Keep the pan hot so the chicken browns instead of steaming in its own juice.",
    ...MEAT,
  },
  {
    title: "Mushroom Rice",
    timeMinutes: 30,
    difficulty: "Easy",
    core: ["rice", "mushrooms", "onion", "garlic", "butter"],
    ingredients: [
      "2 cups rice",
      "250 g mushrooms, sliced",
      "1 onion, diced",
      "2 cloves garlic, minced",
      "2 tbsp butter",
      "3 cups water",
      "1 tsp salt",
    ],
    steps: [
      "Rinse the rice until the water runs clear.",
      "Melt the butter and fry the mushrooms for 5 minutes until golden.",
      "Add the onion and garlic and cook for 2 minutes.",
      "Stir in the rice and water, season and bring to a boil.",
      "Cover, cook on low for 18 minutes, then rest for 5 minutes.",
    ],
    tip: "Brown the mushrooms well first — that is where most of the flavour comes from.",
    ...V,
  },
  {
    title: "Egg and Cheese Sandwich",
    timeMinutes: 10,
    difficulty: "Easy",
    core: ["eggs", "cheese", "bread", "butter"],
    ingredients: [
      "2 eggs",
      "50 g cheese, sliced or grated",
      "2 slices bread",
      "1 tbsp butter",
      "1/4 tsp salt",
    ],
    steps: [
      "Butter the outside of the bread slices.",
      "Fry the eggs in a pan until the whites set.",
      "Place one egg and the cheese between the bread slices.",
      "Toast in the pan for 2 minutes per side until golden and the cheese melts.",
      "Serve hot.",
    ],
    tip: "Butter the outside of the bread, not the inside — that is what crisps it in the pan.",
    vegetarian: true,
    vegan: false,
    glutenFree: false,
  },
  {
    title: "Lemon Butter Salmon Pasta",
    timeMinutes: 25,
    difficulty: "Medium",
    core: ["salmon", "pasta", "lemon", "garlic", "butter"],
    ingredients: [
      "250 g pasta",
      "300 g salmon, cubed",
      "1 lemon, juiced",
      "2 cloves garlic, minced",
      "2 tbsp butter",
      "1 tsp salt",
      "1/2 tsp black pepper",
    ],
    steps: [
      "Boil the pasta in salted water until al dente and drain.",
      "Melt the butter and cook the salmon for 3 minutes until just done, then set aside.",
      "Cook the garlic in the same pan for 1 minute.",
      "Add the lemon juice, pasta and salmon and toss gently.",
      "Season and serve immediately.",
    ],
    tip: "Do not overcook the salmon — it should flake easily but still be moist inside.",
    vegetarian: false,
    vegan: false,
    glutenFree: false,
  },
];

FALLBACK_RECIPES.push(...MORE_RECIPES);

// ---- Matching -----------------------------------------------------------

function normalizeName(name: string): string {
  const n = name.trim().toLowerCase();
  const plurals: Record<string, string> = {
    tomatoes: "tomato",
    potatoes: "potato",
    carrots: "carrot",
    peppers: "pepper",
    mushrooms: "mushroom",
    beans: "bean",
    eggs: "egg",
    onions: "onion",
  };
  if (plurals[n]) return plurals[n];
  if (n.length > 3 && n.endsWith("s")) return n.slice(0, -1);
  return n;
}

// Does a full ingredient line (e.g. "2 cups cooked rice") use this core?
function ingredientUses(ingredientLine: string, core: string): boolean {
  const line = ingredientLine.toLowerCase();
  const c = normalizeName(core);
  if (line.includes(c)) return true;
  // Plural form in the line, e.g. "3 tomatoes".
  if (line.includes(`${c}es`) || line.includes(`${c}s`)) return true;
  return false;
}

function fitsDiet(recipe: FallbackRecipe, diet: Diet): boolean {
  if (diet === "Any") return true;
  if (diet === "Vegetarian") return recipe.vegetarian;
  if (diet === "Vegan") return recipe.vegan;
  if (diet === "Gluten-free") return recipe.glutenFree;
  return true;
}

export function findLocalRecipes(options: {
  ingredients: string | string[];
  servings: number;
  maxTime?: number | null;
  diet?: Diet;
}): LocalRecipe[] {
  const suppliedRaw =
    typeof options.ingredients === "string"
      ? options.ingredients.split(",")
      : options.ingredients;
  const supplied = suppliedRaw.map((s) => s.trim()).filter(Boolean);
  const suppliedNorm = supplied.map(normalizeName);
  const diet = options.diet ?? "Any";
  const servings = options.servings;
  const maxTime = options.maxTime ?? null;

  const scored = FALLBACK_RECIPES.map((recipe) => {
    const usedCore = recipe.core.filter((c) =>
      suppliedNorm.includes(normalizeName(c)),
    );
    const missingCore = recipe.core.filter(
      (c) => !suppliedNorm.includes(normalizeName(c)),
    );
    const ingredientsUsed = usedCore.map((c) => {
      const found = supplied.find((s) => normalizeName(s) === normalizeName(c));
      return found ?? c;
    });
    const ingredientsNeeded = recipe.ingredients.filter(
      (line) => !recipe.core.some((c) => ingredientUses(line, c) && usedCore.includes(c)),
    );
    return {
      recipe,
      used: usedCore.length,
      missing: missingCore.length,
      inTime: maxTime == null || recipe.timeMinutes <= maxTime,
      ingredientsUsed,
      ingredientsNeeded,
    };
  });

  const sortScored = (a: (typeof scored)[number], b: (typeof scored)[number]) =>
    Number(b.inTime) - Number(a.inTime) ||
    b.used - a.used ||
    a.missing - b.missing ||
    a.recipe.timeMinutes - b.recipe.timeMinutes;

  // Prefer recipes that fit the diet; only fill with non-fitting ones
  // if fewer than 3 fitting recipes exist at all.
  const fitting = scored.filter((s) => fitsDiet(s.recipe, diet)).sort(sortScored);
  let picked = fitting.slice(0, 3);
  if (picked.length < 3) {
    const rest = scored
      .filter((s) => !picked.includes(s))
      .sort(sortScored);
    picked = [...picked, ...rest].slice(0, 3);
  }

  return picked.map(({ recipe, ingredientsUsed, ingredientsNeeded }) => ({
    title: recipe.title,
    timeMinutes: recipe.timeMinutes,
    servings,
    difficulty: recipe.difficulty,
    ingredientsUsed: ingredientsUsed.length > 0 ? ingredientsUsed : [supplied[0] ?? ""],
    ingredientsNeeded,
    ingredients: recipe.ingredients,
    steps: recipe.steps,
    ...(recipe.tip ? { tip: recipe.tip } : {}),
  }));
}
