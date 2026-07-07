import type { MetadataRoute } from "next";
import { recipes } from "@/lib/recipes";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://www.justinscocktails.com";
  return [
    { url: `${base}/` },
    { url: `${base}/my-bar/` },
    { url: `${base}/shopping-list/` },
    ...recipes.map((r) => ({ url: `${base}/recipes/${r.slug}/` })),
  ];
}
