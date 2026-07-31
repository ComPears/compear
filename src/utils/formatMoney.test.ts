import { describe, expect, it } from 'vitest';
import { currencySymbol, formatMoney } from './formatMoney';

describe('formatMoney', () => {
  it('formats EUR for NL/DE and GBP for UK', () => {
    expect(formatMoney(1.5, 'nl')).toBe('€1.50');
    expect(formatMoney(1.5, 'de')).toBe('€1.50');
    expect(formatMoney(1.5, 'uk')).toBe('£1.50');
    expect(currencySymbol('uk')).toBe('£');
  });

  it('handles invalid amounts', () => {
    expect(formatMoney(undefined, 'uk')).toBe('-');
    expect(formatMoney('nope', 'nl')).toBe('-');
  });
});
