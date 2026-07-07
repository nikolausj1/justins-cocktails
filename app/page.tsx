import { recipes, toCardData, SPIRIT_FILTERS } from "@/lib/recipes";
import { BrowseClient } from "@/components/BrowseClient";

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
        <h1 className="font-serif text-4xl leading-tight tracking-tight sm:text-5xl">
          Drinks worth the squeeze.
        </h1>
        <p className="mt-3 text-[15px] leading-relaxed text-ink-soft">
          Every recipe here has been made, tweaked, and argued over at Justin&rsquo;s home
          bar until it earned its place. Fresh citrus is non-negotiable; everything else
          is explained as you go.
        </p>
      </div>
      <div className="mt-8">
        <BrowseClient cards={cards} spiritLabels={spiritLabels} tagCounts={sortedTags} />
      </div>
    </main>
  );
}
