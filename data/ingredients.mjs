/**
 * Canonical ingredient master list + normalization rules for My Bar.
 *
 * Generous matching defaults (per Justin, 2026-07-07):
 *  - "Bourbon or rye whiskey" is satisfiable by either (any-of).
 *  - Specific bottles satisfy their category: Cointreau => orange liqueur,
 *    Kahlua / Mr. Black => coffee liqueur, Hornitos Plata => blanco tequila.
 *  - Ice, water, and plain sugar are assumed on hand and never counted.
 *  - Garnish and optional lines never count against "can make".
 *
 * RULES are tested in order against a lowercased ingredient line; first match wins.
 * ids: canonical ingredients that satisfy the line (any one of them).
 * assumed: pantry staples we never count. skip: descriptive lines, not ingredients.
 */

export const GROUPS = [
  'Spirits',
  'Liqueurs & Fortified',
  'Bitters & Extracts',
  'Mixers & Sodas',
  'Fresh & Juices',
  'Dairy & Eggs',
  'Syrups & Sweeteners',
  'Pantry & Garnish',
];

export const CANONICAL = {
  // Spirits
  'tequila-blanco':    { name: 'Tequila (blanco/silver)', group: 'Spirits' },
  'tequila-reposado':  { name: 'Tequila (reposado)', group: 'Spirits' },
  'tequila-anejo':     { name: 'Tequila (añejo)', group: 'Spirits' },
  'gin':               { name: 'Gin', group: 'Spirits' },
  'vodka':             { name: 'Vodka', group: 'Spirits' },
  'bourbon':           { name: 'Bourbon', group: 'Spirits' },
  'rye-whiskey':       { name: 'Rye whiskey', group: 'Spirits' },
  'brandy':            { name: 'Brandy', group: 'Spirits' },
  'cognac':            { name: 'Cognac', group: 'Spirits' },
  'rum-white':         { name: 'White rum', group: 'Spirits' },
  'rum-dark':          { name: 'Dark rum', group: 'Spirits' },

  // Liqueurs & fortified
  'orange-liqueur':    { name: 'Orange liqueur (Cointreau / triple sec)', group: 'Liqueurs & Fortified' },
  'coffee-liqueur':    { name: 'Coffee liqueur (Mr. Black / Kahlua)', group: 'Liqueurs & Fortified' },
  'aperol':            { name: 'Aperol', group: 'Liqueurs & Fortified' },
  'amaro-nonino':      { name: 'Amaro Nonino', group: 'Liqueurs & Fortified' },
  'creme-de-cacao':    { name: 'Crème de cacao', group: 'Liqueurs & Fortified' },
  'lillet-blanc':      { name: 'Lillet Blanc', group: 'Liqueurs & Fortified' },
  'sparkling-wine':    { name: 'Champagne / prosecco', group: 'Liqueurs & Fortified' },

  // Bitters & extracts
  'angostura-bitters': { name: 'Angostura bitters', group: 'Bitters & Extracts' },
  'orange-bitters':    { name: 'Orange bitters', group: 'Bitters & Extracts' },
  'orange-blossom-water': { name: 'Orange blossom water', group: 'Bitters & Extracts' },
  'caramel-extract':   { name: 'Caramel extract', group: 'Bitters & Extracts' },
  'butter-extract':    { name: 'Butter extract', group: 'Bitters & Extracts' },
  'rum-extract':       { name: 'Rum extract', group: 'Bitters & Extracts' },

  // Mixers & sodas
  'soda-water':        { name: 'Soda water / Topo Chico', group: 'Mixers & Sodas' },
  'ginger-beer':       { name: 'Ginger beer', group: 'Mixers & Sodas' },
  'cream-soda':        { name: 'Cream soda', group: 'Mixers & Sodas' },
  'lemon-lime-soda':   { name: 'Lemon-lime soda (7-Up/Sprite)', group: 'Mixers & Sodas' },
  'grapefruit-soda':   { name: 'Grapefruit soda (Squirt)', group: 'Mixers & Sodas' },
  'light-beer':        { name: 'Light beer (Miller High Life)', group: 'Mixers & Sodas' },
  'pineapple-juice':   { name: 'Pineapple juice', group: 'Mixers & Sodas' },

  // Fresh & juices
  'lime':              { name: 'Fresh limes', group: 'Fresh & Juices' },
  'lemon':             { name: 'Fresh lemons', group: 'Fresh & Juices' },
  'orange':            { name: 'Fresh oranges', group: 'Fresh & Juices' },
  'grapefruit':        { name: 'Fresh grapefruit', group: 'Fresh & Juices' },
  'cucumber':          { name: 'Cucumber (for juice)', group: 'Fresh & Juices' },
  'watermelon':        { name: 'Watermelon (for juice)', group: 'Fresh & Juices' },
  'pineapple':         { name: 'Pineapple (fresh/frozen)', group: 'Fresh & Juices' },
  'sugarcane-juice':   { name: 'Sugarcane juice', group: 'Fresh & Juices' },
  'mint':              { name: 'Fresh mint', group: 'Fresh & Juices' },
  'rosemary':          { name: 'Fresh rosemary', group: 'Fresh & Juices' },

  // Dairy & eggs
  'cream':             { name: 'Cream / half-and-half', group: 'Dairy & Eggs' },
  'egg-white':         { name: 'Egg whites (or aquafaba)', group: 'Dairy & Eggs' },
  'coconut-cream':     { name: 'Coconut cream', group: 'Dairy & Eggs' },
  'almond-milk':       { name: 'Almond milk', group: 'Dairy & Eggs' },

  // Syrups & sweeteners
  'simple-syrup':      { name: 'Simple syrup', group: 'Syrups & Sweeteners' },
  'demerara-syrup':    { name: 'Rich demerara syrup', group: 'Syrups & Sweeteners' },
  'lychee-syrup':      { name: 'Lychee syrup', group: 'Syrups & Sweeteners' },
  'agave-nectar':      { name: 'Agave nectar', group: 'Syrups & Sweeteners' },
  'butterscotch-topping': { name: 'Butterscotch topping', group: 'Syrups & Sweeteners' },
  'powdered-sugar':    { name: 'Powdered sugar', group: 'Syrups & Sweeteners' },

  // Pantry & garnish
  'espresso':          { name: 'Espresso (fresh brewed)', group: 'Pantry & Garnish' },
  'cocktail-cherry':   { name: 'Cocktail cherries (Luxardo/maraschino)', group: 'Pantry & Garnish' },
  'green-olives':      { name: 'Green olives & brine', group: 'Pantry & Garnish' },
  'lychee':            { name: 'Lychees (canned)', group: 'Pantry & Garnish' },
  'nutmeg':            { name: 'Nutmeg', group: 'Pantry & Garnish' },
  'salt':              { name: 'Coarse/fine salt (for rims)', group: 'Pantry & Garnish' },
  'chocolate':         { name: 'Dark chocolate', group: 'Pantry & Garnish' },
  'coffee-beans':      { name: 'Whole coffee beans', group: 'Pantry & Garnish' },
};

