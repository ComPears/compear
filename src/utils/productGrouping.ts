import { Product } from '../api/client';
import { ProductCategory, CATEGORIES } from '../services/categoryService';

export type SortMode = 'relevance' | 'price' | 'unitPrice' | 'discount';

export interface ProductGroup {
  key: string;
  displayName: string;
  packageSize: string;
  products: Product[];
  cheapest: Product;
  bestDeal?: Product;
}

const FILTER_TERMS = [
  'halfvol',
  'vol',
  'mager',
  'chocolade',
  'haver',
  'soja',
  'kokos',
  'amandel',
  'bio',
  'biologisch',
  'lactosevrij',
  'plantaardig',
  'vers',
  'geraspt',
  'light',
  'zero',
  '1l',
  '2l',
  '500ml',
  '1kg',
  '500g',
];

const CATEGORY_KEYWORDS: Record<ProductCategory, string[]> = {
  'Fruits & Vegetables': [
    'appel', 'banaan', 'tomaat', 'sla', 'aardappel', 'ui', 'paprika', 'fruit', 'groente',
  ],
  'Dairy & Eggs': ['melk', 'kaas', 'yoghurt', 'kwark', 'eier', 'boter', 'room', 'zuivel'],
  'Meat & Seafood': ['vlees', 'kip', 'gehakt', 'worst', 'ham', 'vis', 'zalm', 'salami'],
  'Beverages': ['cola', 'water', 'sap', 'bier', 'wijn', 'koffie', 'thee', 'frisdrank', 'drank'],
  Bakery: ['brood', 'bol', 'croissant', 'beschuit', 'cracker', 'bakkerij'],
  Snacks: ['chips', 'koek', 'snoep', 'chocola', 'repen', 'noten'],
  'Frozen Foods': ['diepvries', 'pizza', 'ijs'],
  Pantry: ['pasta', 'rijst', 'saus', 'olie', 'conserven', 'soep'],
  'Personal Care': ['shampoo', 'tandpasta', 'zeep', 'deodorant', 'crème'],
  Household: ['wasmiddel', 'afwasmiddel', 'schoonmaak', 'toiletpapier', 'keukenrol'],
  Other: [],
};

export const DEAL_CATEGORY_LABELS: Record<ProductCategory | 'All', string> = {
  All: 'Alle',
  'Fruits & Vegetables': 'Groente & fruit',
  'Dairy & Eggs': 'Zuivel',
  'Meat & Seafood': 'Vlees & vis',
  Beverages: 'Dranken',
  Bakery: 'Bakkerij',
  Snacks: 'Snacks',
  'Frozen Foods': 'Diepvries',
  Pantry: 'Voorraadkast',
  'Personal Care': 'Drogisterij',
  Household: 'Huishouden',
  Other: 'Overig',
};

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[\s,./\-+]+/)
    .map((t) => t.trim())
    .filter((t) => t.length > 1);
}

export function scoreRelevance(product: Product, query: string): number {
  const fullQuery = query.toLowerCase().trim();
  if (!fullQuery) return 0;

  const haystack = [
    product.productName,
    product.canonicalName,
    product.brand ?? '',
    product.packageSize,
  ]
    .join(' ')
    .toLowerCase();

  if (haystack.includes(fullQuery)) {
    return 100 + (haystack.startsWith(fullQuery) ? 10 : 0);
  }

  const queryTokens = tokenize(fullQuery);
  let score = 0;
  for (const token of queryTokens) {
    if (haystack.includes(token)) {
      score += token.length >= 4 ? 3 : 2;
      if (product.productName.toLowerCase().startsWith(token)) score += 2;
      if (product.canonicalName?.startsWith(token)) score += 1;
    }
  }
  return score;
}

export function filterBySearch(products: Product[], query: string): Product[] {
  const q = query.trim();
  if (!q) return products;
  return products
    .map((p) => ({ p, score: scoreRelevance(p, q) }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score || a.p.effectivePrice - b.p.effectivePrice)
    .map((x) => x.p);
}

export function filterByChip(products: Product[], chip: string): Product[] {
  if (!chip) return products;
  const term = chip.toLowerCase();
  return products.filter((p) => p.productName.toLowerCase().includes(term));
}

export function extractFilterChips(products: Product[]): string[] {
  const counts = new Map<string, number>();
  for (const product of products) {
    const name = product.productName.toLowerCase();
    for (const term of FILTER_TERMS) {
      if (name.includes(term)) {
        counts.set(term, (counts.get(term) ?? 0) + 1);
      }
    }
  }
  return Array.from(counts.entries())
    .filter(([, count]) => count >= 2)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([term]) => term);
}

