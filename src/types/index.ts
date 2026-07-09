export interface Grocery {
  id: string;
  name: string;
  unit: 'piece' | 'kg' | 'gram' | 'liter' | 'ml';
  quantity: number;
  variant?: string;
  brand?: string;
  price?: number;
  searchKeyword?: string;
  category?: string;
  /** Exact product picked from search — used for cross-store comparison */
  canonicalName?: string;
  identityKey?: string;
  barcode?: string | null;
  productId?: string;
  packageSize?: string;
}

export interface SupermarketPrice {
  supermarketName: string;
  price: number;
  productName?: string;  // The actual product name at this supermarket
  size?: string;         // The size/quantity of the product
  unitPrice?: number;
  onSale?: boolean;
  regularPrice?: number;
  link?: string;
  category?: string; // Product category
}

export interface GroceryWithPrices extends Grocery {
  prices: SupermarketPrice[];
}

export interface Supermarket {
  id: string;
  name: string;
  logo: string;
  hasAPI: boolean;
}

// Product suggestion and search types
export interface ProductVariant {
  id: string;
  name: string;
  variant: string;
  brand: string;
  unit: 'piece' | 'kg' | 'gram' | 'liter' | 'ml';
  defaultQuantity: number;
  imageUrl?: string;
  category: string;
} 