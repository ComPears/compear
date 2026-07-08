import { Handler } from '@netlify/functions';
import OpenAI from 'openai';

export const config = {
  maxDuration: 30,
};

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const ALLOWED_ORIGINS = (
  process.env.ALLOWED_ORIGINS ??
  'http://localhost:3000,http://localhost:8888,https://compears.shop'
)
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const ALLOWED_LINK_HOSTS = new Set([
  'ah.nl',
  'www.ah.nl',
  'dirk.nl',
  'www.dirk.nl',
  'aldi.nl',
  'www.aldi.nl',
  'lidl.nl',
  'www.lidl.nl',
  'jumbo.com',
  'www.jumbo.com',
  'plus.nl',
  'www.plus.nl',
  'coop.nl',
  'www.coop.nl',
]);

const MAX_SEARCH_TERM_LENGTH = 100;
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 10;
const CACHE_TTL_MS = 30 * 60 * 1000;

interface ProductSearchRequest {
  searchTerm: string;
  country: string;
  supermarkets?: string[];
}

interface ProductResult {
  supermarketName: string;
  productName: string;
  price: number;
  size?: string;
  onSale?: boolean;
  regularPrice?: number;
  link?: string;
  category: string;
}

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const searchCache = new Map<string, { products: ProductResult[]; expiresAt: number }>();

function getCorsHeaders(requestOrigin?: string): Record<string, string> {
  const origin =
    requestOrigin && ALLOWED_ORIGINS.includes(requestOrigin)
      ? requestOrigin
      : ALLOWED_ORIGINS[0];

  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
  };
}

function getClientIp(event: Parameters<Handler>[0]): string {
  return (
    event.headers['x-nf-client-connection-ip'] ||
    event.headers['client-ip'] ||
    event.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    'unknown'
  );
}

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    return false;
  }

  entry.count += 1;
  return true;
}

function sanitizeSearchTerm(raw: string): string {
  return raw
    .replace(/[\r\n\t]/g, ' ')
    .replace(/[^\p{L}\p{N}\s.,\-+%&/']/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, MAX_SEARCH_TERM_LENGTH);
}

function sanitizeProductLink(link: string | null | undefined): string | undefined {
  if (!link) return undefined;

  try {
    const url = new URL(link);
    if (url.protocol !== 'https:') return undefined;
    if (!ALLOWED_LINK_HOSTS.has(url.hostname.toLowerCase())) return undefined;
    return url.toString();
  } catch {
    return undefined;
  }
}

function getCacheKey(searchTerm: string, country: string, supermarkets?: string[]): string {
  return `${country}:${searchTerm}:${(supermarkets ?? []).join(',')}`;
}

function getCachedProducts(key: string): ProductResult[] | undefined {
  const entry = searchCache.get(key);
  if (!entry) return undefined;
  if (entry.expiresAt <= Date.now()) {
    searchCache.delete(key);
    return undefined;
  }
  return entry.products;
}

function setCachedProducts(key: string, products: ProductResult[]): void {
  searchCache.set(key, { products, expiresAt: Date.now() + CACHE_TTL_MS });
}

function mapProduct(product: Record<string, unknown>): ProductResult | null {
  if (
    typeof product.supermarketName !== 'string' ||
    typeof product.productName !== 'string' ||
    typeof product.price !== 'number'
  ) {
    return null;
  }

  return {
    supermarketName: product.supermarketName.toUpperCase(),
    productName: product.productName,
    price: Number(product.price),
    size: typeof product.size === 'string' ? product.size : undefined,
    onSale: product.onSale === true,
    regularPrice:
      typeof product.regularPrice === 'number' ? Number(product.regularPrice) : undefined,
    link: sanitizeProductLink(typeof product.link === 'string' ? product.link : undefined),
    category: typeof product.category === 'string' ? product.category : 'Other',
  };
}

export const handler: Handler = async (event) => {
  const corsHeaders = getCorsHeaders(event.headers.origin);

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: corsHeaders, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  if (!checkRateLimit(getClientIp(event))) {
    return {
      statusCode: 429,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Too many requests. Please try again later.' }),
    };
  }

  try {
    const requestBody: ProductSearchRequest = JSON.parse(event.body || '{}');
    const searchTerm = sanitizeSearchTerm(requestBody.searchTerm || '');
    const country = (requestBody.country || '').trim().slice(0, 8);
    const supermarkets = requestBody.supermarkets;

    if (!searchTerm || !country) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Missing required fields: searchTerm and country' }),
      };
    }

    const cacheKey = getCacheKey(searchTerm, country, supermarkets);
    const cached = getCachedProducts(cacheKey);
    if (cached) {
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({
          success: true,
          products: cached,
          searchTerm,
          country,
          cached: true,
        }),
      };
    }

    const prompt = `You are a grocery price comparison assistant. Search for the product "${searchTerm}" on Dutch supermarket websites and extract the following information for each supermarket (AH, DIRK, ALDI, LIDL):

For each supermarket where the product is found, provide:
1. Supermarket name (one of: AH, DIRK, ALDI, LIDL)
2. Exact product name as it appears on the website
3. Current price in euros (as a number, e.g., 2.99)
4. Product size/quantity (e.g., "500g", "1 liter", "6 stuks")
5. Whether it's on sale (true/false)
6. Regular price if on sale (as a number)
7. Product category (e.g., "Fruits & Vegetables", "Dairy & Eggs", "Meat & Seafood", "Beverages", "Bakery", "Snacks", "Frozen Foods", "Pantry", "Personal Care", "Household")
8. Product URL if available

Return only valid JSON object with a "products" array. If no products found, return {"products": []}.`;

    const results: ProductResult[] = [];

    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content:
              'You are a helpful assistant that extracts grocery product information from supermarket websites. Always return valid JSON. Return a JSON object with a "products" array containing the product data.',
          },
          { role: 'user', content: prompt },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.3,
      });

      const responseContent = completion.choices[0]?.message?.content;
      if (!responseContent) {
        throw new Error('No response from OpenAI');
      }

      const parsedResponse = JSON.parse(responseContent) as Record<string, unknown>;
      const products = Array.isArray(parsedResponse)
        ? parsedResponse
        : (parsedResponse.products as Record<string, unknown>[]) ||
          (parsedResponse.results as Record<string, unknown>[]) ||
          [];

      for (const product of products) {
        const mapped = mapProduct(product);
        if (mapped) {
          results.push(mapped);
        }
      }
    } catch (openaiError) {
      console.error('OpenAI API error:', openaiError);
      return {
        statusCode: 500,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Failed to fetch product prices' }),
      };
    }

    setCachedProducts(cacheKey, results);

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        success: true,
        products: results,
        searchTerm,
        country,
      }),
    };
  } catch (error) {
    console.error('Function error:', error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};