export function inferProductCategory(product: Product): ProductCategory {
  const haystack = [
    product.productName,
    product.canonicalName,
    product.brand ?? '',
  ]
    .join(' ')
    .toLowerCase();

  for (const category of CATEGORIES) {
    if (category === 'Other') continue;
    const keywords = CATEGORY_KEYWORDS[category];
    if (keywords.some((kw) => haystack.includes(kw))) {
      return category;
    }
  }
  return 'Other';
}

export function filterByCategory(
  products: Product[],
  category: ProductCategory | 'All'
): Product[] {
  if (category === 'All') return products;
  return products.filter((p) => inferProductCategory(p) === category);
}

export function groupKey(product: Product): string {
  const base = product.canonicalName?.trim() || product.productName.trim();
  const size = product.packageSize?.trim() || '';
  return `${base}::${size}`.toLowerCase();
}

export function groupProducts(products: Product[]): ProductGroup[] {
  const map = new Map<string, Product[]>();

  for (const product of products) {
    const key = groupKey(product);
    const list = map.get(key) ?? [];
    list.push(product);
    map.set(key, list);
  }

  return Array.from(map.entries())
    .map(([key, items]) => {
      const sorted = [...items].sort((a, b) => a.effectivePrice - b.effectivePrice);
      const cheapest = sorted[0];
      const bestDeal = [...items].sort(
        (a, b) =>
          (b.originalPrice - b.effectivePrice) - (a.originalPrice - a.effectivePrice)
      )[0];
      return {
        key,
        displayName: cheapest.productName,
        packageSize: cheapest.packageSize,
        products: sorted,
        cheapest,
        bestDeal,
      };
    })
    .sort((a, b) => a.cheapest.effectivePrice - b.cheapest.effectivePrice);
}

export function sortProducts(products: Product[], sort: SortMode, query = ''): Product[] {
  const list = [...products];
  switch (sort) {
    case 'price':
      return list.sort((a, b) => a.effectivePrice - b.effectivePrice);
    case 'unitPrice':
      return list.sort((a, b) => a.effectiveUnitPrice - b.effectiveUnitPrice);
    case 'discount':
      return list.sort(
        (a, b) =>
          (b.originalPrice - b.effectivePrice) - (a.originalPrice - a.effectivePrice)
      );
    case 'relevance':
    default:
      if (!query.trim()) return list.sort((a, b) => a.effectivePrice - b.effectivePrice);
      return list.sort(
        (a, b) =>
          scoreRelevance(b, query) - scoreRelevance(a, query) ||
          a.effectivePrice - b.effectivePrice
      );
  }
}

export function sortGroups(groups: ProductGroup[], sort: SortMode, query = ''): ProductGroup[] {
  const list = [...groups];
  switch (sort) {
    case 'price':
      return list.sort((a, b) => a.cheapest.effectivePrice - b.cheapest.effectivePrice);
    case 'unitPrice':
      return list.sort(
        (a, b) => a.cheapest.effectiveUnitPrice - b.cheapest.effectiveUnitPrice
      );
    case 'discount': {
      const savings = (g: ProductGroup) =>
        (g.bestDeal?.originalPrice ?? 0) - (g.bestDeal?.effectivePrice ?? 0);
      return list.sort((a, b) => savings(b) - savings(a));
    }
    case 'relevance':
    default:
      if (!query.trim()) return list;
      return list.sort(
        (a, b) =>
          scoreRelevance(b.cheapest, query) - scoreRelevance(a.cheapest, query) ||
          a.cheapest.effectivePrice - b.cheapest.effectivePrice
      );
  }
}

export function dedupeDealsByProduct(deals: Product[]): Product[] {
  const map = new Map<string, Product>();
  for (const deal of deals) {
    const key = deal.canonicalName?.trim() || deal.productName.trim();
    const existing = map.get(key);
    const savings = deal.originalPrice - deal.effectivePrice;
    if (!existing || savings > existing.originalPrice - existing.effectivePrice) {
      map.set(key, deal);
    }
  }
  return Array.from(map.values());
}

export function buildSuggestions(products: Product[], limit = 8): string[] {
  const seen = new Set<string>();
  const suggestions: string[] = [];
  for (const product of products) {
    const label = product.productName.trim();
    const key = label.toLowerCase();
    if (!label || seen.has(key)) continue;
    seen.add(key);
    suggestions.push(label);
    if (suggestions.length >= limit) break;
  }
  return suggestions;
}

export function productSavings(product: Product): number {
  return Math.max(0, product.originalPrice - product.effectivePrice);
}

export function productDiscountPercent(product: Product): number {
  if (product.originalPrice <= 0) return 0;
  return (productSavings(product) / product.originalPrice) * 100;
}
