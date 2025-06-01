import { Grocery, SupermarketPrice, Supermarket } from '../types';
import { supermarkets as rawSupermarkets, findProductInSupermarkets } from './rawProductData';

// List of Dutch supermarkets derived from rawProductData
export const supermarkets: Supermarket[] = rawSupermarkets.map(supermarket => ({
  id: supermarket.n.toLowerCase(),
  name: supermarket.n,
  logo: supermarket.i,
  hasAPI: true // All supermarkets in rawProductData have their data
}));

// Main function to fetch prices for a grocery item
export const fetchPricesForGrocery = async (grocery: Grocery): Promise<SupermarketPrice[]> => {
  try {
    // Use the grocery name to search for products
    const searchTerm = grocery.variant || grocery.name;
    const results = await findProductInSupermarkets(searchTerm);
    
    // Flatten and transform the results into SupermarketPrice[] format
    const prices: SupermarketPrice[] = [];
    
    for (const [supermarketCode, products] of Object.entries(results)) {
      // Get the supermarket info
      const supermarket = supermarkets.find(s => s.id.toLowerCase() === supermarketCode.toLowerCase());
      if (!supermarket) continue;
      
      // Only use the first (best) match for each supermarket
      if (products.length > 0) {
        const product = products[0];
        
        // Parse the price from string to number
        let price: number;
        try {
          // Handle different price formats - remove currency symbols and convert commas to dots
          const priceStr = typeof product.p === 'string' 
            ? product.p.replace('€', '').replace(',', '.').trim()
            : product.p.toString();
          price = parseFloat(priceStr);
          
          // If the price is not a valid number, throw an error
          if (isNaN(price)) {
            throw new Error(`Invalid price: ${product.p}`);
          }
        } catch (error) {
          console.warn(`Error parsing price for product ${product.n}:`, error);
          // Skip this product if we can't parse the price
          continue;
        }
        
        // Create a standardized price object
        const priceObj: SupermarketPrice = {
          supermarketName: supermarket.name,
          price: price,
          isEstimated: false, // All prices from rawProductData are considered real
          priceDate: new Date().toISOString(),
          url: product.l || `https://www.${supermarketCode.toLowerCase()}.nl/producten/${product.n.toLowerCase().replace(/\s+/g, '-')}`,
        };
        
        // Check if it has a sale price (o property not null)
        if (product.o !== null && product.o !== undefined) {
          priceObj.onSale = true;
          
          // Handle the regular price - ensure it's a number
          try {
            const regularPriceStr = typeof product.o === 'string' 
              ? product.o.replace('€', '').replace(',', '.').trim()
              : product.o.toString();
            const regularPrice = parseFloat(regularPriceStr);
            
            if (!isNaN(regularPrice)) {
              priceObj.regularPrice = regularPrice;
            }
          } catch (error) {
            console.warn(`Error parsing regular price for product ${product.n}:`, error);
            // Continue without setting regularPrice
          }
        }
        
        // Calculate unit price if we can parse the size
        if (product.s) {
          try {
            const sizeStr = product.s.toLowerCase();
            
            // Extract quantity and unit
            const sizeMatch = sizeStr.match(/(\d+[.,]?\d*)\s*(g|kg|gram|ml|l|liter|stuk|piece|stuks)/i);
            if (sizeMatch) {
              let quantity = parseFloat(sizeMatch[1].replace(',', '.'));
              let unit = sizeMatch[2].toLowerCase();
              
              // Map various unit representations to standard units
              if (['gram', 'g'].includes(unit)) {
                unit = 'gram';
              } else if (['kg', 'kilo'].includes(unit)) {
                unit = 'kg';
              } else if (['ml', 'milliliter'].includes(unit)) {
                unit = 'ml';
              } else if (['l', 'liter'].includes(unit)) {
                unit = 'liter';
              } else if (['stuk', 'piece', 'stuks'].includes(unit)) {
                unit = 'piece';
              }
              
              // Convert to standard units for comparison
              if (unit === 'gram' && grocery.unit === 'kg') {
                priceObj.unitPrice = (price / quantity) * 1000;
              } else if (unit === 'kg' && grocery.unit === 'gram') {
                priceObj.unitPrice = (price / quantity) / 1000;
              } else if (unit === 'ml' && grocery.unit === 'liter') {
                priceObj.unitPrice = (price / quantity) * 1000;
              } else if (unit === 'liter' && grocery.unit === 'ml') {
                priceObj.unitPrice = (price / quantity) / 1000;
              } else if (unit === grocery.unit) {
                // Same units, simple division
                priceObj.unitPrice = price / quantity;
              }
              
              if (priceObj.unitPrice) {
                priceObj.unitPrice = parseFloat(priceObj.unitPrice.toFixed(2));
              }
            }
          } catch (error) {
            console.warn(`Could not parse size information for unit price: ${product.s}`, error);
          }
        }
        
        prices.push(priceObj);
      }
    }
    
    // For any supermarkets that don't have prices, add estimated prices
    const supermarketsWithPrices = new Set(prices.map(p => p.supermarketName));
    const missingSupermarkets = supermarkets.filter(s => !supermarketsWithPrices.has(s.name));
    
    // Add estimated prices for missing supermarkets
    for (const supermarket of missingSupermarkets) {
      // Calculate estimated price based on available prices
      let estimatedPrice: number;
      
      if (prices.length > 0) {
        // Get average of known prices with some randomness
        const avgPrice = prices.reduce((sum, p) => sum + p.price, 0) / prices.length;
        const variance = 0.1; // 10% variance
        estimatedPrice = avgPrice * (1 + (Math.random() * variance * 2 - variance));
      } else {
        // No prices available, generate a reasonable price based on the name
        estimatedPrice = (grocery.name.length * 0.5) + 1 + (Math.random() * 2);
      }
      
      // Calculate unit price if applicable
      let unitPrice: number | undefined;
      if (grocery.unit === 'kg' || grocery.unit === 'liter') {
        unitPrice = estimatedPrice / grocery.quantity;
      } else if (grocery.unit === 'gram' || grocery.unit === 'ml') {
        unitPrice = (estimatedPrice / grocery.quantity) * 1000;
      }
      
      // Randomly decide if the product is on sale
      const isOnSale = Math.random() < 0.3;
      let onSale = undefined;
      let regularPrice = undefined;
      
      if (isOnSale) {
        onSale = true;
        const saleDiscount = 1 + (Math.random() * 0.2 + 0.1);
        regularPrice = parseFloat((estimatedPrice * saleDiscount).toFixed(2));
      }
      
      // Create the estimated price object
      const estimatedPriceObj: SupermarketPrice = {
        supermarketName: supermarket.name,
        price: parseFloat(estimatedPrice.toFixed(2)),
        isEstimated: true,
        unitPrice: unitPrice ? parseFloat(unitPrice.toFixed(2)) : undefined,
        priceDate: new Date().toISOString(),
        onSale,
        regularPrice
      };
      
      prices.push(estimatedPriceObj);
    }
    
    return prices;
  } catch (error) {
    console.error('Error fetching prices:', error);
    
    // Fallback to generating estimated prices for all supermarkets
    return supermarkets.map(supermarket => {
      // Generate a random price between 1 and 10
      const basePrice = Math.random() * 9 + 1;
      const price = parseFloat(basePrice.toFixed(2));
      
      // Calculate unit price if applicable
      let unitPrice: number | undefined;
      if (grocery.unit === 'kg' || grocery.unit === 'liter') {
        unitPrice = price / grocery.quantity;
      } else if (grocery.unit === 'gram' || grocery.unit === 'ml') {
        unitPrice = (price / grocery.quantity) * 1000;
      }
      
      // 30% chance of being on sale
      const isOnSale = Math.random() < 0.3;
      let onSale = undefined;
      let regularPrice = undefined;
      
      if (isOnSale) {
        onSale = true;
        regularPrice = parseFloat((price * (1 + Math.random() * 0.2 + 0.1)).toFixed(2));
      }
      
      return {
        supermarketName: supermarket.name,
        price,
        isEstimated: true,
        unitPrice: unitPrice ? parseFloat(unitPrice.toFixed(2)) : undefined,
        priceDate: new Date().toISOString(),
        onSale,
        regularPrice
      };
    });
  }
}; 
