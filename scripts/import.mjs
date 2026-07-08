#!/usr/bin/env node
/**
 * One-time (rerunnable) importer: parses the Obsidian vault's Drinks/ folder
 * into content/recipes.json and downloads remote images into public/images/.
 *
 * Usage: node scripts/import.mjs [path-to-drinks-folder]
 *
 * Anything it cannot parse is listed in content/import-report.md rather than
 * silently dropped. After the initial import the site repo is the source of
 * truth; rerun only if the vault needs to be re-synced.
 */
import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { matchLine, CANONICAL, GROUPS } from '../data/ingredients.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SITE_ROOT = path.join(__dirname, '..');
const VAULT = process.argv[2] || path.join(SITE_ROOT, '..', 'Drinks');
const OUT_DIR = path.join(SITE_ROOT, 'content');
const IMG_DIR = path.join(SITE_ROOT, 'public', 'images');

const EXCLUDE_FILES = new Set(['-Bar Inventory.md', 'Untitled.md']);

// Temporary web-sourced photos for recipes the vault has no image for.
// Curated in data/placeholder-images.json; Justin swaps them out over time.
const PLACEHOLDERS = (() => {
  try {
    const raw = JSON.parse(fs.readFileSync(path.join(SITE_ROOT, 'data', 'placeholder-images.json'), 'utf8'));
    delete raw._comment;
    return raw;
  } catch {
    return {};
  }
})();

const report = { warnings: [], unmatchedIngredients: [], downloaded: [], missingImages: [], droppedLinks: [] };
const warn = (file, msg) => report.warnings.push(`- **${file}**: ${msg}`);

// ---------- slugs ----------
export function slugify(s) {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // strip diacritics (Piña -> Pina)
    .replace(/[’'‘]/g, '') // apostrophes incl. curly
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// ---------- meters ----------
function parseMeterLine(line) {
  // "N/10" annotation wins (Butterbeer uses 0-based annotations)
  const frac = line.match(/(\d+)\s*\/\s*10/);
  if (frac) return parseInt(frac[1], 10);
  const dots = [...line].filter((c) => c === '⚪' || c === '🔘');
  const idx = dots.indexOf('🔘');
  if (dots.length >= 8 && idx >= 0) return idx + 1;
  return null;
}

function parseMeters(md, file) {
  // Pair each label line with the next meter line.
  const lines = md.split('\n');
  let strength = null, taste = null;
  for (let i = 0; i < lines.length; i++) {
    if (!/[⚪🔘]/.test(lines[i])) continue;
    const context = (lines.slice(Math.max(0, i - 2), i + 1).join(' ')).toLowerCase();
    const val = parseMeterLine(lines[i]);
    if (val === null) continue;
    if (/strength/.test(context)) strength = val;
    else if (/taste/.test(context)) taste = val;
    else if (strength === null) strength = val;
    else taste = val;
  }
  if (strength === null && taste === null) warn(file, 'Strength & Taste section present but no meters parsed');
  return { strength, taste };
}

// ---------- glassware ----------
const GLASS_KEYS = [
  { key: 'copper-mug', re: /copper mug/i },
  { key: 'mug', re: /\bmugs?\b/i },
  { key: 'flute', re: /flute/i },
  { key: 'hurricane', re: /hurricane/i },
  { key: 'wine', re: /wine glass/i },
  { key: 'collins', re: /collins|highball|tall glass|topo chico|bottle or highball/i },
  { key: 'beer-bottle', re: /beer bottle/i },
  { key: 'martini', re: /martini/i },
  { key: 'coupe', re: /coupe|cocktail glass/i },
  { key: 'rocks', re: /rocks|lowball|old fashioned glass/i },
];
function glasswareKey(text, type) {
  if (type === 'ingredient') return 'bottle';
  if (!text) return 'misc';
  for (const g of GLASS_KEYS) if (g.re.test(text)) return g.key;
  return 'misc';
}

// ---------- images ----------
function extImageRefs(md) {
  const refs = [];
  // ![alt](url) and ![[obsidian embed]]
  const mdImg = /!\[([^\]]*)\]\(([^)]+)\)/g;
  const obsImg = /!\[\[([^\]]+)\]\]/g;
  let m;
  while ((m = mdImg.exec(md))) refs.push({ alt: m[1], src: m[2], raw: m[0] });
  while ((m = obsImg.exec(md))) refs.push({ alt: '', src: m[1], raw: m[0], obsidian: true });
  return refs;
}

