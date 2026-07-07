import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  recipes,
  getRecipe,
  spiritLabelsFor,
  INGREDIENT_RECIPE_LINKS,
} from "@/lib/recipes";
import { Glassware } from "@/components/Glassware";
import { Meter } from "@/components/Meter";
import { RichText } from "@/components/RichText";
import { IngredientPanel } from "@/components/IngredientPanel";
import { YouTubeEmbed } from "@/components/YouTubeEmbed";

export function generateStaticParams() {
  return recipes.map((r) => ({ slug: r.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const recipe = getRecipe(slug);
  if (!recipe) return {};
  const desc = recipe.description
    ? recipe.description.replace(/[#*_\[\]]/g, "").slice(0, 155).trim()
    : `Justin's ${recipe.title} recipe.`;
  return {
    title: recipe.title,
    description: desc,
    openGraph: { title: recipe.title, description: desc },
  };
}

/** Cross-links from ingredient lines to house component recipes. */
const CROSS_LINKS = Object.entries(INGREDIENT_RECIPE_LINKS)
  .map(([, slug]) => {
    const target = getRecipe(slug);
    return target
      ? { pattern: "demerara syrup", slug, label: target.title }
      : null;
  })
  .filter(Boolean) as { pattern: string; slug: string; label: string }[];

export default async function RecipePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const recipe = getRecipe(slug);
  if (!recipe) notFound();

  const spirits = spiritLabelsFor(recipe);
  const meta = [
    recipe.type === "ingredient" ? "Cocktail component" : recipe.category,
    recipe.servings,
    recipe.glassware ? `Serve: ${recipe.glassware}` : null,
    recipe.storage ? `Store: ${recipe.storage}` : null,
  ].filter(Boolean);

  return (
    <main className="mx-auto max-w-3xl px-5 py-10">
      <nav className="no-print text-sm text-ink-soft">
        <Link href="/" className="hover:text-fir">
          ← All recipes
        </Link>
      </nav>

      {/* header */}
      <header className="mt-6">
        <p className="text-xs uppercase tracking-[0.16em] text-fir">
          {recipe.type === "ingredient"
            ? "Syrups & extras"
            : spirits.join(" · ") || "House special"}
        </p>
        <h1 className="mt-2 font-serif text-4xl leading-tight tracking-tight sm:text-5xl">
          {recipe.title}
        </h1>
        <p className="mt-3 text-sm text-ink-soft">{meta.join(" · ")}</p>
        {recipe.tags.length > 0 && (
          <p className="no-print mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[13px]">
            {recipe.tags.map((t) => (
              <Link
                key={t}
                href={`/?tag=${encodeURIComponent(t)}`}
                className="text-ink-soft underline decoration-hairline underline-offset-2 hover:text-fir hover:decoration-fir"
              >
                {t}
              </Link>
            ))}
          </p>
        )}
      </header>

      {/* hero + meters */}
      <div className="mt-8 grid gap-6 sm:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <div className="relative overflow-hidden border border-hairline bg-cream-deep">
          {recipe.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={recipe.image} alt={recipe.title} className="h-full w-full object-cover" />
          ) : (
            <div className="flex aspect-[4/3] items-center justify-center text-ink-soft">
              <Glassware keyName={recipe.glasswareKey} className="h-36 w-36" />
            </div>
          )}
        </div>
        {(recipe.strength !== null || recipe.taste !== null) && (
          <div className="flex flex-col justify-center gap-5 border border-hairline px-5 py-6">
            {recipe.strength !== null && (
              <Meter label="Strength" lowWord="Gentle" highWord="Boozy" value={recipe.strength} />
            )}
            {recipe.taste !== null && (
              <Meter label="Taste" lowWord="Sweet" highWord="Dry / Sour" value={recipe.taste} />
            )}
          </div>
        )}
      </div>

      {/* description */}
      {recipe.description && (
        <div className="mt-8">
          <RichText md={recipe.description} className="text-[15px]" />
        </div>
      )}

      {/* body sections in vault order */}
      {recipe.sections.map((section, i) => (
        <section key={i} className="mt-10 border-t border-hairline pt-8">
          {section.heading && (
            <h2 className="mb-4 font-serif text-2xl tracking-tight">{section.heading}</h2>
          )}
          {section.kind === "ingredients" ? (
            <IngredientPanel
              groups={recipe.ingredientGroups}
              recipeTitle={recipe.title}
              crossLinks={slug === "rich-demerara-syrup" ? [] : CROSS_LINKS}
            />
          ) : (
            <RichText md={section.md} className="text-[15px]" />
          )}
        </section>
      ))}

      {/* video */}
      {recipe.video && !recipe.sections.some((s) => s.md.includes(recipe.video!)) && (
        <section className="no-print mt-10 border-t border-hairline pt-8">
          <h2 className="mb-4 font-serif text-2xl tracking-tight">Video tutorial</h2>
          <YouTubeEmbed id={recipe.video} />
        </section>
      )}

      {/* related */}
      {recipe.related.length > 0 && (
        <section className="no-print mt-10 border-t border-hairline pt-8">
          <h2 className="mb-4 font-serif text-2xl tracking-tight">Goes well with</h2>
          <ul className="flex flex-wrap gap-2">
            {recipe.related.map((rel) => (
              <li key={rel.slug}>
                <Link
                  href={`/recipes/${rel.slug}/`}
                  className="inline-block border border-hairline px-3 py-1.5 text-sm transition-colors hover:border-fir hover:text-fir"
                >
                  {rel.label}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="no-print mt-12 border-t border-hairline pt-6 text-sm text-ink-soft">
        <p>Making this for people? Print this page — it strips down to just the recipe.</p>
      </div>
    </main>
  );
}
