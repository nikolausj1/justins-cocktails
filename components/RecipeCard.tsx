import Link from "next/link";
import type { CardData } from "@/lib/recipes";
import { Glassware } from "./Glassware";
import { MiniStrength } from "./Meter";

export function RecipeCard({ card }: { card: CardData }) {
  return (
    <Link
      href={`/recipes/${card.slug}/`}
      className="group flex flex-col border border-hairline bg-white/40 transition-colors hover:border-fir"
    >
      <div className="relative aspect-[4/3] overflow-hidden border-b border-hairline bg-cream-deep">
        {card.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={card.image}
            alt={card.title}
            loading="lazy"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-ink-soft transition-colors group-hover:text-fir">
            <Glassware keyName={card.glasswareKey} className="h-24 w-24" />
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <h3 className="font-serif text-lg leading-snug group-hover:text-fir-deep">
          {card.title}
        </h3>
        <p className="text-xs uppercase tracking-[0.12em] text-ink-soft">
          {card.type === "ingredient"
            ? "Syrups & extras"
            : card.spirits.join(" · ") || "House special"}
        </p>
        {card.strength !== null && (
          <div className="mt-auto pt-2">
            <MiniStrength value={card.strength} />
          </div>
        )}
      </div>
    </Link>
  );
}
