#!/usr/bin/env node
/**
 * Helper: query Wikimedia Commons for candidate photos for every recipe that
 * has no image, so a human can curate data/placeholder-images.json.
 * Prints top candidates (title + 800px thumb URL) per recipe.
 */
const QUERIES = {
  'aperol-sour': 'amaretto sour',
  'asadero-margarita': 'margarita cocktail rocks',
  'brady-alexander': 'brandy alexander cocktail',
  'classic-margarita-joey-in-university-village': 'margarita cocktail lime',
  'cucumber-chill': 'cucumber gin cocktail',
  'dukes-imperfect-marg': 'margarita cocktail glass',
  'espresso-martini': 'espresso martini',
  'fluffy-margarita': 'pisco sour',
  'french-75': 'french 75 cocktail',
  'frozen-espresso-martini': 'frozen coffee cocktail',
  'gin-fizz': 'gin fizz cocktail',
  'gin-sour': 'gin sour cocktail',
  'harry-potter-butterbeer': 'butterbeer mug',
  'justins-pomeranian': 'grapefruit gin cocktail',
  'lillet-blanc-with-frozen-orange-slice': 'lillet blanc',
  'lychee-margarita': 'lychee cocktail',
  'mexican-martini': 'martini olives cocktail',
  'mexican-mule': 'moscow mule copper mug',
  'old-fashioned': 'old fashioned cocktail',
  'paper-plane': 'whiskey sour cocktail coupe',
  'pina-colada': 'pina colada',
  'ramos-gin-fizz': 'ramos gin fizz',
  'ranch-water': 'gin rickey highball lime',
  'spaghett': 'beer aperol spaghett',
  'the-dude-imbibes': 'white russian cocktail',
  'tom-collins': 'tom collins cocktail',
  'vesper-martini': 'vesper martini cocktail',
  'virgin-pina-colada': 'pina colada pineapple',
  'watermelon-cocktail': 'watermelon cocktail',
  'white-lady': 'white lady cocktail',
  'wisconsin-old-fashioned': 'brandy old fashioned',
  'pumpkin-syrup': 'syrup glass jar',
  'rich-demerara-syrup': 'demerara sugar',
  'tangy-citric-margarita-rim': 'salt rimmed glass',
};

const UA = 'JustinsCocktailsBot/1.0 (personal recipe site; placeholder curation)';

async function commonsSearch(q) {
  const url =
    'https://commons.wikimedia.org/w/api.php?action=query&format=json&generator=search' +
    `&gsrsearch=${encodeURIComponent('filetype:bitmap ' + q)}` +
    '&gsrnamespace=6&gsrlimit=6&prop=imageinfo&iiprop=url|size|mime&iiurlwidth=1200';
  let res;
  for (let attempt = 0; ; attempt++) {
    res = await fetch(url, { headers: { 'User-Agent': UA } });
    if (res.status === 429 && attempt < 4) {
      await new Promise((r) => setTimeout(r, 5000 * (attempt + 1)));
      continue;
    }
    break;
  }
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  const pages = Object.values(data?.query?.pages ?? {});
  return pages
    .map((p) => {
      const ii = p.imageinfo?.[0];
      if (!ii || !/image\/(jpeg|png|webp)/.test(ii.mime || '')) return null;
      return {
        title: p.title.replace('File:', ''),
        thumb: ii.thumburl || ii.url,
        w: ii.width,
        h: ii.height,
      };
    })
    .filter(Boolean);
}

const only = process.argv.slice(2);
for (const [slug, q] of Object.entries(QUERIES)) {
  if (only.length && !only.includes(slug)) continue;
  await new Promise((r) => setTimeout(r, 2000));
  try {
    const results = await commonsSearch(q);
    console.log(`\n## ${slug}  (q: ${q})`);
    for (const r of results.slice(0, 5)) {
      console.log(`  - ${r.title} [${r.w}x${r.h}]`);
      console.log(`    ${r.thumb}`);
    }
    if (!results.length) console.log('  (no results)');
  } catch (e) {
    console.log(`\n## ${slug}: ERROR ${e.message}`);
  }
}
