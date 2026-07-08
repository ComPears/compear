import { Product } from '../api/client';
import { Grocery, SupermarketPrice } from '../types';
import { sanitizeProductLink } from '../utils/safeLink';

const STORE_SHORT_NAMES: Record<string, string> = {
  'Albert Heijn': 'AH',
  AH: 'AH',
  Dirk: 'DIRK',
  DIRK: 'DIRK',
  ALDI: 'ALDI',
  Aldi: 'ALDI',
  Lidl: 'LIDL',
  LIDL: 'LIDL',
  Jumbo: 'JUMBO',
  Coop: 'COOP',
  PLUS: 'PLUS',
};

export function toSupermarketShortName(store: string): string {
  return STORE_SHORT_NAMES[store] ?? store.toUpperCase();
}

export function productToSupermarketPrice(
  product: Product,
  unit?: Grocery['unit']
): SupermarketPrice {
  const onSale = product.promoType != null && product.effectivePrice < product.originalPrice;

  return {
    supermarketName: toSupermarketShortName(product.store),
    price: product.effectivePrice,
    productName: product.productName,
    size: product.packageSize,
    unitPrice: product.effectiveUnitPrice,
    onSale,
    regularPrice: onSale ? product.originalPrice : undefined,
    link: sanitizeProductLink(product.productUrl),
  };
}

export interface SearchResultProduct {
  n: string;
  l: string;
  p: number;
  s: string;
  supermarketName: string;
  category?: string;
}

export function productToSearchResult(product: Product): SearchResultProduct {
  return {
    n: product.productName,
    l: sanitizeProductLink(product.productUrl) ?? '',
    p: product.effectivePrice,
    s: product.packageSize,
    supermarketName: toSupermarketShortName(product.store),
  };
}
