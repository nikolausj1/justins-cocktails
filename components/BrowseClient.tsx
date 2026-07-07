"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { CardData } from "@/lib/recipes";
import { RecipeCard } from "./RecipeCard";

type SortKey = "az" | "newest" | "strength";

const SORTS: { key: SortKey; label: string }[] = [
  { key: "az", label: "A–Z" },
  { key: "newest", label: "Newest" },
  { key: "strength", label: "Strongest" },
];

function sortCards(cards: CardData[], sort: SortKey): CardData[] {
  const copy = [...cards];
  if (sort === "newest") copy.sort((a, b) => b.dateAdded.localeCompare(a.dateAdded));
  else if (sort === "strength") copy.sort((a, b) => (b.strength ?? -1) - (a.strength ?? -1));
  else copy.sort((a, b) => a.title.localeCompare(b.title));
  return copy;
}

export function BrowseClient({
  cards,
  spiritLabels,
  tagCounts,
}: {
  cards: CardData[];
  spiritLabels: string[];
  tagCounts: [string, number][];
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [spirit, setSpirit] = useState<string | null>(null);
  const [tag, setTag] = useState<string>("");
  const [sort, setSort] = useState<SortKey>("az");

  // static export: read ?tag= client-side so the grid itself stays in the static HTML
  useEffect(() => {
    const t = new URLSearchParams(window.location.search).get("tag");
    if (t) setTag(t);
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return sortCards(
      cards.filter((c) => {
        if (q && !c.searchText.includes(q)) return false;
        if (spirit && !c.spirits.includes(spirit)) return false;
        if (tag && !c.tags.includes(tag)) return false;
        return true;
      }),
      sort
    );
  }, [cards, query, spirit, tag, sort]);

  const drinks = filtered.filter((c) => c.type === "cocktail");
  const extras = filtered.filter((c) => c.type === "ingredient");
  const filtering = Boolean(query.trim() || spirit || tag);

  const surprise = () => {
    const pool = drinks.length ? drinks : cards.filter((c) => c.type === "cocktail");
    const pick = pool[Math.floor(Math.random() * pool.length)];
    if (pick) router.push(`/recipes/${pick.slug}/`);
  };

  return (
    <div>
      {/* controls */}
      <div className="no-print flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search drinks, ingredients, moods…"
            aria-label="Search recipes"
            className="w-full max-w-md border border-hairline bg-white/60 px-4 py-2.5 text-[15px] placeholder:text-ink-soft/70 focus:border-fir focus:outline-none"
          />
          <select
            value={tag}
            onChange={(e) => setTag(e.target.value)}
            aria-label="Filter by tag"
            className="border border-hairline bg-white/60 px-3 py-2.5 text-sm text-ink-soft focus:border-fir focus:outline-none"
          >
            <option value="">All tags</option>
            {tagCounts.map(([t, n]) => (
              <option key={t} value={t}>
                {t} ({n})
              </option>
            ))}
          </select>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            aria-label="Sort recipes"
            className="border border-hairline bg-white/60 px-3 py-2.5 text-sm text-ink-soft focus:border-fir focus:outline-none"
          >
            {SORTS.map((s) => (
              <option key={s.key} value={s.key}>
                Sort: {s.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={surprise}
            className="cursor-pointer border border-fir px-4 py-2.5 text-sm text-fir transition-colors hover:bg-fir hover:text-cream"
          >
            Surprise me
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {spiritLabels.map((label) => (
            <button
              key={label}
              type="button"
              onClick={() => setSpirit(spirit === label ? null : label)}
              aria-pressed={spirit === label}
              className={`cursor-pointer border px-3 py-1.5 text-[13px] transition-colors ${
                spirit === label
                  ? "border-fir bg-fir text-cream"
                  : "border-hairline text-ink-soft hover:border-fir hover:text-fir"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* results */}
      {drinks.length === 0 && extras.length === 0 ? (
        <div className="mt-16 flex flex-col items-center gap-3 border border-dashed border-hairline px-6 py-16 text-center">
          <p className="font-serif text-xl italic">Nothing in the shaker.</p>
          <p className="max-w-sm text-sm text-ink-soft">
            No recipe matches that combination — try fewer filters, or search for an
            ingredient like &ldquo;lime&rdquo; or &ldquo;espresso&rdquo;.
          </p>
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setSpirit(null);
              setTag("");
            }}
            className="mt-2 cursor-pointer border border-fir px-4 py-2 text-sm text-fir transition-colors hover:bg-fir hover:text-cream"
          >
            Clear search &amp; filters
          </button>
        </div>
      ) : (
        <>
          {drinks.length > 0 && (
            <section className="mt-10">
              <div className="flex items-baseline justify-between">
                <h2 className="font-serif text-xl">
                  {filtering ? `${drinks.length} drink${drinks.length === 1 ? "" : "s"}` : "The drinks"}
                </h2>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {drinks.map((c) => (
                  <RecipeCard key={c.slug} card={c} />
                ))}
              </div>
            </section>
          )}
          {extras.length > 0 && (
            <section className="mt-14">
              <h2 className="font-serif text-xl">Syrups &amp; extras</h2>
              <p className="mt-1 text-sm text-ink-soft">
                House-made components the drinks above lean on.
              </p>
              <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {extras.map((c) => (
                  <RecipeCard key={c.slug} card={c} />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
