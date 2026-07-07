import recipesJson from "@/content/recipes.json";
import ingredientsJson from "@/content/ingredients.json";

export type Role = "required" | "optional" | "garnish" | "assumed" | "note";

export interface IngredientItem {
  raw: string;
  role: Role;
  canonical: string[];
}

export interface IngredientGroup {
  label: string | null;
  items: IngredientItem[];
}

export interface Section {
  heading: string | null;
  kind: string;
  md: string;
}

export interface Recipe {
  slug: string;
  sourceFile: string;
  title: string;
  status: "tested" | "untested";
  dateAdded: string;
  category: string | null;
  servings: string | null;
  tags: string[];
  glassware: string | null;
  glasswareKey: string;
  storage: string | null;
  strength: number | null;
  taste: number | null;
  image: string | null;
  description: string | null;
  ingredientGroups: IngredientGroup[];
  related: { slug: string; label: string }[];
  video: string | null;
  sections: Section[];
  type: "cocktail" | "ingredient";
}

export interface IngredientDef {
  id: string;
  name: string;
}

export const recipes = recipesJson as unknown as Recipe[];
export const ingredientMaster = ingredientsJson as { group: string; items: IngredientDef[] }[];

export const cocktails = recipes.filter((r) => r.type === "cocktail");
export const extras = recipes.filter((r) => r.type === "ingredient");

export function getRecipe(slug: string): Recipe | undefined {
  return recipes.find((r) => r.slug === slug);
}

const canonicalName = new Map(
  ingredientMaster.flatMap((g) => g.items.map((i) => [i.id, i.name] as const))
);
export const nameOf = (id: string) => canonicalName.get(id) ?? id;

/** Canonical ingredients that have their own recipe page (P1 cross-linking). */
export const INGREDIENT_RECIPE_LINKS: Record<string, string> = {
  "demerara-syrup": "rich-demerara-syrup",
};

/* ---------- base-spirit facets ---------- */

export const SPIRIT_FILTERS: { label: string; ids: string[] }[] = [
  { label: "Tequila", ids: ["tequila-blanco", "tequila-reposado", "tequila-anejo"] },
  { label: "Gin", ids: ["gin"] },
  { label: "Vodka", ids: ["vodka"] },
  { label: "Whiskey", ids: ["bourbon", "rye-whiskey"] },
  { label: "Brandy & Cognac", ids: ["brandy", "cognac"] },
  { label: "Rum", ids: ["rum-white", "rum-dark"] },
  { label: "Aperitivo & Wine", ids: ["aperol", "lillet-blanc", "sparkling-wine", "amaro-nonino"] },
  { label: "Zero proof", ids: [] }, // matched by category
];

export function spiritLabelsFor(recipe: Recipe): string[] {
  if (recipe.category === "Non-Alcoholic") return ["Zero proof"];
  const used = new Set(
    recipe.ingredientGroups.flatMap((g) =>
      g.items.filter((i) => i.role === "required").flatMap((i) => i.canonical)
    )
  );
  const labels = SPIRIT_FILTERS.filter(
    (f) => f.ids.length && f.ids.some((id) => used.has(id))
  ).map((f) => f.label);
  return labels;
}

/** Precomputed card/search payload sent to the browse island. */
export interface CardData {
  slug: string;
  title: string;
  type: "cocktail" | "ingredient";
  glasswareKey: string;
  image: string | null;
  strength: number | null;
  dateAdded: string;
  tags: string[];
  spirits: string[];
  searchText: string;
}

export function toCardData(r: Recipe): CardData {
  const ingredientText = r.ingredientGroups
    .flatMap((g) => g.items.map((i) => i.raw))
    .join(" ");
  return {
    slug: r.slug,
    title: r.title,
    type: r.type,
    glasswareKey: r.glasswareKey,
    image: r.image,
    strength: r.strength,
    dateAdded: r.dateAdded,
    tags: r.tags,
    spirits: spiritLabelsFor(r),
    searchText: [r.title, ingredientText, r.tags.join(" "), r.description ?? ""]
      .join(" ")
      .toLowerCase(),
  };
}

/** Clean an ingredient raw line for display / shopping list use. */
export function cleanLine(raw: string): string {
  return raw
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\*\*/g, "")
    .trim();
}
