import type { Metadata } from "next";
import { cocktails, ingredientMaster, toCardData, nameOf } from "@/lib/recipes";
import { MyBarClient, type MatchableRecipe } from "@/components/MyBarClient";

export const metadata: Metadata = {
  title: "My Bar",
  description:
    "Tick the bottles you own and see which of Justin's cocktails you can make right now.",
};

export default function MyBarPage() {
  const matchable: MatchableRecipe[] = cocktails.map((r) => ({
    card: toCardData(r),
    needs: r.ingredientGroups
      .flatMap((g) => g.items)
      .filter((i) => i.role === "required" && i.canonical.length > 0)
      .map((i) => ({ label: i.raw, anyOf: i.canonical })),
  }));

  const nameById: Record<string, string> = {};
  for (const g of ingredientMaster) for (const i of g.items) nameById[i.id] = nameOf(i.id);

  return (
    <main className="mx-auto max-w-6xl px-5 py-10">
      <div className="max-w-2xl">
        <h1 className="font-serif text-4xl tracking-tight">My Bar</h1>
        <p className="mt-3 text-[15px] leading-relaxed text-ink-soft">
          Tick what you have. Garnishes and optional extras never count against you, and
          ice, water, and sugar are assumed. Your selections stay in this browser —
          nothing is stored anywhere else.
        </p>
      </div>
      <div className="mt-8">
        <MyBarClient master={ingredientMaster} recipes={matchable} nameById={nameById} />
      </div>
    </main>
  );
}
