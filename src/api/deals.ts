import { api, ApiCountry } from './client';

export interface ObservedDeal {
  id: string; productName: string; store: string; originalPrice: number; effectivePrice: number;
  promoType: string; promoQuantity?: number | null; promoValidUntil: string | null;
  priceType?: 'regular' | 'promotion' | 'loyalty'; packageSize?: string; scrapedAt?: string; category: string; savings: number;
}
export interface DealPage { items: ObservedDeal[]; total: number; limit: number; offset: number }
export async function fetchDeals(country: ApiCountry, options: { sort: string; offset: number; category: string }, signal?: AbortSignal): Promise<DealPage> {
  return (await api.get('/deals', { params: { country, limit: 24, ...options, category: options.category || undefined }, signal })).data;
}
