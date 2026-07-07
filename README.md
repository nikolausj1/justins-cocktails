# Justin's Cocktails

Justin's personal collection of tested cocktail recipes, published at
[justinscocktails.com](https://www.justinscocktails.com).

Static Next.js site (App Router, `output: "export"`, Tailwind CSS 4). No backend:
search, filters, My Bar, and the shopping list run client-side, with visitor
state in `localStorage`.

## Editing recipes

Recipe content lives in `content/recipes.json` — **this repo is the source of
truth** for published recipes. Edit the JSON (or re-import, below), commit, and
push to `main`; Vercel deploys automatically.

## Structure

- `content/recipes.json` — all recipe data (generated once from the Obsidian vault)
- `content/ingredients.json` — My Bar master list (generated)
- `content/import-report.md` — what the last import did and dropped
- `data/ingredients.mjs` — canonical ingredient definitions + normalization rules
- `scripts/import.mjs` — vault importer; rerunnable: `node scripts/import.mjs [path-to-Drinks]`
- `components/Glassware.tsx` — the line-drawn glassware illustration set
- `public/images/` — recipe photos downloaded from the vault at import time

## Development

```bash
npm install
npm run dev    # localhost:3000
npm run build  # static export to out/
```

## Re-importing from the vault

If the Obsidian vault needs to be re-synced:

```bash
node scripts/import.mjs "../Drinks"
```

The importer parses frontmatter and sections, converts the emoji strength/taste
meters to 1–10 integers, resolves `[[wikilinks]]` against published recipes
(dropping dead ones), downloads and compresses remote images, applies the
My Bar normalization rules, and writes a report to `content/import-report.md`
instead of failing silently. Note: local edits to `content/recipes.json` are
overwritten by a re-import.
