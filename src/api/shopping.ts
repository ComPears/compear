import { api, ApiCountry, Product } from './client';
import { ensureReceiptCredentials } from '../utils/userId';

export interface LabelEvidence {
  version: 1; sourceUrl: string; observedAt: string; method: string; ingredients?: string; claims: string[];
  nutrients?: { basis: '100g' | '100ml' | 'serving'; servingSize: string; proteinG?: number; sugarG?: number; fiberG?: number; fatG?: number };
}
export type Constraint =
  | { kind: 'price'; maximum: number }
  | { kind: 'unit-price'; maximum: number; basis: 'kg' | 'l' | 'item' }
  | { kind: 'claim'; value: string }
  | { kind: 'exclude-ingredient'; value: string }
  | { kind: 'nutrient'; nutrient: 'proteinG' | 'sugarG' | 'fiberG'; comparison: 'minimum' | 'maximum'; amount: number; basis: '100g' | '100ml' | 'serving' };
export interface Assessment { status: 'pass' | 'fail' | 'unknown'; code: string; constraint: Constraint; actual?: string | number; sourceUrl?: string }
export interface BriefResult { product: Product; status: 'pass' | 'fail' | 'unknown'; assessments: Assessment[] }
export interface BriefResponse { brief: { query: string; constraints: Constraint[]; warnings: string[] }; evaluated: number; candidateLimit: number; counts: { matches: number; unknown: number; excluded: number }; offsets?: { matches: number; unknown: number; excluded: number }; pageSize?: number; matches: BriefResult[]; unknown: BriefResult[]; excluded: BriefResult[]; unitLeaders: { basis: string; productId: string; price: number }[] }
export interface GuideSummary { slug: string; section: 'breakfast' | 'pantry' | 'household'; title: string; query: string; basis: 'kg' | 'l'; offerCount: number; storeCount: number; lowPackPrice: number | null; knownUnitCount: number }
export interface ShoppingGuide extends GuideSummary { products: Product[]; recommendation: { product: Product; reason: string; basis: string; unitPrice: number } | null }
export interface InsightsFeatures { history: boolean; alerts: boolean; email: boolean; retentionDays: number }
export interface SavedAlert { id: string; productId: string; productName?: string | null; country: ApiCountry; targetPrice: number; channel: 'inapp' | 'email'; confirmed: boolean; enabled: boolean }
export interface PriceNotification { id: string; productId: string; productName: string; price: number; store: string; observedAt: string; readAt: string | null }
export interface HistoryPoint { date: string; low: number; high: number; observedAt: string }

export async function searchBrief(request: string, country: ApiCountry, constraints?: Constraint[], stores?: string[], signal?: AbortSignal, offsets?: BriefResponse['offsets']): Promise<BriefResponse> {
  return (await api.post('/shopping/search', { request, constraints, stores, offsets }, { params: { country }, signal })).data;
}
export async function fetchGuides(country: ApiCountry): Promise<GuideSummary[]> { return (await api.get('/shopping/guides', { params: { country } })).data; }
export async function fetchGuide(slug: string, country: ApiCountry, signal?: AbortSignal): Promise<ShoppingGuide> { return (await api.get(`/shopping/guides/${encodeURIComponent(slug)}`, { params: { country }, signal })).data; }
export async function fetchInsightsFeatures(): Promise<InsightsFeatures> {
  try { return (await api.get('/insights/features')).data; }
  catch { return { history: false, alerts: false, email: false, retentionDays: 180 }; }
}
export async function fetchPriceHistory(id: string, country: ApiCountry): Promise<HistoryPoint[]> { return (await api.get(`/insights/history/${encodeURIComponent(id)}`, { params: { country } })).data.points; }
async function credentials() {
  const user = await ensureReceiptCredentials(api.defaults.baseURL);
  return { 'x-compear-user-id': user.userId, 'x-compear-user-token': user.token };
}
export async function createPriceAlert(productId: string, targetPrice: number, country: ApiCountry, channel: 'inapp' | 'email', email?: string): Promise<SavedAlert> {
  return (await api.post('/insights/alerts', { productId, targetPrice, channel, email, consent: true }, { params: { country }, headers: await credentials() })).data;
}
export async function fetchPriceAlerts(country: ApiCountry): Promise<SavedAlert[]> { return (await api.get('/insights/alerts', { params: { country }, headers: await credentials() })).data; }
export async function disablePriceAlert(id: string): Promise<void> { await api.post(`/insights/alerts/${encodeURIComponent(id)}/disable`, {}, { headers: await credentials() }); }
export async function resendAlertConfirmation(id: string): Promise<void> { await api.post(`/insights/alerts/${encodeURIComponent(id)}/resend`, {}, { headers: await credentials() }); }
export async function fetchPriceNotifications(country: ApiCountry): Promise<PriceNotification[]> { return (await api.get('/insights/notifications', { params: { country }, headers: await credentials() })).data; }
export async function markPriceNotificationRead(id: string): Promise<void> { await api.post(`/insights/notifications/${encodeURIComponent(id)}/read`, {}, { headers: await credentials() }); }
export async function performAlertAction(action: 'confirm' | 'unsubscribe', id: string, token: string): Promise<void> { await api.post(`/insights/alerts/${action}`, { id, token }); }