async function downloadImage(url, slug, n) {
  try {
    let res;
    for (let attempt = 0; ; attempt++) {
      res = await fetch(url, {
        redirect: 'follow',
        headers: { 'User-Agent': 'JustinsCocktailsImporter/1.0 (personal recipe site)' },
      });
      if (res.status === 429 && attempt < 5) {
        await new Promise((r) => setTimeout(r, 8000 * (attempt + 1)));
        continue;
      }
      break;
    }
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const buf = Buffer.from(await res.arrayBuffer());
    const ct = res.headers.get('content-type') || '';
    const ext = ct.includes('png') ? 'png' : ct.includes('webp') ? 'webp' : ct.includes('gif') ? 'gif' : 'jpg';
    let name = `${slug}${n > 0 ? `-${n}` : ''}.${ext}`;
    let file = path.join(IMG_DIR, name);
    fs.writeFileSync(file, buf);
    // photos ship as reasonably-sized JPEGs (macOS sips; skipped gracefully elsewhere)
    if (ext !== 'gif') {
      const jpgName = name.replace(/\.\w+$/, '.jpg');
      const jpgFile = path.join(IMG_DIR, jpgName);
      const r = spawnSync('sips', ['-s', 'format', 'jpeg', '-s', 'formatOptions', '78', '-Z', '1600', file, '--out', jpgFile], { stdio: 'ignore' });
      if (r.status === 0 && fs.existsSync(jpgFile)) {
        if (jpgFile !== file) fs.unlinkSync(file);
        name = jpgName;
        file = jpgFile;
      }
    }
    // card-size companion for grid/featured tiles and recipe heros (the LCP)
    const cardName = name.replace(/(\.\w+)$/, '-card$1');
    spawnSync('sips', ['-s', 'format', 'jpeg', '-s', 'formatOptions', '64', '-Z', '600', file, '--out', path.join(IMG_DIR, cardName)], { stdio: 'ignore' });
    const size = fs.statSync(file).size;
    report.downloaded.push(`- ${name} (${Math.round(size / 1024)} KB) from ${url.slice(0, 80)}…`);
    return `/images/${name}`;
  } catch (e) {
    report.missingImages.push(`- ${slug}: failed to download ${url.slice(0, 100)} (${e.message})`);
    return null;
  }
}

// ---------- sections ----------
function splitSections(body) {
  // Split on H2 headings; keep preamble (title heading + hero image) separate.
  const lines = body.split('\n');
  const sections = [];
  let current = { heading: null, lines: [] };
  for (const line of lines) {
    const h2 = line.match(/^##\s+(?!#)(.+)$/);
    if (h2) {
      sections.push(current);
      current = { heading: h2[1].replace(/\*\*/g, '').trim(), lines: [] };
    } else {
      current.lines.push(line);
    }
  }
  sections.push(current);
  return sections.map((s) => ({
    heading: s.heading,
    md: s.lines.join('\n').replace(/^\s*---\s*$/gm, '').replace(/\n{3,}/g, '\n\n').trim(),
  }));
}

const sectionKind = (h) => {
  if (!h) return 'preamble';
  const t = h.toLowerCase();
  if (t === 'description') return 'description';
  if (t === 'ingredients') return 'ingredients';
  if (t === 'directions') return 'directions';
  if (t.includes('strength') && t.includes('taste')) return 'meters';
  if (t === 'related recipes') return 'related';
  if (t === 'video tutorial') return 'video';
  if (t === 'source') return 'source';
  return 'other';
};

// ---------- wikilinks ----------
function parseWikilinks(md) {
  const links = [];
  const re = /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g;
  let m;
  while ((m = re.exec(md))) {
    const target = m[1].split('/').pop().trim(); // "Drinks/Virgin Pina Colada" -> "Virgin Pina Colada"
    links.push({ target, label: (m[2] || target).trim() });
  }
  return links;
}

// Convert inline wikilinks in arbitrary markdown to plain text (targets resolved later can't
// be linked inside prose reliably; Related Recipes is handled structurally).
const stripInlineWikilinks = (md) => md.replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, (_, t, a) => (a || t.split('/').pop()));

