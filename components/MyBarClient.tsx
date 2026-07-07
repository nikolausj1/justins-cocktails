"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { CardData, IngredientDef } from "@/lib/recipes";
import { getBar, toggleBarItem, clearBar, onStoreChange, addToList } from "@/lib/store";
import { Glassware } from "./Glassware";

export interface MatchableRecipe {
  card: CardData;
  /** required ingredient lines: any-of canonical ids per line */
  needs: { label: string; anyOf: string[] }[];
}

function missingFor(recipe: MatchableRecipe, owned: Set<string>) {
  return recipe.needs.filter((n) => !n.anyOf.some((id) => owned.has(id)));
}

export function MyBarClient({
  master,
  recipes,
  nameById,
}: {
  master: { group: string; items: IngredientDef[] }[];
  recipes: MatchableRecipe[];
  nameById: Record<string, string>;
}) {
  const [owned, setOwned] = useState<Set<string>>(new Set());
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const sync = () => setOwned(new Set(getBar()));
    sync();
    setHydrated(true);
    return onStoreChange(sync);
  }, []);

  const { canMake, missingOne, missingMore } = useMemo(() => {
    const canMake: MatchableRecipe[] = [];
    const missingOne: { r: MatchableRecipe; missing: string[] }[] = [];
    const missingMore: { r: MatchableRecipe; missing: string[] }[] = [];
    for (const r of recipes) {
      const missing = missingFor(r, owned).map(
        (n) => n.anyOf.map((id) => nameById[id] ?? id).join(" or ") || n.label
      );
      if (missing.length === 0) canMake.push(r);
      else if (missing.length === 1) missingOne.push({ r, missing });
      else missingMore.push({ r, missing });
    }
    return { canMake, missingOne, missingMore };
  }, [recipes, owned, nameById]);

  const addMissing = (missing: string[], recipeTitle: string) => {
    addToList(
      missing.map((label) => ({ key: label.toLowerCase(), label, recipe: recipeTitle }))
    );
  };

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
      {/* ingredient toggles */}
      <section aria-label="Ingredients you have">
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="font-serif text-xl">On your shelf</h2>
          {owned.size > 0 && (
            <button
              type="button"
              onClick={clearBar}
              className="cursor-pointer text-sm text-ink-soft underline underline-offset-2 hover:text-fir"
            >
              Clear all ({owned.size})
            </button>
          )}
        </div>
        <div className="mt-4 space-y-6">
          {master.map((group) => (
            <div key={group.group}>
              <h3 className="text-[11px] uppercase tracking-[0.14em] text-ink-soft">
                {group.group}
              </h3>
              <div className="mt-2 flex flex-wrap gap-2">
                {group.items.map((item) => {
                  const on = owned.has(item.id);
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => toggleBarItem(item.id)}
                      aria-pressed={on}
                      className={`cursor-pointer border px-3 py-1.5 text-[13px] transition-colors ${
                        on
                          ? "border-fir bg-fir text-cream"
                          : "border-hairline text-ink hover:border-fir hover:text-fir"
                      }`}
                    >
                      {item.name}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* results */}
      <section aria-label="What you can make" aria-live="polite">
        {!hydrated ? null : owned.size === 0 ? (
          <div className="border border-dashed border-hairline px-6 py-14 text-center">
            <p className="font-serif text-xl italic">What&rsquo;s on your shelf?</p>
            <p className="mx-auto mt-2 max-w-sm text-sm text-ink-soft">
              Tick the bottles and staples you have, and this side fills in with every
              drink you can make right now — plus the ones you&rsquo;re a single bottle away
              from.
            </p>
          </div>
        ) : (
          <div className="space-y-10">
            <div>
              <h2 className="font-serif text-xl">
                Ready to pour <span className="text-ink-soft">({canMake.length})</span>
              </h2>
              {canMake.length === 0 ? (
                <p className="mt-2 text-sm text-ink-soft">
                  Nothing yet — keep ticking, you&rsquo;re close.
                </p>
              ) : (
                <ul className="mt-3 divide-y divide-hairline border-y border-hairline">
                  {canMake.map(({ card }) => (
                    <li key={card.slug}>
                      <Link
                        href={`/recipes/${card.slug}/`}
                        className="group flex items-center gap-4 py-3"
                      >
                        <Glassware
                          keyName={card.glasswareKey}
                          className="h-10 w-10 shrink-0 text-ink-soft transition-colors group-hover:text-fir"
                        />
                        <span className="font-serif text-lg group-hover:text-fir-deep">
                          {card.title}
                        </span>
                        <span className="ml-auto text-xs uppercase tracking-[0.12em] text-fir">
                          make it →
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {[
              { title: "One bottle away", rows: missingOne },
              { title: "Worth a shopping trip", rows: missingMore },
            ].map(
              (bucket) =>
                bucket.rows.length > 0 && (
                  <div key={bucket.title}>
                    <h2 className="font-serif text-xl">
                      {bucket.title}{" "}
                      <span className="text-ink-soft">({bucket.rows.length})</span>
                    </h2>
                    <ul className="mt-3 divide-y divide-hairline border-y border-hairline">
                      {bucket.rows.map(({ r, missing }) => (
                        <li key={r.card.slug} className="py-3">
                          <div className="flex items-center gap-4">
                            <Glassware
                              keyName={r.card.glasswareKey}
                              className="h-10 w-10 shrink-0 text-ink-soft"
                            />
                            <div className="min-w-0">
                              <Link
                                href={`/recipes/${r.card.slug}/`}
                                className="font-serif text-lg hover:text-fir-deep"
                              >
                                {r.card.title}
                              </Link>
                              <p className="text-sm text-ink-soft">
                                needs {missing.join(", ")}
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => addMissing(missing, r.card.title)}
                              className="ml-auto shrink-0 cursor-pointer border border-hairline px-3 py-1.5 text-xs text-ink-soft transition-colors hover:border-fir hover:text-fir"
                              title="Add missing ingredients to shopping list"
                            >
                              + list
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )
            )}
          </div>
        )}
      </section>
    </div>
  );
}
