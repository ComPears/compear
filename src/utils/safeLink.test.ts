import { describe, expect, it } from 'vitest';
import { sanitizeProductLink } from './safeLink';

describe('sanitizeProductLink', () => {
  it('allows known Dutch retailer hosts', () => {
    expect(sanitizeProductLink('https://www.ah.nl/product/1')).toBe('https://www.ah.nl/product/1');
    expect(sanitizeProductLink('https://www.jumbo.com/producten/x')).toBe(
      'https://www.jumbo.com/producten/x'
    );
  });

  it('allows UK retailer hosts used in store config', () => {
    expect(sanitizeProductLink('https://www.tesco.com/groceries/en-GB/products/1')).toBe(
      'https://www.tesco.com/groceries/en-GB/products/1'
    );
    expect(sanitizeProductLink('https://www.sainsburys.co.uk/gol-ui/product/x')).toBe(
      'https://www.sainsburys.co.uk/gol-ui/product/x'
    );
    expect(sanitizeProductLink('https://www.asda.com/product/x')).toBe(
      'https://www.asda.com/product/x'
    );
    expect(sanitizeProductLink('https://groceries.morrisons.com/products/x')).toBe(
      'https://groceries.morrisons.com/products/x'
    );
    expect(sanitizeProductLink('https://www.aldi.co.uk/product/x')).toBe(
      'https://www.aldi.co.uk/product/x'
    );
    expect(sanitizeProductLink('https://www.lidl.co.uk/p/x')).toBe('https://www.lidl.co.uk/p/x');
  });

  it('allows German retailer hosts used in store config', () => {
    expect(sanitizeProductLink('https://www.rewe.de/produkt/x')).toBe(
      'https://www.rewe.de/produkt/x'
    );
    expect(sanitizeProductLink('https://www.edeka.de/produkt/x')).toBe(
      'https://www.edeka.de/produkt/x'
    );
    expect(sanitizeProductLink('https://www.lidl.de/p/x')).toBe('https://www.lidl.de/p/x');
    expect(sanitizeProductLink('https://www.aldi-sued.de/produkt/x')).toBe(
      'https://www.aldi-sued.de/produkt/x'
    );
    expect(sanitizeProductLink('https://www.penny.de/produkt/x')).toBe(
      'https://www.penny.de/produkt/x'
    );
  });

  it('rejects non-https and unknown hosts', () => {
    expect(sanitizeProductLink('http://www.tesco.com/x')).toBeUndefined();
    expect(sanitizeProductLink('https://evil.example/x')).toBeUndefined();
    expect(sanitizeProductLink('not-a-url')).toBeUndefined();
  });
});
