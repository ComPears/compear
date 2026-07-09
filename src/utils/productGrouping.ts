import { Product } from '../api/client';

export type SortMode = 'relevance' | 'price' | 'unitPrice' | 'discount';

export interface ProductGroup {
  key: string;
  displayName: string;
  packageSize: string;
  products: Product[];
  /** Cheapest offer per store (for chips) */
  storeOffers: Product[];
  cheapest: Product;
  bestDeal?: Product;
}

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

export function groupKey(product: Product): string {
  if (product.identityKey) {
    return product.identityKey;
  }
  if (product.barcode) {
    return `barcode:${product.barcode}`;
  }
  const base = product.canonicalName?.trim() || product.productName.trim();
  return base.toLowerCase();
}

function titleCaseName(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

export function formatGroupDisplayName(products: Product[]): string {
  const canonical = products.find((p) => p.canonicalName?.trim())?.canonicalName?.trim();
  if (canonical) return titleCaseName(canonical);
  return products[0]?.productName.trim() ?? '';
}

export function formatGroupSizeLabel(products: Product[]): string {
  const sizes = Array.from(
    new Set(products.map((p) => p.packageSize.trim()).filter(Boolean))
  );
  if (sizes.length === 0) return '';
  if (sizes.length === 1) return sizes[0];
  return sizes.join(' · ');
}

/** Keep the cheapest listing per supermarket within a group. */
export function pickStoreOffers(products: Product[]): Product[] {
  const byStore = new Map<string, Product>();
  for (const item of products) {
    const store = item.store;
    const existing = byStore.get(store);
    if (!existing || item.effectivePrice < existing.effectivePrice) {
      byStore.set(store, item);
    }
  }
  return Array.from(byStore.values()).sort(
    (a, b) => a.effectivePrice - b.effectivePrice
  );
}

function buildProductGroup(key: string, items: Product[]): ProductGroup {
  const storeOffers = pickStoreOffers(items);
  const sortedAll = [...items].sort((a, b) => a.effectivePrice - b.effectivePrice);
  const cheapest = storeOffers[0] ?? sortedAll[0];
  const bestDeal = [...items].sort(
    (a, b) =>
      (b.originalPrice - b.effectivePrice) - (a.originalPrice - a.effectivePrice)
  )[0];

  return {
    key,
    displayName: formatGroupDisplayName(items),
    packageSize: formatGroupSizeLabel(items),
    products: sortedAll,
    storeOffers,
    cheapest,
    bestDeal,
  };
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
    .map(([key, items]) => buildProductGroup(key, items))
    .sort((a, b) => a.cheapest.effectivePrice - b.cheapest.effectivePrice);
}

/** Group barcode lookup results as one product across stores. */
export function groupProductsByBarcode(products: Product[]): ProductGroup[] {
  if (products.length === 0) return [];
  return [buildProductGroup(products[0].barcode ?? 'barcode', products)];
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