export const RULES = [
  // descriptive / structural lines
  { re: /^top with choice of/, ids: ['lemon-lime-soda', 'grapefruit-soda', 'soda-water'] },
  { re: /^(sweet|sour|press):/, skip: true },

  // assumed pantry staples (never counted)
  { re: /\bice\b(?!d)/, assumed: true },
  { re: /^splash of water|^water\b/, assumed: true },
  { re: /sugar cube|^[\d\s./½¼⅛]*\s*(cane |brown |granulated )?sugar\b(?! ?cane)/, assumed: true },

  // spirits
  { re: /tequila \(blanco or reposado\)|blanco or reposado/, ids: ['tequila-blanco', 'tequila-reposado'] },
  { re: /tequila.*(blanco|plata|silver|casamigos)|((blanco|plata|silver)\s.*tequila)/, ids: ['tequila-blanco'] },
  { re: /reposado/, ids: ['tequila-reposado'] },
  { re: /a[ñn]ejo/, ids: ['tequila-anejo'] },
  { re: /\btequila\b/, ids: ['tequila-blanco'] },
  { re: /\bgin\b/, ids: ['gin'] },
  { re: /chai spice-vanilla vodka/, ids: ['vodka'] },
  { re: /\bvodka\b/, ids: ['vodka'] },
  { re: /bourbon or rye/, ids: ['bourbon', 'rye-whiskey'] },
  { re: /\bbourbon\b/, ids: ['bourbon'] },
  { re: /\brye\b/, ids: ['rye-whiskey'] },
  { re: /\bcognac\b/, ids: ['cognac'] },
  { re: /\bbrandy\b/, ids: ['brandy'] },
  { re: /dark rum/, ids: ['rum-dark'] },
  { re: /white rum|light rum/, ids: ['rum-white'] },
  { re: /\brum\b(?! extract)/, ids: ['rum-white', 'rum-dark'] },

  // liqueurs & fortified
  { re: /cointreau|triple sec|orange liqueur|grand marnier/, ids: ['orange-liqueur'] },
  { re: /kahlua|mr\.? black|coffee liqueur/, ids: ['coffee-liqueur'] },
  { re: /espresso coffee liqueur ice cube/, ids: ['coffee-liqueur'] },
  { re: /aperol/, ids: ['aperol'] },
  { re: /amaro/, ids: ['amaro-nonino'] },
  { re: /cr[eè]me de cacao/, ids: ['creme-de-cacao'] },
  { re: /lillet/, ids: ['lillet-blanc'] },
  { re: /champagne|sparkling wine|prosecco/, ids: ['sparkling-wine'] },

  // bitters & extracts
  { re: /orange bitters/, ids: ['orange-bitters'] },
  { re: /bitters/, ids: ['angostura-bitters'] },
  { re: /orange (blossom|flower) water/, ids: ['orange-blossom-water'] },
  { re: /caramel extract/, ids: ['caramel-extract'] },
  { re: /butter extract/, ids: ['butter-extract'] },
  { re: /rum extract/, ids: ['rum-extract'] },

  // mixers
  { re: /topo chico|club soda|soda water|seltzer|mineral water/, ids: ['soda-water'] },
  { re: /ginger beer/, ids: ['ginger-beer'] },
  { re: /cream soda/, ids: ['cream-soda'] },
  { re: /7-up|sprite|lemon-lime/, ids: ['lemon-lime-soda'] },
  { re: /squirt|grapefruit soda/, ids: ['grapefruit-soda'] },
  { re: /miller high life|light beer|\bbeer\b/, ids: ['light-beer'] },
  { re: /pineapple juice/, ids: ['pineapple-juice'] },

  // fresh & juices
  { re: /sweet & sour mix|sweet and sour mix/, ids: ['lime'] }, // equal parts lime juice + sugar (sugar assumed)
  { re: /lime/, ids: ['lime'] },
  { re: /lemon/, ids: ['lemon'] },
  { re: /grapefruit/, ids: ['grapefruit'] },
  { re: /orange juice|navel orange|orange slice|orange peel|orange wedge|orange zest|orange twist/, ids: ['orange'] },
  { re: /cucumber/, ids: ['cucumber'] },
  { re: /watermelon/, ids: ['watermelon'] },
  { re: /pineapple/, ids: ['pineapple'] },
  { re: /sugarcane juice/, ids: ['sugarcane-juice'] },
  { re: /\bmint\b/, ids: ['mint'] },
  { re: /rosemary/, ids: ['rosemary'] },

  // dairy & eggs
  { re: /egg white|aquafaba/, ids: ['egg-white'] },
  { re: /coconut cream|cream of coconut/, ids: ['coconut-cream'] },
  { re: /almond milk/, ids: ['almond-milk'] },
  { re: /whipped cream|whipping cream|heavy cream|half.and.half|half and half|\bcream\b/, ids: ['cream'] },

  // syrups & sweeteners
  { re: /demerara syrup/, ids: ['demerara-syrup'] },
  { re: /lychee syrup/, ids: ['lychee-syrup'] },
  { re: /simple syrup|cane (sugar )?syrup/, ids: ['simple-syrup'] },
  { re: /agave/, ids: ['agave-nectar'] },
  { re: /butterscotch/, ids: ['butterscotch-topping'] },
  { re: /powdered sugar/, ids: ['powdered-sugar'] },

  // pantry & garnish
  { re: /espresso|coffee bean/, ids: ['espresso'] },
  { re: /luxardo|maraschino|cocktail cherr/, ids: ['cocktail-cherry'] },
  { re: /olive/, ids: ['green-olives'] },
  { re: /lychee/, ids: ['lychee'] },
  { re: /nutmeg/, ids: ['nutmeg'] },
  { re: /\bsalt\b/, ids: ['salt'] },
  { re: /chocolate bar|dark chocolate/, ids: ['chocolate'] },
];

/** Lines that never count against "can make". */
export function classifyRole(rawLower) {
  if (/^garnish:|\(for garnish\)|for garnish|garnish\b.*optional|^optional accompaniment/.test(rawLower)) return 'garnish';
  if (/for (the )?rim|for rimming|salt rim/.test(rawLower)) return 'garnish';
  if (/\boptional\b/.test(rawLower)) return 'optional';
  return 'required';
}

export function matchLine(raw) {
  const lower = raw
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1') // strip md links
    .replace(/\*\*/g, '')
    .toLowerCase();
  const role = classifyRole(lower);
  for (const rule of RULES) {
    if (rule.re.test(lower)) {
      if (rule.skip) return { role: 'note', ids: [] };
      if (rule.assumed) return { role: role === 'required' ? 'assumed' : role, ids: [] };
      return { role, ids: rule.ids };
    }
  }
  return { role, ids: null }; // null => unmatched, report it
}
