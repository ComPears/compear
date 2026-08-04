import { Grocery, SupermarketPrice, Supermarket } from '../types';
import { fetchCompare, fetchProducts, fetchStores, Product, ApiCountry } from '../api/client';
import { productToSupermarketPrice } from '../utils/productMapper';
import { CountryCode } from '../context/CountryContext';

export const nlSupermarkets: Supermarket[] = [
  { name: 'AH', logo: 'https://www.ah.nl/favicon.ico', id: '1', hasAPI: true },
  { name: 'DIRK', logo: 'https://www.dirk.nl/favicon.ico', id: '2', hasAPI: true },
  { name: 'ALDI', logo: 'https://www.aldi.nl/favicon.ico', id: '3', hasAPI: true },
  { name: 'LIDL', logo: 'https://www.lidl.nl/favicon.ico', id: '4', hasAPI: true },
  { name: 'JUMBO', logo: 'https://www.jumbo.com/favicon.ico', id: '5', hasAPI: true },
  { name: 'PLUS', logo: 'https://www.plus.nl/favicon.ico', id: '6', hasAPI: true },
  { name: 'COOP', logo: 'https://www.coop.nl/favicon.ico', id: '7', hasAPI: true },
];

export const ukSupermarkets: Supermarket[] = [
  { name: 'TESCO', logo: 'https://www.tesco.com/favicon.ico', id: 'uk-1', hasAPI: true },
  { name: "SAINSBURY'S", logo: 'https://www.sainsburys.co.uk/favicon.ico', id: 'uk-2', hasAPI: true },
  { name: 'ASDA', logo: 'https://www.asda.com/favicon.ico', id: 'uk-3', hasAPI: true },
  { name: 'MORRISONS', logo: 'https://groceries.morrisons.com/favicon.ico', id: 'uk-4', hasAPI: true },
  { name: 'ALDI', logo: 'https://www.aldi.co.uk/favicon.ico', id: 'uk-5', hasAPI: true },
  { name: 'LIDL', logo: 'https://www.lidl.co.uk/favicon.ico', id: 'uk-6', hasAPI: true },
];

export const deSupermarkets: Supermarket[] = [
  { name: 'EDEKA', logo: 'https://www.edeka.de/favicon.ico', id: 'de-1', hasAPI: true },
  { name: 'REWE', logo: 'https://www.rewe.de/favicon.ico', id: 'de-2', hasAPI: true },
  { name: 'LIDL', logo: 'https://www.lidl.de/favicon.ico', id: 'de-3', hasAPI: true },
  { name: 'ALDI SÜD', logo: 'https://www.aldi-sued.de/favicon.ico', id: 'de-4', hasAPI: true },
  { name: 'PENNY', logo: 'https://www.penny.de/favicon.ico', id: 'de-5', hasAPI: true },
];

/** NL list kept as `supermarkets` for existing imports. */
export const supermarkets: Supermarket[] = nlSupermarkets;

const LOGO_BY_KEY: Record<string, string> = {
  AH: 'https://www.ah.nl/favicon.ico',
  'ALBERT HEIJN': 'https://www.ah.nl/favicon.ico',
  DIRK: 'https://www.dirk.nl/favicon.ico',
  ALDI: 'https://www.aldi.nl/favicon.ico',
  'ALDI-UK': 'https://www.aldi.co.uk/favicon.ico',
  'ALDI SÜD': 'https://www.aldi-sued.de/favicon.ico',
  'ALDI SUD': 'https://www.aldi-sued.de/favicon.ico',
  LIDL: 'https://www.lidl.nl/favicon.ico',
  'LIDL-UK': 'https://www.lidl.co.uk/favicon.ico',
  'LIDL-DE': 'https://www.lidl.de/favicon.ico',
  JUMBO: 'https://www.jumbo.com/favicon.ico',
  PLUS: 'https://www.plus.nl/favicon.ico',
  COOP: 'https://www.coop.nl/favicon.ico',
  TESCO: 'https://www.tesco.com/favicon.ico',
  SAINSBURYS: 'https://www.sainsburys.co.uk/favicon.ico',
  "SAINSBURY'S": 'https://www.sainsburys.co.uk/favicon.ico',
  ASDA: 'https://www.asda.com/favicon.ico',
  MORRISONS: 'https://groceries.morrisons.com/favicon.ico',
  EDEKA: 'https://www.edeka.de/favicon.ico',
  REWE: 'https://www.rewe.de/favicon.ico',
  PENNY: 'https://www.penny.de/favicon.ico',
};

export function getSupermarketsForCountry(country: CountryCode | ApiCountry): Supermarket[] {
  if (country === 'uk') return ukSupermarkets;
  if (country === 'de') return deSupermarkets;
  return nlSupermarkets;
}

