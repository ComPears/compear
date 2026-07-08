import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:4000';

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
}

export interface StoreInfo {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  productCount?: number;
}

export async function fetchProducts(params?: { search?: string; store?: string }): Promise<Product[]> {
  const { data } = await api.get<Product[]>('/products', { params });
  return data;
}

export async function fetchProduct(id: string): Promise<Product> {
  const { data } = await api.get<Product>(`/products/${encodeURIComponent(id)}`);
  return data;
}

export async function fetchStores(): Promise<StoreInfo[]> {
  const { data } = await api.get<StoreInfo[]>('/stores');
  return data;
}

export async function fetchDeals(): Promise<Product[]> {
  const { data } = await api.get<Product[]>('/deals');
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

export async function fetchDealsDigest(): Promise<DealsDigest> {
  const { data } = await api.get<DealsDigest>('/deals/digest');
  return data;
}

export async function fetchCompare(canonicalName: string): Promise<Product[]> {
  const { data } = await api.get<Product[]>(`/compare/${encodeURIComponent(canonicalName)}`);
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
