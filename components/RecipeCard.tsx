import Link from "next/link";
import type { CardData } from "@/lib/recipes";
import { Glassware } from "./Glassware";

export function RecipeCard({ card }: { card: CardData }) {
  const kicker =
    card.type === "ingredient"
      ? "Syrups & extras"
      : card.spirits.join(" · ") || "House special";

  return (
    <Link
      href={`/recipes/${card.slug}/`}
      className="group flex flex-col border border-hairline bg-white/40 transition-colors duration-300 hover:border-fir"
    >
      <div className="relative aspect-[4/3] overflow-hidden border-b border-hairline bg-cream-deep">
        {card.imageCard ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={card.imageCard}
            alt={card.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-ink-soft/80 transition-colors duration-300 group-hover:text-fir">
            <Glassware keyName={card.glasswareKey} className="h-24 w-24" />
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-4">
        <p className="text-[11px] uppercase tracking-[0.14em] text-fir">{kicker}</p>
        <h3 className="font-serif text-lg leading-snug text-ink transition-colors duration-200 group-hover:text-fir-deep">
          {card.title}
        </h3>
      </div>
    </Link>
  );
}
