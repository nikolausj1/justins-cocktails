import { ImageResponse } from "next/og";
import { recipes, getRecipe, spiritLabelsFor } from "@/lib/recipes";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return recipes.map((r) => ({ slug: r.slug }));
}

export default async function OgImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const recipe = getRecipe(slug);
  const title = recipe?.title ?? "Justin's Cocktails";
  const kicker = recipe
    ? recipe.type === "ingredient"
      ? "Syrups & extras"
      : spiritLabelsFor(recipe).join(" · ") || "House special"
    : "";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#faf7f1",
          color: "#211d17",
          padding: 72,
          fontFamily: "Georgia, serif",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 30,
            letterSpacing: 4,
            textTransform: "uppercase",
            color: "#3f5c46",
          }}
        >
          {kicker}
        </div>
        <div style={{ display: "flex", fontSize: 92, lineHeight: 1.05, maxWidth: 1000 }}>
          {title}
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderTop: "2px solid #e3dccd",
            paddingTop: 28,
            fontSize: 32,
          }}
        >
          <div style={{ display: "flex" }}>Justin&rsquo;s Cocktails</div>
          <div style={{ display: "flex", color: "#3f5c46", fontStyle: "italic" }}>
            justinscocktails.com
          </div>
        </div>
      </div>
    ),
    size
  );
}
