import { Product } from '../api/client';

const STOP_WORDS = new Set([
  'de',
  'het',
  'een',
  'van',
  'voor',
  'met',
  'per',
  'stuk',
  'stuks',
  'the',
  'and',
  'ah',
  'jumbo',
  'plus',
  'coop',
  'lidl',
  'aldi',
  'dirk',
  'gratis',
  'nieuw',
  'optie',
  'pack',
  'pak',
  'zak',
  'pot',
  'fles',
  'doos',
  'bak',
  'emmer',
  'blik',
  'ml',
  'cl',
]);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[\s,./\-+&]+/)
    .map((t) => t.trim())
    .filter((t) => t.length > 1);
}

function isUsefulToken(token: string): boolean {
  if (STOP_WORDS.has(token)) return false;
  if (token.length < 3) return false;
  if (/^\d+$/.test(token)) return false;
  return true;
}

/**
 * Derive refinement chips from tokens that recur across the current result set.
 */
export function extractFilterChips(products: Product[]): string[] {
  const counts = new Map<string, number>();

  for (const product of products) {
    const haystack = `${product.productName} ${product.packageSize}`;
    const tokens = tokenize(haystack);
    const seen = new Set<string>();

    for (const token of tokens) {
      if (!isUsefulToken(token) || seen.has(token)) continue;
      seen.add(token);
      counts.set(token, (counts.get(token) ?? 0) + 1);
    }

    for (let i = 0; i < tokens.length - 1; i += 1) {
      const left = tokens[i];
      const right = tokens[i + 1];
      if (!isUsefulToken(left) || !isUsefulToken(right)) continue;
      const phrase = `${left} ${right}`;
      counts.set(phrase, (counts.get(phrase) ?? 0) + 1);
    }
  }

  return Array.from(counts.entries())
    .filter(([, count]) => count >= 2)
    .sort((a, b) => b[1] - a[1] || b[0].length - a[0].length)
    .slice(0, 10)
    .map(([term]) => term);
}

export function filterByChip(products: Product[], chip: string): Product[] {
  if (!chip) return products;
  const term = chip.toLowerCase();

  return products.filter((product) => {
    const haystack = `${product.productName} ${product.packageSize} ${product.canonicalName}`.toLowerCase();
    if (term.includes(' ')) return haystack.includes(term);

    const tokens = tokenize(haystack);
    return tokens.some(
      (token) => token === term || (term.length >= 5 && token.startsWith(term))
    );
  });
}