/** Resolve a supermarket favicon from a short or full store name. */
export function getSupermarketLogo(name: string): string | undefined {
  const key = name.trim().toUpperCase();
  if (LOGO_BY_KEY[key]) return LOGO_BY_KEY[key];
  const match = [...nlSupermarkets, ...ukSupermarkets, ...deSupermarkets].find(
    (s) => s.name.toUpperCase() === key
  );
  return match?.logo;
}

async function resolveComparableProducts(
  grocery: Grocery,
  country: ApiCountry
): Promise<Product[]> {
  let exactMatches: Product[] = [];

  // Cross-store matching uses identityKey/canonicalName — barcode lookup is Jumbo-heavy.
  if (grocery.identityKey) {
    const compared = await fetchCompare(grocery.canonicalName ?? '', grocery.identityKey, country);
    exactMatches = mergeProducts(exactMatches, compared);
    if (countStores(exactMatches) > 1) return pickCheapestPerStore(exactMatches);
  }

  if (grocery.canonicalName) {
    const compared = await fetchCompare(grocery.canonicalName, undefined, country);
    exactMatches = mergeProducts(exactMatches, compared);
    if (countStores(exactMatches) > 1) return pickCheapestPerStore(exactMatches);
  }

  if (grocery.barcode) {
    const byBarcode = await fetchProducts({ barcode: grocery.barcode }, country);
    if (byBarcode.length > 0) {
      const seed = byBarcode[0];
      if (seed.identityKey) {
        const compared = await fetchCompare(seed.canonicalName, seed.identityKey, country);
        exactMatches = mergeProducts(exactMatches, compared);
        if (countStores(exactMatches) > 1) return pickCheapestPerStore(exactMatches);
      }
      if (seed.canonicalName) {
        const compared = await fetchCompare(seed.canonicalName, undefined, country);
        exactMatches = mergeProducts(exactMatches, compared);
        if (countStores(exactMatches) > 1) return pickCheapestPerStore(exactMatches);
      }
      exactMatches = mergeProducts(exactMatches, byBarcode);
    }
  }

  const similarityQuery = buildSimilarityQuery(grocery);
  if (similarityQuery) {
    const stores = await fetchStores(country);
    const storeSearches = await Promise.allSettled(
      stores.map((store) =>
        fetchProducts({ search: similarityQuery, store: store.slug, limit: 50 }, country)
      )
    );
    const results = storeSearches.flatMap((result) =>
      result.status === 'fulfilled' ? result.value : []
    );
    const similar = results.filter((product) => isComparableAlternative(grocery, product));
    const combined = pickCheapestPerStore(mergeProducts(exactMatches, similar));
    if (countStores(combined) > 1) return combined;
  }

  return pickCheapestPerStore(exactMatches);
}

const STORE_WORDS = new Set([
  'ah',
  'aldi',
  'albert',
  'heijn',
  'jumbo',
  'lidl',
  'plus',
  'coop',
  'dirk',
  'tesco',
  'sainsburys',
  'asda',
  'morrisons',
]);

function words(value: string): string[] {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .split(/[^a-z0-9]+/)
    .filter((word) => word.length > 1);
}

function buildSimilarityQuery(grocery: Grocery): string {
  const brandWords = new Set(words(grocery.brand ?? ''));
  const core = words(grocery.canonicalName ?? grocery.searchKeyword ?? grocery.name).filter(
    (word) => !brandWords.has(word) && !STORE_WORDS.has(word)
  );
  return core.join(' ');
}

export function isComparableAlternative(grocery: Grocery, candidate: Product): boolean {
  if (
    grocery.category &&
    grocery.category !== 'Other' &&
    candidate.category &&
    candidate.category !== 'Other' &&
    candidate.category !== grocery.category
  ) {
    return false;
  }

  if (grocery.weightInGrams) {
    if (!candidate.weightInGrams) return false;
    const ratio = candidate.weightInGrams / grocery.weightInGrams;
    if (ratio < 0.95 || ratio > 1.05) return false;
  } else if (
    grocery.packageSize &&
    candidate.packageSize &&
    candidate.packageSize.trim().toLowerCase() !== grocery.packageSize.trim().toLowerCase()
  ) {
    return false;
  }

  const queryWords = new Set(words(buildSimilarityQuery(grocery)));
  if (queryWords.size === 0) return false;
  const candidateWords = new Set(words(`${candidate.canonicalName} ${candidate.productName}`));
  if (hasVariantConflict(queryWords, candidateWords)) return false;
  let overlap = 0;
  for (const word of queryWords) {
    if (candidateWords.has(word)) overlap += 1;
  }
  const requiredOverlap = queryWords.size >= 4 ? Math.ceil(queryWords.size * 0.6) : queryWords.size >= 2 ? 2 : 1;
  return overlap >= requiredOverlap;
}

const VARIANT_GROUPS = [
  ['skimmed', 'semi-skimmed', 'whole'],
  ['fresh', 'uht', 'evaporated', 'condensed'],
  ['lactose-free', 'regular'],
  ['organic', 'conventional'],
] as const;

