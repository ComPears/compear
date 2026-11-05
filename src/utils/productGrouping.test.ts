import { describe, expect, it } from 'vitest';
import { Product } from '../api/client';
import { sortProducts } from './productGrouping';

function product(overrides: Partial<Product>): Product {
  return {
    id: 'product',
    canonicalName: 'product',
    productName: 'Product',
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
    category: 'Other',
    identityKey: 'product',
    ...overrides,
  };
}

describe('product relevance', () => {
  it('puts dairy milk before milk-flavoured snacks for a generic UK query', () => {
    const products = [
      product({ id: 'sweets', productName: 'Milk Bottles Sweets', canonicalName: 'milk bottles sweets', category: 'Snacks', effectivePrice: 0.49 }),
      product({ id: 'dairy', productName: 'Semi Skimmed UHT Milk', canonicalName: 'milk semi skimmed uht', category: 'Dairy & Eggs', effectivePrice: 0.65 }),
    ];

    expect(sortProducts(products, 'relevance', 'milk').map((item) => item.id)).toEqual([
      'dairy',
      'sweets',
    ]);
  });
  it('ranks milk above incorrectly categorized shower cream and ice lollies', () => {
    const products = ['Milk Lollies Ice Creams', 'Milk & Honey Shower Cream', 'Morrisons Fresh Skimmed Milk'].map((name) => product({ id: name, productName: name, canonicalName: name.toLowerCase(), category: 'Dairy & Eggs' }));
    expect(sortProducts(products, 'relevance', 'milk')[0].productName).toBe('Morrisons Fresh Skimmed Milk');
    expect(sortProducts(products, 'relevance', 'milk lollies')[0].productName).toBe('Milk Lollies Ice Creams');
  });
});