// ---------- ingredient lines ----------
function parseIngredientLines(md) {
  // Returns { groups: [{label|null, items:[{raw}]}], glassware, storage }
  const groups = [];
  let currentGroup = { label: null, items: [] };
  let glassware = null, storage = null;
  for (const line of md.split('\n')) {
    const h3 = line.match(/^###\s+(.+)$/);
    if (h3) {
      if (currentGroup.items.length) groups.push(currentGroup);
      currentGroup = { label: h3[1].replace(/\*\*/g, '').trim(), items: [] };
      continue;
    }
    const gw = line.match(/\*\*Glassware:\*\*\s*(.+)/);
    if (gw) { glassware = gw[1].trim(); continue; }
    const st = line.match(/\*\*Storage:\*\*\s*(.+)/);
    if (st) { storage = st[1].trim(); continue; }
    const li = line.match(/^\s*-\s+(.+)$/);
    if (li) {
      // strip markdown links to plain text for the structured list; raw kept for display
      const raw = li[1].trim();
      currentGroup.items.push({ raw });
    }
  }
  if (currentGroup.items.length) groups.push(currentGroup);
  return { groups, glassware, storage };
}

// ---------- markdown -> html-ready md (site renders with marked at build) ----------
function cleanBodyMd(md, images) {
  let out = md;
  for (const ref of images) {
    if (ref.youtube) {
      out = out.replace(ref.raw, `<youtube data-id="${ref.youtube}"></youtube>`);
    } else if (ref.localPath) {
      out = out.replace(ref.raw, `![${ref.alt || ''}](${ref.localPath})`);
    } else {
      out = out.replace(ref.raw, ''); // broken local/obsidian ref or failed download
    }
  }
  // Obsidian non-embed asset links like [[z Assets/...|Open: ...]]
  out = out.replace(/\[\[z Assets\/[^\]]+\]\]/g, '');
  out = out.replace(/\*Image is missing\*/g, '');
  return out.replace(/\n{3,}/g, '\n\n').trim();
}

const YT_RE = /https?:\/\/(?:www\.)?youtube\.com\/embed\/([A-Za-z0-9_-]{6,})/;

async function processImages(md, slug) {
  const refs = extImageRefs(md);
  let n = 0;
  for (const ref of refs) {
    const yt = ref.src.match(YT_RE);
    if (yt) { ref.youtube = yt[1]; continue; }
    if (/^https?:\/\//.test(ref.src)) {
      ref.localPath = await downloadImage(ref.src, slug, n++);
    } else {
      ref.localPath = null;
      report.missingImages.push(`- ${slug}: local image not in vault: ${decodeURIComponent(ref.src)}`);
    }
  }
  return refs;
}

