import { SupermarketPrice, Grocery } from '../types';
import { supermarkets } from './supermarketService';

// Interface for product data from the JSON file
interface SupermarketPriceData {
  n: string; // name
  l: string; // link
  p: number; // price
  s: string; // size/quantity
}

// Interface for supermarket data from the JSON file
interface SupermarketData {
  p: SupermarketPriceData[]; // products
  u: string; // base url
  c: string; // code
  i: string; // icon
}

// Cache for loaded supermarket data
let supermarketDataCache: Record<string, SupermarketData> | null = null;

/**
 * Load supermarket data from the JSON file
 */
export const loadSupermarketData = async (): Promise<Record<string, SupermarketData>> => {
  if (supermarketDataCache) {
    console.log('Using cached supermarket data');
    return supermarketDataCache;
  }

  try {
    console.log('Attempting to load supermarkets.json from public folder...');
    
    // Fixed path to the supermarkets.json file in the public folder
    const response = await fetch('/supermarkets.json');
    
    if (!response.ok) {
      console.error('Failed to load supermarket data:', response.status, response.statusText);
      throw new Error(`Failed to load supermarket data: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('Successfully loaded supermarket data:', data);
    
    if (!Array.isArray(data)) {
      console.error('Loaded data is not an array:', data);
      return {};
    }
    
    console.log(`Loaded supermarket data: ${data.length} supermarkets`);
    
    // Convert array to map for easier access
    const dataMap: Record<string, SupermarketData> = {};
    data.forEach((item: SupermarketData) => {
      dataMap[item.c] = item;
      console.log(`Added supermarket ${item.c} with ${item.p?.length || 0} products`);
    });
    
    supermarketDataCache = dataMap;
    return dataMap;
  } catch (error) {
    console.error('Failed to load supermarket data:', error);
    return {};
  }
};

/**
 * Find a product in the supermarket data based on search term
 */
export const findProductInSupermarkets = async (
  searchTerm: string
): Promise<Record<string, SupermarketPriceData[]>> => {
  try {
    console.log(`Starting search for: "${searchTerm}"`);
    const data = await loadSupermarketData();
    const results: Record<string, SupermarketPriceData[]> = {};
    
    console.log(`Searching supermarkets for "${searchTerm}" in ${Object.keys(data).length} supermarkets`);
    
    if (Object.keys(data).length === 0) {
      console.warn('No supermarket data available. Make sure supermarkets.json is in the public folder.');
      return results;
    }

    // Create a sample of products to debug
    let sampleProducts: {supermarket: string, products: any[]}[] = [];
    
    // Search for products in each supermarket
    Object.keys(data).forEach(supermarketCode => {
      const supermarketData = data[supermarketCode];
      
      // Check if products exist
      if (!supermarketData.p || !Array.isArray(supermarketData.p)) {
        console.warn(`No products found for supermarket ${supermarketCode}`);
        return;
      }
      
      // Add sample products to debug
      if (sampleProducts.length < 3 && supermarketData.p.length > 0) {
        sampleProducts.push({
          supermarket: supermarketCode,
          products: supermarketData.p.slice(0, 3)
        });
      }
      
      // Normalize search term and break into words
      const normalizedSearchTerm = searchTerm.toLowerCase().trim();
      // Split search into individual words, ignoring short words (1-2 chars)
      const searchWords = normalizedSearchTerm.split(/\s+/).filter(w => w.length > 2);
      
      // Count products before filtering to get success rate
      const totalProducts = supermarketData.p.length;
      
      // Search for products matching the search term - VERY LENIENT VERSION
      const matchingProducts = supermarketData.p.filter(product => {
        if (!product.n) return false;
        
        // Make product name lowercase for comparison
        const productName = product.n.toLowerCase();
        
        // Debug sample products
        if (supermarketCode === 'ah' && searchTerm === 'milk') {
          console.log(`Debug sample product: ${JSON.stringify(product)}`);
        }
        
        // Check for exact match first
        if (productName.includes(normalizedSearchTerm)) {
          return true;
        }
        
        // If no exact match, check individual words
        if (searchWords.length > 0) {
          for (const word of searchWords) {
            if (productName.includes(word)) {
              return true;
            }
          }
        }
        
        // Super lenient - check if any character sequence matches
        // Only if the search term is 4+ characters
        if (normalizedSearchTerm.length >= 4) {
          for (let i = 0; i < normalizedSearchTerm.length - 3; i++) {
            const fragment = normalizedSearchTerm.substring(i, i + 4);
            if (productName.includes(fragment)) {
              return true;
            }
          }
        }
        
        return false;
      });
      
      if (matchingProducts.length > 0) {
        console.log(`Found ${matchingProducts.length} matches in ${supermarketCode} out of ${totalProducts} products`);
        results[supermarketCode] = matchingProducts;
      } else {
        console.log(`No matches in ${supermarketCode} out of ${totalProducts} products`);
      }
    });

    // Output sample products for debugging
    console.log('Sample products from supermarkets:', JSON.stringify(sampleProducts, null, 2));
    
    const totalResults = Object.values(results).reduce((sum, arr) => sum + arr.length, 0);
    console.log(`Total results from supermarkets.json: ${totalResults}`);
    
    // If no results, log a message but don't add dummy data
    if (totalResults === 0) {
      console.log('No matching products found in supermarkets.json');
    }
    
    return results;
  } catch (error) {
    console.error('Error searching in supermarkets:', error);
    return {};
  }
};

/**
 * Get real prices for a grocery item from all supermarkets
 */
export const getRealPricesForGrocery = async (grocery: Grocery): Promise<SupermarketPrice[]> => {
  // Use the variant if available for more accurate search, otherwise use the name
  const searchTerm = grocery.variant || grocery.name;
  const results = await findProductInSupermarkets(searchTerm);
  const prices: SupermarketPrice[] = [];
  
  // Load supermarket data for URLs
  const supermarketData = await loadSupermarketData();

  // Process results from each supermarket
  for (const supermarketId of Object.keys(results)) {
    const products = results[supermarketId];
    if (products.length === 0) continue;

    // Find the best match by comparing words in the name
    let bestMatch = products[0];
    let bestMatchScore = 0;

    const searchWords = searchTerm.toLowerCase().split(' ');
    for (const product of products) {
      const productName = product.n.toLowerCase();
      const score = searchWords.filter(word => productName.includes(word)).length;
      
      if (score > bestMatchScore) {
        bestMatchScore = score;
        bestMatch = product;
      }
    }

    // Find the supermarket info from our database
    const supermarket = supermarkets.find(s => s.id.toLowerCase() === supermarketId.toLowerCase());
    if (!supermarket) continue;

    // Create a standard price object
    const price: SupermarketPrice = {
      supermarketName: supermarket.name,
      price: bestMatch.p,
      isEstimated: false,
      priceDate: new Date().toISOString(),
      url: `${supermarketData[supermarketId].u}${bestMatch.l}`,
    };

    // Check if it's a sale price (implement logic to detect sales)
    // For demonstration, we'll randomly mark some as on sale
    if (Math.random() < 0.3) {
      price.onSale = true;
      price.regularPrice = parseFloat((bestMatch.p * (1 + Math.random() * 0.25)).toFixed(2));
    }

    // Calculate unit price if we can parse the size
    try {
      const sizeStr = bestMatch.s;
      
      // Try to extract numeric quantity and unit
      const match = sizeStr.match(/(\d+(?:\.\d+)?)\s*(g|kg|ml|l|stuks)/i);
      if (match) {
        let quantity = parseFloat(match[1]);
        const unit = match[2].toLowerCase();
        
        // Convert to standard units
        if (unit === 'g' && grocery.unit === 'kg') {
          price.unitPrice = (bestMatch.p / quantity) * 1000;
        } else if (unit === 'kg' && grocery.unit === 'gram') {
          price.unitPrice = (bestMatch.p / quantity) / 1000;
        } else if (unit === 'ml' && grocery.unit === 'liter') {
          price.unitPrice = (bestMatch.p / quantity) * 1000;
        } else if (unit === 'l' && grocery.unit === 'ml') {
          price.unitPrice = (bestMatch.p / quantity) / 1000;
        }
        
        if (price.unitPrice) {
          price.unitPrice = parseFloat(price.unitPrice.toFixed(2));
        }
      }
    } catch (e) {
      console.warn('Could not parse size information for unit price:', bestMatch.s);
    }
    
    prices.push(price);
  }

  return prices;
}; 