export interface Grocery {
  id: string;
  name: string;
  unit: 'piece' | 'kg' | 'gram' | 'liter' | 'ml';
  quantity: number;
  variant?: string; // Optional variant information
  brand?: string;   // Optional brand information
}

export interface SupermarketPrice {
  supermarketName: string;
  price: number;
  isEstimated: boolean;
  unitPrice?: number; // price per kg/liter where applicable
  priceDate?: string; // when the price was retrieved
  url?: string; // link to the product on the supermarket's website
  onSale?: boolean; // whether the product is currently on sale
  regularPrice?: number; // the regular price before the sale
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