// ---------- main ----------
async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.mkdirSync(IMG_DIR, { recursive: true });

  const files = fs.readdirSync(VAULT).filter((f) => f.endsWith('.md') && !EXCLUDE_FILES.has(f));
  const recipes = [];

  for (const file of files.sort()) {
    const rawText = fs.readFileSync(path.join(VAULT, file), 'utf8');
    let fm, body;
    try {
      ({ data: fm, content: body } = matter(rawText));
    } catch (e) {
      warn(file, `frontmatter parse failed (${e.message}); treating whole file as body`);
      fm = {}; body = rawText;
    }

    // Title: frontmatter wins; else first heading; else filename.
    let title = fm.title;
    if (!title) {
      const h = body.match(/^#{1,3}\s+(.+)$/m);
      title = h ? h[1].replace(/\*\*/g, '').trim() : file.replace(/\.md$/, '');
      warn(file, `no frontmatter title; using "${title}"`);
    }
    const slug = slugify(title);

    // Strip the redundant title heading (first H1/H2 whose text ~ title or filename)
    const bodyNoTitle = body.replace(/^#{1,2}\s+(?!#).+\n/m, (m0, offset) => {
      const before = body.slice(0, offset).replace(/\s|-/g, '');
      return before === '' || /^[\s-]*$/.test(body.slice(0, offset)) ? '' : m0;
    });

    const imageRefs = await processImages(bodyNoTitle, slug);
    const cleaned = cleanBodyMd(bodyNoTitle, imageRefs);
    const sections = splitSections(cleaned)
      .filter((s) => s.heading || s.md)
      // Related Recipes keeps its wikilinks for structural parsing; prose sections get plain text
      .map((s) => (sectionKind(s.heading) === 'related' ? s : { ...s, md: stripInlineWikilinks(s.md) }));

    const rec = {
      slug,
      sourceFile: file,
      title,
      status: 'tested',
      dateAdded: String(fm['date added'] || fm.date_added || ''),
      category: fm.category || null,
      servings: typeof fm.servings === 'number' ? `${fm.servings} servings` : (fm.servings || null),
      tags: (Array.isArray(fm.tags) ? fm.tags : [])
        .map((t) => String(t).replace(/^drinks\/?/, '').trim())
        .filter(Boolean),
      glassware: null,
      storage: null,
      strength: null,
      taste: null,
      image: imageRefs.find((r) => r.localPath)?.localPath || null,
      imageCard: null, // filled below when a card-size copy exists
      description: null,
      ingredientGroups: [],
      related: [], // resolved after all recipes parsed
      relatedRaw: [],
      video: null,
      sections: [], // ordered {heading, kind, md} for full-fidelity rendering
    };

    for (const s of sections) {
      const kind = sectionKind(s.heading);
      if (kind === 'preamble' && !s.md) continue;
      switch (kind) {
        case 'description': {
          const gw = s.md.match(/\*\*Glassware:\*\*\s*(.+)/);
          if (gw) rec.glassware = gw[1].trim();
          rec.description = s.md.replace(/\*\*Glassware:\*\*\s*.+/g, '').trim();
          break;
        }
        case 'ingredients': {
          const parsed = parseIngredientLines(s.md);
          if (parsed.glassware) rec.glassware = parsed.glassware;
          if (parsed.storage) rec.storage = parsed.storage;
          rec.ingredientGroups = parsed.groups;
          rec.sections.push({ heading: s.heading, kind, md: s.md });
          break;
        }
        case 'meters': {
          const { strength, taste } = parseMeters(s.md, file);
          rec.strength = strength;
          rec.taste = taste;
          // keep any non-meter content (e.g. a photo living inside this section)
          const residual = s.md
            .split('\n')
            .filter((l) => /!\[[^\]]*\]\(/.test(l))
            .join('\n\n');
          if (residual) rec.sections.push({ heading: null, kind: 'other', md: residual });
          break;
        }
        case 'related': {
          rec.relatedRaw = parseWikilinks(s.md);
          break;
        }
        case 'video': {
          const yt = s.md.match(/data-id="([^"]+)"/);
          if (yt) rec.video = yt[1];
          else if (s.md) warn(file, 'Video Tutorial section without recognizable YouTube embed');
          break;
        }
        default: {
          // preamble images already extracted; keep any other prose, but not a
          // duplicate of the hero image already rendered at the top of the page
          if (kind === 'preamble') {
            const md = rec.image
              ? s.md.replace(new RegExp(`!\\[[^\\]]*\\]\\(${rec.image.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\)`), '').trim()
              : s.md;
            if (md) rec.sections.push({ heading: null, kind: 'other', md });
          } else {
            const yt = s.md.match(/data-id="([^"]+)"/);
            if (yt && !rec.video) rec.video = yt[1];
            // drop sections left empty after broken-image cleanup (e.g. Source with lost photos)
            if (s.md) rec.sections.push({ heading: s.heading, kind, md: s.md });
            else report.warnings.push(`- **${file}**: section "${s.heading}" empty after cleanup; omitted`);
          }
        }
      }
    }

    // Sub-recipe sections that carry their own Ingredients (e.g. Pumpkin Syrup versions):
    // if no top-level Ingredients section was found, harvest bullets from H3 Ingredients blocks.
    if (!rec.ingredientGroups.length) {
      for (const s of rec.sections) {
        if (/###\s+.*Ingredients/i.test(s.md) || /^Ingredients$/im.test(s.heading || '')) {
          const parsed = parseIngredientLines(s.md);
          if (parsed.groups.length) rec.ingredientGroups.push(...parsed.groups.map((g) => ({ ...g, label: g.label || s.heading })));
        }
      }
    }
    // Last resort (e.g. the marg salt file): first section with quantified bullets
    if (!rec.ingredientGroups.length) {
      for (const s of rec.sections) {
        const parsed = parseIngredientLines(s.md);
        const quantified = parsed.groups.flatMap((g) => g.items).filter((i) => /\b(tsp|tbsp|teaspoons?|tablespoons?|cups?|oz|parts?)\b/i.test(i.raw));
        if (quantified.length >= 2) { rec.ingredientGroups = parsed.groups; break; }
      }
    }

    // no vault image? use the curated web placeholder until Justin shoots his own
    rec.imageIsPlaceholder = false;
    if (!rec.image && PLACEHOLDERS[slug]) {
      await new Promise((r) => setTimeout(r, 1500)); // stay under Wikimedia rate limits
      const local = await downloadImage(PLACEHOLDERS[slug].url, slug, 0);
      if (local) {
        rec.image = local;
        rec.imageIsPlaceholder = true;
      }
    }

    if (rec.image) {
      const cardPath = rec.image.replace(/(\.\w+)$/, '-card$1');
      if (fs.existsSync(path.join(SITE_ROOT, 'public', cardPath))) rec.imageCard = cardPath;
    }

    // classify
    const isComponent = rec.category === 'Cocktail Component' || (!rec.glassware && rec.strength === null && rec.taste === null);
    rec.type = isComponent ? 'ingredient' : 'cocktail';
    rec.glasswareKey = glasswareKey(rec.glassware, rec.type);

    // canonical ingredient matching for My Bar (cocktails only)
    for (const g of rec.ingredientGroups) {
      for (const item of g.items) {
        const { role, ids } = matchLine(item.raw);
        item.role = role;
        if (ids === null) {
          item.canonical = [];
          if (rec.type === 'cocktail' && role === 'required') {
            report.unmatchedIngredients.push(`- ${rec.slug}: "${item.raw}"`);
          }
        } else {
          item.canonical = ids.filter((id) => {
            if (!CANONICAL[id]) { warn(file, `rule maps to unknown canonical id "${id}"`); return false; }
            return true;
          });
        }
      }
    }

    if (!rec.description) warn(file, 'no Description section found');
    if (rec.type === 'cocktail' && !rec.ingredientGroups.length) warn(file, 'no ingredients parsed');
    if (rec.type === 'cocktail' && (rec.strength === null || rec.taste === null)) warn(file, `meters incomplete (strength=${rec.strength}, taste=${rec.taste})`);
    recipes.push(rec);
  }

  // resolve related links against published slugs
  const bySlug = new Map(recipes.map((r) => [r.slug, r]));
  const byTitle = new Map(recipes.map((r) => [slugify(r.title), r.slug]));
  // wikilinks target vault filenames, which sometimes differ from frontmatter titles
  const byFile = new Map(recipes.map((r) => [slugify(r.sourceFile.replace(/\.md$/, '')), r.slug]));
  for (const r of recipes) {
    for (const link of r.relatedRaw) {
      const key = slugify(link.target);
      const target = byTitle.get(key) || byFile.get(key) || (bySlug.has(key) ? key : null);
      if (target && target !== r.slug) r.related.push({ slug: target, label: bySlug.get(target).title });
      else report.droppedLinks.push(`- ${r.slug}: dropped related link "${link.target}" (not published)`);
    }
    delete r.relatedRaw;
  }

  recipes.sort((a, b) => a.title.localeCompare(b.title));
  fs.writeFileSync(path.join(OUT_DIR, 'recipes.json'), JSON.stringify(recipes, null, 2));

  // Ingredient master list for My Bar: only ids actually used by published cocktails.
  const usedIds = new Set(
    recipes.filter((r) => r.type === 'cocktail')
      .flatMap((r) => r.ingredientGroups.flatMap((g) => g.items.flatMap((i) => i.canonical || [])))
  );
  const ingredients = GROUPS.map((group) => ({
    group,
    items: Object.entries(CANONICAL)
      .filter(([id, def]) => def.group === group && usedIds.has(id))
      .map(([id, def]) => ({ id, name: def.name })),
  })).filter((g) => g.items.length);
  fs.writeFileSync(path.join(OUT_DIR, 'ingredients.json'), JSON.stringify(ingredients, null, 2));

  const lines = [
    `# Import report`,
    ``,
    `Generated by scripts/import.mjs from ${VAULT}`,
    ``,
    `**${recipes.length} recipes imported** (${recipes.filter((r) => r.type === 'cocktail').length} cocktails, ${recipes.filter((r) => r.type === 'ingredient').length} syrups & extras)`,
    ``,
    `## Warnings`, ...(report.warnings.length ? report.warnings : ['- none']),
    ``,
    `## Images downloaded`, ...(report.downloaded.length ? report.downloaded : ['- none']),
    ``,
    `## Missing/failed images (glassware illustration used instead)`, ...(report.missingImages.length ? report.missingImages : ['- none']),
    ``,
    `## Dropped related-recipe links`, ...(report.droppedLinks.length ? report.droppedLinks : ['- none']),
    ``,
    `## Unmatched required ingredients (invisible to My Bar until mapped)`, ...(report.unmatchedIngredients.length ? report.unmatchedIngredients : ['- none']),
  ];
  fs.writeFileSync(path.join(OUT_DIR, 'import-report.md'), lines.join('\n'));
  console.log(`Imported ${recipes.length} recipes.`);
  console.log(`Warnings: ${report.warnings.length}, missing images: ${report.missingImages.length}, dropped links: ${report.droppedLinks.length}`);
  console.log(`See content/import-report.md`);
}

main().catch((e) => { console.error(e); process.exit(1); });
