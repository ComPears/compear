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
  productUrl: string | null;
  scrapedAt: string;
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
  },
  country: ApiCountry = 'nl',
  options?: { signal?: AbortSignal }
): Promise<Product[]> {
  const { data } = await api.get<Product[]>('/products', {
    params: withCountry(params, country),
    signal: options?.signal,
  });
  return data;
}

export async function fetchProduct(id: string, country: ApiCountry = 'nl'): Promise<Product> {
  const { data } = await api.get<Product>(`/products/${encodeURIComponent(id)}`, {
    params: withCountry(undefined, country),
  });
  return data;
}

export async function fetchStores(country: ApiCountry = 'nl'): Promise<StoreInfo[]> {
  const { data } = await api.get<StoreInfo[]>('/stores', { params: withCountry(undefined, country) });
  return data;
}

export async function fetchDeals(country: ApiCountry = 'nl'): Promise<Product[]> {
  const { data } = await api.get<Product[]>('/deals', { params: withCountry(undefined, country) });
  return data;
}

export interface DealsDigest {
  weekLabel: string;
  generatedAt: string;
  totalDeals: number;
  totalPotentialSavings: number;
  byStore: Record<string, number>;
  topSavings: Array<{
    id: string;
    productName: string;
    store: string;
    originalPrice: number;
    effectivePrice: number;
    savings: number;
    promoType: string | null;
  }>;
  biggestPercentOff: Array<{
    id: string;
    productName: string;
    store: string;
    percentOff: number;
    effectivePrice: number;
  }>;
}

export async function fetchDealsDigest(country: ApiCountry = 'nl'): Promise<DealsDigest> {
  const { data } = await api.get<DealsDigest>('/deals/digest', { params: withCountry(undefined, country) });
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
  quantity: number;
  paidUnitPrice: number;
  paidLineTotal: number;
  matchedProduct: Product | null;
  alternatives: Product[];
  cheapestAlternative: Product | null;
  lineSavings: number;
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
