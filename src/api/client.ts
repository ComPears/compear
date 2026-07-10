import axios from 'axios';
import { ProductCategory } from '../services/categoryService';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export type ApiCountry = 'nl' | 'de' | 'uk';

function withCountry<T extends Record<string, unknown> | undefined>(
  params: T,
  country: ApiCountry = 'nl'
): Record<string, unknown> {
  return { ...(params ?? {}), country };
}

export const api = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

const CLIENT_CACHE_TTL_MS = 2 * 60 * 1000;
const MAX_PRODUCT_CACHE_ENTRIES = 100;

interface ClientCacheEntry<T> {
  data: T;
  expiresAt: number;
}

const productQueryCache = new Map<string, ClientCacheEntry<Product[]>>();
const storeCache = new Map<ApiCountry, ClientCacheEntry<StoreInfo[]>>();

function productCacheKey(
  params: Record<string, unknown> | undefined,
  country: ApiCountry
): string {
  const entries = Object.entries(params ?? {}).sort(([a], [b]) => a.localeCompare(b));
  return JSON.stringify([country, entries]);
}

function setProductCache(key: string, data: Product[]): void {
  productQueryCache.set(key, { data, expiresAt: Date.now() + CLIENT_CACHE_TTL_MS });
  while (productQueryCache.size > MAX_PRODUCT_CACHE_ENTRIES) {
    const oldest = productQueryCache.keys().next().value;
    if (oldest) productQueryCache.delete(oldest);
  }
}

export interface Product {
  id: string;
  canonicalName: string;
  productName: string;
  brand: string | null;
  store: string;
  packageSize: string;
  weightInGrams: number | null;
  originalPrice: number;
  effectivePrice: number;
  unitPrice: number;
  effectiveUnitPrice: number;
  promoType: string | null;
  promoValue: number | null;
  promoQuantity?: number | null;
  promoValidUntil: string | null;
  productUrl?: string | null;
  scrapedAt?: string;
  category?: ProductCategory;
  barcode?: string | null;
  identityKey?: string;
}

export interface StoreInfo {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  productCount?: number;
}

export async function fetchProducts(
  params?: {
    search?: string;
    store?: string;
    category?: string;
    barcode?: string;
    labels?: string;
    limit?: number;
    offset?: number;
  },
  country: ApiCountry = 'nl',
  options?: { signal?: AbortSignal }
): Promise<Product[]> {
  const key = productCacheKey(params, country);
  const cached = productQueryCache.get(key);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.data;
  }
  if (cached) productQueryCache.delete(key);

  const { data } = await api.get<Product[]>('/products', {
    params: withCountry(params, country),
    signal: options?.signal,
  });
  setProductCache(key, data);
  return data;
}

export async function fetchProduct(id: string, country: ApiCountry = 'nl'): Promise<Product> {
  const { data } = await api.get<Product>(`/products/${encodeURIComponent(id)}`, {
    params: withCountry(undefined, country),
  });
  return data;
}

export async function fetchStores(country: ApiCountry = 'nl'): Promise<StoreInfo[]> {
  const cached = storeCache.get(country);
  if (cached && cached.expiresAt > Date.now()) return cached.data;
  if (cached) storeCache.delete(country);

  const { data } = await api.get<StoreInfo[]>('/stores', { params: withCountry(undefined, country) });
  storeCache.set(country, { data, expiresAt: Date.now() + CLIENT_CACHE_TTL_MS });
  return data;
}

export async function fetchCompare(
  canonicalName: string,
  identityKey?: string | null,
  country: ApiCountry = 'nl'
): Promise<Product[]> {
  const params = withCountry(identityKey ? { identityKey } : undefined, country);
  const { data } = await api.get<Product[]>(
    `/compare/${encodeURIComponent(canonicalName)}`,
    { params }
  );
  return data;
}

export interface ReceiptLineMatch {
  rawName: string;
  correctedName?: string | null;
  quantity: number;
  paidUnitPrice: number;
  paidLineTotal: number;
  matchedProduct: Product | null;
  alternatives: Product[];
  cheapestAlternative: Product | null;
  lineSavings: number;
  matchConfidence: number;
  matchStatus: 'matched' | 'needs_review' | 'unmatched';
  matchMethod: 'catalog' | 'ai_normalized' | 'user_corrected' | 'user_unmatched';
}