function variantValue(tokens: Set<string>, group: readonly string[]): string | null {
  const joined = Array.from(tokens).join(' ');
  if (group.includes('semi-skimmed') && /\bsemi(?:\s+|-)skimmed\b/.test(joined)) return 'semi-skimmed';
  if (group.includes('lactose-free') && /\blactose(?:\s+|-)free\b/.test(joined)) return 'lactose-free';
  for (const value of group) {
    if (value.includes('-')) continue;
    if (tokens.has(value)) return value;
  }
  if (group.includes('regular')) return 'regular';
  if (group.includes('conventional')) return 'conventional';
  return null;
}

function hasVariantConflict(source: Set<string>, candidate: Set<string>): boolean {
  return VARIANT_GROUPS.some((group) => {
    const sourceValue = variantValue(source, group);
    const candidateValue = variantValue(candidate, group);
    if (!sourceValue) return false;
    return candidateValue !== sourceValue;
  });
}

function comparisonConfidence(grocery: Grocery, product: Product): { score: number; type: 'exact' | 'similar' } {
  if (grocery.identityKey && product.identityKey === grocery.identityKey) {
    return { score: 1, type: 'exact' };
  }
  if (
    grocery.canonicalName &&
    product.canonicalName.trim().toLowerCase() === grocery.canonicalName.trim().toLowerCase()
  ) {
    return { score: 0.98, type: 'exact' };
  }
  const source = new Set(words(buildSimilarityQuery(grocery)));
  const candidate = new Set(words(`${product.canonicalName} ${product.productName}`));
  const overlap = Array.from(source).filter((token) => candidate.has(token)).length;
  return {
    score: source.size > 0 ? Math.min(0.94, overlap / source.size) : 0,
    type: 'similar',
  };
}

function mergeProducts(current: Product[], incoming: Product[]): Product[] {
  const byId = new Map(current.map((product) => [product.id, product]));
  for (const product of incoming) byId.set(product.id, product);
  return Array.from(byId.values());
}

function countStores(products: Product[]): number {
  return new Set(products.map((product) => product.store)).size;
}

function pickCheapestPerStore(products: Product[]): Product[] {
  const byStore = new Map<string, Product>();
  for (const product of products) {
    const existing = byStore.get(product.store);
    const productPrice = Number.isFinite(product.effectiveUnitPrice)
      ? product.effectiveUnitPrice
      : product.effectivePrice;
    const existingPrice = existing && Number.isFinite(existing.effectiveUnitPrice)
      ? existing.effectiveUnitPrice
      : existing?.effectivePrice ?? Number.POSITIVE_INFINITY;
    if (!existing || productPrice < existingPrice) byStore.set(product.store, product);
  }
  return Array.from(byStore.values()).sort((a, b) => a.effectivePrice - b.effectivePrice);
}

/** Fetch comparable prices for the grocery item the user picked (not fuzzy re-search). */
export const fetchPricesForGrocery = async (
  grocery: Grocery,
  countryCode: string = 'nl'
): Promise<SupermarketPrice[]> => {
  const country = countryCode as ApiCountry;
  const products = await resolveComparableProducts(grocery, country);
  return products.map((product) => {
    const mapped = productToSupermarketPrice(product, grocery.unit);
    const confidence = comparisonConfidence(grocery, product);
    return {
      ...mapped,
      unitPrice:
        calculateUnitPrice(product.effectivePrice, product.packageSize, grocery.unit) ??
        mapped.unitPrice,
      category: product.category,
      matchConfidence: confidence.score,
      matchType: confidence.type,
    };
  });
};

function calculateUnitPrice(
  price: number,
  sizeString: string,
  unit: string
): number | undefined {
  const sizeStr = sizeString.toLowerCase();
  const match = sizeStr.match(/(\d+(?:[.,]\d+)?)/);
  if (!match) return undefined;

  const quantity = parseFloat(match[1].replace(',', '.'));
  let sizeUnit = '';
  if (sizeStr.includes('kg')) {
    sizeUnit = 'kg';
  } else if (sizeStr.includes(' g') || sizeStr.includes('gram')) {
    sizeUnit = 'g';
  } else if (sizeStr.includes(' l') && !sizeStr.includes('ml')) {
    sizeUnit = 'l';
  } else if (sizeStr.includes('ml')) {
    sizeUnit = 'ml';
  }

  if (unit === 'kg' || unit === 'gram') {
    if (sizeUnit === 'kg') {
      return price / quantity;
    }
    if (sizeUnit === 'g') {
      return (price / quantity) * 1000;
    }
  } else if (unit === 'liter' || unit === 'ml') {
    if (sizeUnit === 'l') {
      return price / quantity;
    }
    if (sizeUnit === 'ml') {
      return (price / quantity) * 1000;
    }
  }

  return undefined;
}
