import { Product } from '../api/client';

export interface UnitComparison { basis: 'kg' | 'l' | 'item'; quantity: number; price: number }

/** Also works against older backend deployments; never use the ambiguous legacy scalar. */
export function getUnitComparison(product: Product): UnitComparison | null {
  const size = product.packageSize.toLowerCase().trim().replace(/,/g, '.');
  const match = size.match(/^(?:(\d+)\s*[x×]\s*)?(\d+(?:\.\d+)?)\s*(kg|g|gr|ml|cl|l|litres?|liters?|pints?|stuks?|st\.?|pieces?|pcs|count|pack|pk|items?)$/);
  if (!match || !Number.isFinite(product.effectivePrice) || product.effectivePrice <= 0) return null;
  const total = Number(match[1] ?? 1) * Number(match[2]);
  const unit = match[3];
  const basis = /^(kg|g|gr)$/.test(unit) ? 'kg' : /^(ml|cl|l|litres?|liters?|pints?)$/.test(unit) ? 'l' : 'item';
  const factor = /^(g|gr|ml)$/.test(unit) ? 0.001 : unit === 'cl' ? 0.01 : /^pint/.test(unit) ? 0.56826125 : 1;
  const quantity = total * factor;
  return Number.isFinite(quantity) && quantity > 0 ? { basis, quantity, price: product.effectivePrice / quantity } : null;
}

/** Different dimensions are grouped, not ranked against each other by a meaningless number. */
export function compareUnitPrices(a: Product, b: Product): number {
  const left = getUnitComparison(a), right = getUnitComparison(b);
  if (!left || !right) return left ? -1 : right ? 1 : 0;
  return left.basis.localeCompare(right.basis) || left.price - right.price;
}

export function sortByUnitPrice<T>(items: T[], product: (item: T) => Product): T[] {
  const counts = new Map<string, number>();
  for (const item of items) {
    const basis = getUnitComparison(product(item))?.basis;
    if (basis) counts.set(basis, (counts.get(basis) ?? 0) + 1);
  }
  // Keep the dominant measurement first (e.g. litres for a milk search),
  // without comparing kg and litre prices numerically.
  return [...items].sort((a, b) => {
    const left = getUnitComparison(product(a)), right = getUnitComparison(product(b));
    if (!left || !right) return left ? -1 : right ? 1 : 0;
    return (counts.get(right.basis) ?? 0) - (counts.get(left.basis) ?? 0) || compareUnitPrices(product(a), product(b));
  });
}

export function comparablePacks(products: Product[]): boolean {
  const first = products[0] && getUnitComparison(products[0]);
  return Boolean(first && products.every((p) => {
    const unit = getUnitComparison(p);
    return p.priceType !== 'loyalty' && !p.promoType && unit?.basis === first.basis && Math.abs(unit.quantity - first.quantity) < 0.000001;
  }));
}

export function barcodeMatched(products: Product[]): boolean {
  return products.length > 1 && Boolean(products[0]?.barcode) && products.every((p) => p.barcode === products[0].barcode);
}

export function checkedDate(value: string | undefined, locale: string): string | null {
  const date = value ? new Date(value) : null;
  return date && Number.isFinite(date.getTime()) ? new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short' }).format(date) : null;
}
