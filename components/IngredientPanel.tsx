"use client";

import { useState } from "react";
import Link from "next/link";
import type { IngredientGroup } from "@/lib/recipes";
import { addToList } from "@/lib/store";

/** Clean an ingredient raw line for display (client-safe copy of lib helper). */
function cleanLine(raw: string): string {
  return raw.replace(/\[([^\]]*)\]\(([^)]*)\)/g, "$1").replace(/\*\*/g, "").trim();
}

/** Render markdown links inside a raw line as real anchors. */
function LineText({ raw }: { raw: string }) {
  const parts = raw.split(/\[([^\]]*)\]\(([^)]*)\)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (i % 3 === 1) {
          return (
            <a
              key={i}
              href={parts[i + 1]}
              target="_blank"
              rel="noopener noreferrer"
              className="text-fir underline decoration-fir/40 underline-offset-2 hover:decoration-fir"
            >
              {part}
            </a>
          );
        }
        if (i % 3 === 2) return null;
        return <span key={i}>{part.replace(/\*\*/g, "")}</span>;
      })}
    </>
  );
}

const listable = (role: string) => role !== "note" && role !== "assumed";

export function IngredientPanel({
  groups,
  recipeTitle,
  crossLinks,
}: {
  groups: IngredientGroup[];
  recipeTitle: string;
  /** raw-line regex source -> recipe slug, e.g. demerara syrup -> its page */
  crossLinks: { pattern: string; slug: string; label: string }[];
}) {
  const [added, setAdded] = useState(false);

  const addAll = () => {
    addToList(
      groups
        .flatMap((g) => g.items)
        .filter((i) => listable(i.role))
        .map((i) => ({
          key: i.canonical[0] ?? cleanLine(i.raw).toLowerCase(),
          label: cleanLine(i.raw),
          recipe: recipeTitle,
        }))
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div>
      {groups.map((g, gi) => (
        <div key={gi} className={gi > 0 ? "mt-5" : ""}>
          {g.label && (
            <h3 className="mb-2 font-serif text-base italic text-ink-soft">{g.label}</h3>
          )}
          <ul className="space-y-2.5">
            {g.items.map((item, ii) => {
              const cross = crossLinks.find((c) =>
                new RegExp(c.pattern, "i").test(item.raw)
              );
              return (
                <li key={ii} className="flex gap-3 text-[17px] leading-relaxed">
                  <span
                    aria-hidden="true"
                    className="mt-[0.62em] h-[7px] w-[7px] shrink-0 rounded-full bg-fir"
                  />
                  <span>
                    <LineText raw={item.raw} />
                    {item.role === "garnish" && !/garnish/i.test(item.raw) && (
                      <span className="ml-1.5 text-xs text-ink-soft">(garnish)</span>
                    )}
                    {cross && (
                      <>
                        {" "}
                        <Link
                          href={`/recipes/${cross.slug}/`}
                          className="text-[13px] text-fir underline decoration-fir/40 underline-offset-2 hover:decoration-fir"
                        >
                          house recipe →
                        </Link>
                      </>
                    )}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
      <button
        type="button"
        onClick={addAll}
        className="no-print mt-6 w-full cursor-pointer border border-fir px-4 py-2.5 text-sm text-fir transition-colors hover:bg-fir hover:text-cream"
      >
        {added ? "Added ✓" : "Add to shopping list"}
      </button>
    </div>
  );
}
