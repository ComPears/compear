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
