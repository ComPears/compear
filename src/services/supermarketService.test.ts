import { describe, expect, it } from 'vitest';
import { Product } from '../api/client';
import { Grocery } from '../types';
import { isComparableAlternative } from './supermarketService';

const grocery: Grocery = {
  id: 'skimmed-uht',
  name: 'Skimmed UHT milk',
  canonicalName: 'skimmed milk uht',
  category: 'Dairy & Eggs',
  packageSize: '1 l',
  weightInGrams: 1000,
  quantity: 1,
  unit: 'liter',
};

function candidate(canonicalName: string): Product {
  return {
    id: canonicalName,
    canonicalName,
    productName: canonicalName,
    brand: null,
    store: 'Tesco',
    packageSize: '1 l',
    weightInGrams: 1000,
    originalPrice: 1,
    effectivePrice: 1,
    unitPrice: 1,
    effectiveUnitPrice: 1,
    promoType: null,
    promoValue: null,
    promoValidUntil: null,
    category: 'Dairy & Eggs',
  };
}

describe('fallback comparison matching', () => {
  it('accepts the same milk variant', () => {
    expect(isComparableAlternative(grocery, candidate('british skimmed uht milk'))).toBe(true);
  });

  it('rejects semi-skimmed and fresh variants', () => {
    expect(isComparableAlternative(grocery, candidate('british semi skimmed uht milk'))).toBe(false);
    expect(isComparableAlternative(grocery, candidate('british skimmed fresh milk'))).toBe(false);
  });
});
