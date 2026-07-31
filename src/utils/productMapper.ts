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
    updatedAt: product.scrapedAt,
    loyaltyLabel: getLoyaltyLabel(product),
  };
}

function getLoyaltyLabel(product: Product): string | undefined {
  const text = `${product.productName} ${product.promoType ?? ''}`.toLowerCase();
  if (text.includes('clubcard')) return 'Clubcard';
  if (text.includes('nectar')) return 'Nectar';
  if (text.includes('morrisons more')) return 'Morrisons More';
  if (text.includes('lidl plus')) return 'Lidl Plus';
  if (text.includes('asda rewards')) return 'Asda Rewards';
  return undefined;
}
