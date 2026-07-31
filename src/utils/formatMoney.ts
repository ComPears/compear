import { CountryCode } from '../context/CountryContext';

const SYMBOLS: Record<CountryCode, string> = {
  nl: '€',
  de: '€',
  uk: '£',
};

/** Format a price using the active country's currency symbol. */
export function formatMoney(amount: number | string | undefined | null, country: CountryCode = 'nl'): string {
  const num = typeof amount === 'number' ? amount : Number(amount);
  if (amount == null || Number.isNaN(num)) return '-';
  return `${SYMBOLS[country] ?? '€'}${num.toFixed(2)}`;
}

export function currencySymbol(country: CountryCode = 'nl'): string {
  return SYMBOLS[country] ?? '€';
}
