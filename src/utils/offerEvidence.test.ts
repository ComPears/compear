import { describe, it, expect } from 'vitest';
import { getUnitComparison, comparablePacks, barcodeMatched, checkedDate, compareUnitPrices, sortByUnitPrice } from './offerEvidence';
import { Product } from '../api/client';

const product = (size: string, price = 3, extra = {}): Product => ({ packageSize: size, effectivePrice: price, ...extra } as Product);

describe('evidence-based comparison', () => {
  it('keeps explicit dimensions and multipacks', () => {
    expect(getUnitComparison(product('6 x 330 ml'))).toEqual({ basis: 'l', quantity: 1.98, price: 3 / 1.98 });
    expect(getUnitComparison(product('500 g'))).toEqual({ basis: 'kg', quantity: 0.5, price: 6 });
    expect(getUnitComparison(product('6 stuks'))).toEqual({ basis: 'item', quantity: 6, price: 0.5 });
    expect(getUnitComparison(product('4 pints'))?.quantity).toBeCloseTo(2.273045);
  });
  it('never invents a dimension from weightInGrams', () => {
    expect(getUnitComparison(product('family pack', 2, { weightInGrams: 1000 }))).toBeNull();
    expect(getUnitComparison(product('2 x 0 ml'))).toBeNull();
    expect(comparablePacks([product('1 l'), product('1 kg')])).toBe(false);
    expect(comparablePacks([product('1 l'), product('1000 ml')])).toBe(true);
    expect(comparablePacks([product('1 l'), product('2 l')])).toBe(false);
    expect(comparablePacks([product('1 l'), product('1 l', 1, { priceType: 'loyalty' })])).toBe(false);
  });
  it('requires the same barcode rather than a name grouping for barcode claims', () => {
    expect(barcodeMatched([product('1 l'), product('1 l')])).toBe(false);
    expect(barcodeMatched([product('1 l', 1, { barcode: '8712345678906' }), product('1 l', 2, { barcode: '8712345678906' })])).toBe(true);
  });
  it('sorts only within dimensions and puts unknown quantities last', () => {
    expect(compareUnitPrices(product('1 l', 2), product('1 l', 3))).toBeLessThan(0);
    expect(compareUnitPrices(product('family pack'), product('1 l'))).toBeGreaterThan(0);
    expect(checkedDate('invalid', 'en-GB')).toBeNull();
    expect(sortByUnitPrice([product('1 kg'), product('1 l', 2), product('1 l', 1)], (item) => item).map(p => p.packageSize)).toEqual(['1 l', '1 l', '1 kg']);
  });
});
