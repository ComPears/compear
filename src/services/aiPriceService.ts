import axios from 'axios';
import { SupermarketPrice } from '../types';
import { sanitizeProductLink } from '../utils/safeLink';

interface ProductSearchRequest {
  searchTerm: string;
  country: string;
  supermarkets?: string[];
}

interface ProductSearchResponse {
  success: boolean;
  products: Array<{
    supermarketName: string;
    productName: string;
    price: number;
    size?: string;
    onSale?: boolean;
    regularPrice?: number;
    link?: string;
    category: string;
  }>;
  searchTerm: string;
  country: string;
}

/**
 * Fetch product prices using AI-powered service
 * @param searchTerm - The product search term
 * @param country - Country code (e.g., 'nl', 'uk', 'de')
 * @param supermarkets - Optional array of supermarket names to search
 * @returns Promise with array of SupermarketPrice objects
 */
export const fetchAIPrices = async (
  searchTerm: string,
  country: string,
  supermarkets?: string[]
): Promise<SupermarketPrice[]> => {
  if (!searchTerm || !country) {
    throw new Error('Search term and country are required');
  }

  try {
    // Determine the Netlify function URL
    // In development with Netlify CLI, use localhost; otherwise use relative path
    // The relative path works in both dev (if proxied) and production
    const isLocalDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const functionUrl = isLocalDev
      ? 'http://localhost:8888/.netlify/functions/fetchProductPrices'
      : '/.netlify/functions/fetchProductPrices';

    const requestBody: ProductSearchRequest = {
      searchTerm: searchTerm.trim(),
      country,
      supermarkets,
    };

    const response = await axios.post<ProductSearchResponse>(
      functionUrl,
      requestBody,
      {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 30000, // 30 second timeout
      }
    );

    if (!response.data.success || !response.data.products) {
      return [];
    }

    // Transform the response to SupermarketPrice format
    const prices: SupermarketPrice[] = response.data.products.map((product) => ({
      supermarketName: product.supermarketName,
      price: product.price,
      productName: product.productName,
      size: product.size,
      onSale: product.onSale,
      regularPrice: product.regularPrice,
      link: sanitizeProductLink(product.link),
      category: product.category,
    }));

    return prices;
  } catch (error: any) {
    console.error('Error fetching AI prices:', error);
    
    // Handle specific error cases
    if (error.response) {
      // Server responded with error status
      throw new Error(
        error.response.data?.error || 
        `Failed to fetch prices: ${error.response.status}`
      );
    } else if (error.request) {
      // Request made but no response
      throw new Error('Network error: Could not reach price service');
    } else {
      // Something else happened
      throw new Error(error.message || 'Unknown error occurred');
    }
  }
};

/**
 * Retry wrapper for fetchAIPrices with exponential backoff
 * @param searchTerm - The product search term
 * @param country - Country code
 * @param supermarkets - Optional array of supermarket names
 * @param maxRetries - Maximum number of retries (default: 2)
 * @returns Promise with array of SupermarketPrice objects
 */
export const fetchAIPricesWithRetry = async (
  searchTerm: string,
  country: string,
  supermarkets?: string[],
  maxRetries: number = 2
): Promise<SupermarketPrice[]> => {
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fetchAIPrices(searchTerm, country, supermarkets);
    } catch (error: any) {
      lastError = error;
      
      // Don't retry on certain errors (e.g., validation errors)
      if (error.message?.includes('required') || error.message?.includes('400')) {
        throw error;
      }
      
      // Wait before retrying (exponential backoff)
      if (attempt < maxRetries) {
        const delay = Math.pow(2, attempt) * 1000; // 1s, 2s, 4s...
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError || new Error('Failed to fetch prices after retries');
};

