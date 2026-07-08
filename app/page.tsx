import Link from "next/link";
import { recipes, cocktails, getRecipe, toCardData, spiritLabelsFor, SPIRIT_FILTERS } from "@/lib/recipes";
import { BrowseClient } from "@/components/BrowseClient";

/** The signature drinks — the ones people get this link for. */
const FEATURED: { slug: string; blurb: string }[] = [
  {
    slug: "justins-espresso-martini",
    blurb: "Mr. Black instead of Kahlua — that's the secret, and it's non-negotiable.",
  },
  {
    slug: "justins-gin-sour",
    blurb: "A coastal gin, fresh lemon, and a silky reverse-dry-shake foam.",
  },
  {
    slug: "justins-margaritas",
    blurb: "“Feel free to bastardize it if you must, but that's on you.”",
  },
];

function Featured() {
  const featured = FEATURED.map((f) => ({ ...f, recipe: getRecipe(f.slug)! })).filter(
    (f) => f.recipe
  );
  return (
    <section aria-label="House originals" className="mt-10">
      <div className="flex items-baseline gap-4">
        <h2 className="font-serif text-2xl tracking-tight">The house originals</h2>
        <span aria-hidden="true" className="hidden h-px flex-1 bg-hairline sm:block" />
      </div>
      <p className="mt-1 text-sm text-ink-soft">
        The three most requested — probably why someone handed you this link.
      </p>
      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        {featured.map(({ slug, blurb, recipe }, i) => (
          <Link
            key={slug}
            href={`/recipes/${slug}/`}
            className="group flex flex-col border border-hairline bg-white/40 transition-colors duration-300 hover:border-fir"
          >
            <div className="relative aspect-[4/3] overflow-hidden border-b border-hairline bg-cream-deep">
              {recipe.imageCard && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={recipe.imageCard}
                  alt={recipe.title}
                  loading={i === 0 ? "eager" : "lazy"}
                  fetchPriority={i === 0 ? "high" : "auto"}
                  className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
                />
              )}
              <span className="absolute left-3 top-3 bg-fir px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] text-cream">
                House original
              </span>
            </div>
            <div className="flex flex-1 flex-col gap-1.5 p-4">
              <p className="text-[11px] uppercase tracking-[0.14em] text-fir">
                {spiritLabelsFor(recipe).join(" · ")}
              </p>
              <h3 className="font-serif text-xl leading-snug transition-colors duration-200 group-hover:text-fir-deep">
                {recipe.title}
              </h3>
              <p className="mt-0.5 text-sm leading-relaxed text-ink-soft">{blurb}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

export default function Home() {
  const cards = recipes.map(toCardData);

  const tagCounts = new Map<string, number>();
  for (const r of recipes) for (const t of r.tags) tagCounts.set(t, (tagCounts.get(t) ?? 0) + 1);
  const sortedTags = [...tagCounts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));

  const usedSpirits = new Set(cards.flatMap((c) => c.spirits));
  const spiritLabels = SPIRIT_FILTERS.map((f) => f.label).filter((l) => usedSpirits.has(l));

  return (
    <main className="mx-auto max-w-6xl px-5 py-10">
      <div className="max-w-2xl">
        <p className="flex items-center gap-3 text-[11px] uppercase tracking-[0.18em] text-fir">
          Justin&rsquo;s home bar
          <span aria-hidden="true" className="h-px w-8 bg-fir/40" />
          {cocktails.length} recipes
        </p>
        <h1 className="mt-4 font-serif text-4xl leading-[1.05] tracking-tight sm:text-6xl">
          Drinks worth the squeeze.
        </h1>
        <p className="mt-4 text-[15px] leading-relaxed text-ink-soft">
          Every recipe here has been made, tweaked, and argued over at Justin&rsquo;s home
          bar until it earned its place. Fresh citrus is non-negotiable; everything else
          is explained as you go.
        </p>
      </div>
      <Featured />
      <div className="mt-12">
        <BrowseClient cards={cards} spiritLabels={spiritLabels} tagCounts={sortedTags} />
      </div>
    </main>
  );
}
