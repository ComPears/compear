import { describe, it, expect, vi } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import StoreAvailabilityNotice from './StoreAvailabilityNotice';
import { isStoreAvailable, StoreInfo } from '../api/client';

vi.mock('../context/CountryContext', () => ({ useCountry: () => ({ country: { code: 'uk' } }) }));
vi.mock('../context/LanguageContext', () => ({
  useLanguage: () => ({ t: (key: string) => key === 'stores.allPriceDataUnavailable'
    ? 'Fresh supermarket prices are temporarily unavailable.'
    : 'Price data is temporarily unavailable for: {stores}. Their offers are excluded.' }),
}));

const healthy: StoreInfo = { id: 'tesco', slug: 'tesco', name: 'Tesco', availability: 'available', productCount: 500 };
const failed: StoreInfo = { id: 'aldi', slug: 'aldi-uk', name: 'ALDI', availability: 'unavailable', productCount: 0 };

describe('retailer availability', () => {
  it('does not promise other supermarkets during a complete outage', () => {
    render(<StoreAvailabilityNotice stores={[failed]} />);
    expect(screen.getByRole('status')).toHaveTextContent('Fresh supermarket prices are temporarily unavailable.');
    cleanup();
  });
  it('keeps healthy coverage available and identifies unavailable stores', () => {
    expect(isStoreAvailable(healthy)).toBe(true);
    expect(isStoreAvailable(failed)).toBe(false);
    expect(isStoreAvailable({ ...healthy, availableUntil: '2020-01-01T00:00:00Z' })).toBe(false);
  });
  it('explains the excluded retailer without claiming its prices are current', () => {
    render(<StoreAvailabilityNotice stores={[healthy, failed]} />);
    expect(screen.getByRole('status')).toHaveTextContent('ALDI');
    expect(screen.getByRole('status')).not.toHaveTextContent('Tesco');
    cleanup();
  });
  it('does not show an outage notice for healthy stores or unknown loading state', () => {
    render(<StoreAvailabilityNotice stores={[healthy]} />);
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    cleanup();
    render(<StoreAvailabilityNotice stores={[]} />);
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    cleanup();
  });
});
