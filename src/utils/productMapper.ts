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
  'Aldi UK': 'ALDI',
  'aldi-uk': 'ALDI',
  Lidl: 'LIDL',
  LIDL: 'LIDL',
  'Lidl UK': 'LIDL',
  'lidl-uk': 'LIDL',
  Jumbo: 'JUMBO',
  Coop: 'COOP',
  PLUS: 'PLUS',
  Tesco: 'TESCO',
  TESCO: 'TESCO',
  "Sainsbury's": "SAINSBURY'S",
  Sainsburys: "SAINSBURY'S",
  SAINSBURYS: "SAINSBURY'S",
  Asda: 'ASDA',
  ASDA: 'ASDA',
  Morrisons: 'MORRISONS',
  MORRISONS: 'MORRISONS',
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