export interface ReceiptAnalysis {
  parsed: {
    store: string | null;
    purchaseDate: string | null;
    currency: string;
    items: Array<{
      rawName: string;
      quantity: number;
      unitPrice: number | null;
      lineTotal: number;
    }>;
    receiptTotal: number | null;
  };
  storeDetected: string | null;
  purchaseDate: string | null;
  lines: ReceiptLineMatch[];
  actualTotal: number;
  cheapestPossibleTotal: number;
  potentialSavings: number;
  shoppingPlan: {
    stores: Array<{
      store: string;
      items: Array<{ name: string; price: number }>;
      totalPrice: number;
    }>;
    grandTotal: number;
    savingsVsSingleStore: number;
    storeCount: number;
  } | null;
  unmatchedCount: number;
}

export interface SavedReceipt {
  id: string;
  userId: string;
  uploadedAt: string;
  imageMimeType: string | null;
  analysis: ReceiptAnalysis;
}

export interface ReceiptAnalytics {
  receiptCount: number;
  totalSpent: number;
  totalCouldHaveSaved: number;
  averageSavingsPerReceipt: number;
  byStore: Array<{
    store: string;
    receiptCount: number;
    totalSpent: number;
    totalCouldHaveSaved: number;
  }>;
  byMonth: Array<{
    month: string;
    totalSpent: number;
    totalCouldHaveSaved: number;
    receiptCount: number;
  }>;
  topItems: Array<{
    name: string;
    purchaseCount: number;
    totalSpent: number;
    totalCouldHaveSaved: number;
  }>;
}

function userHeaders(userId: string) {
  return { 'x-compear-user-id': userId };
}

export async function uploadReceipt(file: File, userId: string): Promise<SavedReceipt> {
  const form = new FormData();
  form.append('receipt', file);
  const { data } = await api.post<SavedReceipt>('/receipts/parse', form, {
    headers: {
      ...userHeaders(userId),
      'Content-Type': 'multipart/form-data',
    },
    timeout: 120000,
  });
  return data;
}

export async function fetchReceipts(userId: string): Promise<SavedReceipt[]> {
  const { data } = await api.get<SavedReceipt[]>('/receipts', {
    headers: userHeaders(userId),
  });
  return data;
}

export async function fetchReceiptAnalytics(userId: string): Promise<ReceiptAnalytics> {
  const { data } = await api.get<ReceiptAnalytics>('/receipts/analytics', {
    headers: userHeaders(userId),
  });
  return data;
}

export async function deleteReceipt(receiptId: string, userId: string): Promise<void> {
  await api.delete(`/receipts/${encodeURIComponent(receiptId)}`, {
    headers: userHeaders(userId),
  });
}

export async function deleteAllReceipts(userId: string): Promise<void> {
  await api.delete('/receipts', {
    headers: userHeaders(userId),
  });
}

export async function correctReceiptLine(
  receiptId: string,
  lineIndex: number,
  correction: { action: 'rematch'; correctedName: string } | { action: 'unmatched' },
  userId: string
): Promise<SavedReceipt> {
  const { data } = await api.patch<SavedReceipt>(
    `/receipts/${encodeURIComponent(receiptId)}/lines/${lineIndex}`,
    correction,
    { headers: userHeaders(userId) }
  );
  return data;
}

export interface StoreLocation {
  id: string;
  chain: string;
  name: string;
  address: string;
  city: string;
  lat: number;
  lng: number;
  distanceKm?: number;
}

export async function fetchStoreLocations(params?: {
  chain?: string;
  city?: string;
  lat?: number;
  lng?: number;
  radius?: number;
  limit?: number;
}): Promise<StoreLocation[]> {
  const { data } = await api.get<StoreLocation[]>('/stores/locations', { params });
  return data;
}

export interface SharedListItem {
  productId: string;
  productName: string;
  store: string;
  quantity: number;
  effectivePrice: number;
}

export interface SharedList {
  id: string;
  name: string;
  items: SharedListItem[];
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
}

export async function createSharedList(
  name: string,
  items: SharedListItem[]
): Promise<SharedList> {
  const { data } = await api.post<SharedList>('/lists', { name, items });
  return data;
}

export async function fetchSharedList(id: string): Promise<SharedList> {
  const { data } = await api.get<SharedList>(`/lists/${encodeURIComponent(id)}`);
  return data;
}

export interface PublicApiDocs {
  version: string;
  description: string;
  endpoints: Array<{ method: string; path: string; query?: string; description?: string }>;
}

export async function fetchPublicApiDocs(): Promise<PublicApiDocs> {
  const { data } = await api.get<PublicApiDocs>('/api/v1/docs');
  return data;
}
