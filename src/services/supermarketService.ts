import { Grocery, SupermarketPrice, Supermarket } from '../types';
import { getRealPricesForGrocery } from './realPriceService';

// List of Dutch supermarkets based on market data and user input
// Source: https://en.wikipedia.org/wiki/List_of_supermarket_chains_in_the_Netherlands
export const supermarkets: Supermarket[] = [
  { 
    id: 'ah', 
    name: 'Albert Heijn', 
    logo: 'https://upload.wikimedia.org/wikipedia/commons/e/eb/Albert_Heijn_Logo.svg', 
    hasAPI: true 
  },
  { 
    id: 'jumbo', 
    name: 'Jumbo', 
    logo: 'https://upload.wikimedia.org/wikipedia/commons/9/9a/Logo_Jumbo_Supermarkten.svg', 
    hasAPI: true 
  },
  { 
    id: 'lidl', 
    name: 'Lidl', 
    logo: 'https://upload.wikimedia.org/wikipedia/commons/9/91/Lidl-Logo.svg', 
    hasAPI: false 
  },
  { 
    id: 'aldi', 
    name: 'Aldi', 
    logo: 'https://upload.wikimedia.org/wikipedia/commons/4/4d/ALDI_Nord_201x_logo.svg', 
    hasAPI: false 
  },
  { 
    id: 'plus', 
    name: 'Plus', 
    logo: 'https://upload.wikimedia.org/wikipedia/commons/e/e9/PLUS_Logo.svg', 
    hasAPI: true 
  },
  { 
    id: 'coop', 
    name: 'Coop', 
    logo: 'https://upload.wikimedia.org/wikipedia/commons/6/60/Coop_%28Netherlands%29_logo.svg', 
    hasAPI: false 
  },
  { 
    id: 'dirk', 
    name: 'Dirk', 
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/Dirk_Logo.svg/1200px-Dirk_Logo.svg.png', 
    hasAPI: false 
  },
  { 
    id: 'dekamarkt', 
    name: 'Dekamarkt', 
    logo: 'https://upload.wikimedia.org/wikipedia/commons/7/7d/Dekamarkt_logo.svg', 
    hasAPI: false 
  },
  { 
    id: 'hoogvliet', 
    name: 'Hoogvliet', 
    logo: 'https://upload.wikimedia.org/wikipedia/commons/9/91/Hoogvliet_logo.svg', 
    hasAPI: false 
  },
  { 
    id: 'janlinders', 
    name: 'Jan Linders', 
    logo: 'https://upload.wikimedia.org/wikipedia/commons/a/ae/Jan_Linders_Logo.svg', 
    hasAPI: false 
  },
  { 
    id: 'poiesz', 
    name: 'Poiesz', 
    logo: 'https://upload.wikimedia.org/wikipedia/commons/5/58/Poiesz_logo.svg', 
    hasAPI: false 
  },
  { 
    id: 'spar', 
    name: 'Spar', 
    logo: 'https://upload.wikimedia.org/wikipedia/commons/e/ee/SPAR_logo.svg', 
    hasAPI: false 
  },
  { 
    id: 'boni', 
    name: 'Boni', 
    logo: 'https://upload.wikimedia.org/wikipedia/commons/6/6a/Logo_Boni_2023.svg', 
    hasAPI: false 
  },
  { 
    id: 'picnic', 
    name: 'Picnic', 
    logo: 'https://upload.wikimedia.org/wikipedia/commons/e/ef/Logo_picnic.svg', 
    hasAPI: true 
  },
  { 
    id: 'boonsmarkt', 
    name: 'Boon\'s Markt', 
    logo: 'https://upload.wikimedia.org/wikipedia/commons/3/32/Boon%27s_Markt_logo.svg', 
    hasAPI: false 
  },
  { 
    id: 'dagwinkel', 
    name: 'Dagwinkel', 
    logo: 'https://upload.wikimedia.org/wikipedia/commons/f/f5/Dagwinkel_logo.svg', 
    hasAPI: false 
  },
  { 
    id: 'ekoplaza', 
    name: 'EkoPlaza', 
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ae/Ekoplaza_logo.svg/1200px-Ekoplaza_logo.svg.png', 
    hasAPI: false 
  },
  { 
    id: 'makro', 
    name: 'Makro', 
    logo: 'https://upload.wikimedia.org/wikipedia/commons/c/cf/Makro_Logo.svg', 
    hasAPI: false 
  },
  { 
    id: 'crisp', 
    name: 'Crisp', 
    logo: 'https://upload.wikimedia.org/wikipedia/commons/a/ad/Logo_Crisp_Supermarkt.png', 
    hasAPI: true 
  },
  { 
    id: 'gorillas', 
    name: 'Gorillas', 
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/10/Gorillas_Logo.svg/1200px-Gorillas_Logo.svg.png', 
    hasAPI: false 
  },
  { 
    id: 'vomar', 
    name: 'Vomar', 
    logo: 'https://upload.wikimedia.org/wikipedia/commons/f/f4/Vomar_logo.svg', 
    hasAPI: false 
  }
];

// This would be a real API call in a production application
const fetchPriceFromAPI = async (supermarketId: string, grocery: Grocery): Promise<SupermarketPrice | null> => {
  // Simulate API response time
  await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 500));
  
  // Mock data for the supermarkets with API
  if (['ah', 'jumbo', 'plus', 'picnic', 'crisp'].includes(supermarketId)) {
    // Generate a somewhat realistic price based on the grocery name
    const basePrice = ((grocery.name.length * 7) % 10) + 1;
    const price = basePrice + (Math.random() * 2 - 1);
    
    // Different pricing strategies per supermarket
    let finalPrice = price;
    if (supermarketId === 'ah') finalPrice = price * 1.05; // AH is a bit more expensive
    if (supermarketId === 'jumbo') finalPrice = price * 0.95; // Jumbo claims to be cheaper
    if (supermarketId === 'plus') finalPrice = price * 1.0; // Plus is average
    if (supermarketId === 'picnic') finalPrice = price * 0.92; // Picnic is online-only and cheaper
    if (supermarketId === 'crisp') finalPrice = price * 1.15; // Crisp is premium/organic
    
    // Calculate unit price if applicable
    let unitPrice: number | undefined;
    if (grocery.unit === 'kg' || grocery.unit === 'liter') {
      unitPrice = finalPrice / grocery.quantity;
    } else if (grocery.unit === 'gram' || grocery.unit === 'ml') {
      unitPrice = (finalPrice / grocery.quantity) * 1000;
    }
    
    // Randomly decide if the product is on sale (about 30% chance)
    const isOnSale = Math.random() < 0.3;
    let onSale = undefined;
    let regularPrice = undefined;
    
    if (isOnSale) {
      onSale = true;
      // Regular price is 10-30% higher than the sale price
      const saleDiscount = 1 + (Math.random() * 0.2 + 0.1);
      regularPrice = parseFloat((finalPrice * saleDiscount).toFixed(2));
      // The final price is already the sale price
    }
    
    return {
      supermarketName: supermarkets.find(s => s.id === supermarketId)?.name || '',
      price: parseFloat(finalPrice.toFixed(2)),
      isEstimated: false,
      unitPrice: unitPrice ? parseFloat(unitPrice.toFixed(2)) : undefined,
      priceDate: new Date().toISOString(),
      url: `https://www.${supermarketId}.nl/producten/${grocery.name.toLowerCase().replace(/\s+/g, '-')}`,
      onSale,
      regularPrice
    };
  }
  
  // No API available for this supermarket
  return null;
};

// Use AI (simulated) to estimate prices for supermarkets without API
const estimatePriceWithAI = async (grocery: Grocery, otherPrices: SupermarketPrice[]): Promise<SupermarketPrice> => {
  // Get a random supermarket without API
  const supermarketsWithoutAPI = supermarkets.filter(s => !s.hasAPI);
  const randomIndex = Math.floor(Math.random() * supermarketsWithoutAPI.length);
  const supermarket = supermarketsWithoutAPI[randomIndex];
  
  // Add a small delay to simulate AI processing time
  await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200));
  
  // Calculate estimated price based on available prices with some variance
  let estimatedPrice: number;
  
  if (otherPrices.length > 0) {
    // Get average of known prices
    const avgPrice = otherPrices.reduce((sum, p) => sum + p.price, 0) / otherPrices.length;
    
    // Add some randomness to simulate AI estimation with different pricing strategies
    let discount = 1.0;
    
    // Apply different pricing strategies based on supermarket ID
    switch(supermarket.id) {
      case 'lidl':
      case 'aldi':
        discount = 0.88; // Discount supermarkets are typically cheaper
        break;
      case 'coop':
      case 'spar':
        discount = 1.05; // Convenience stores are typically more expensive
        break;
      case 'dirk':
        discount = 0.92; // Dirk is known for lower prices
        break;
      case 'boni':
      case 'poiesz':
        discount = 0.97; // Regional chains have mid-range prices
        break;
      default:
        discount = 0.98; // Default slightly lower than average
    }
    
    // Add some small random variation (±5%)
    discount *= (1 + (Math.random() * 0.1 - 0.05));
    
    estimatedPrice = avgPrice * discount;
  } else {
    // No prices available - completely guessing based on product name
    const basePrice = ((grocery.name.length * 5) % 8) + 1;
    
    // Apply different pricing strategies based on supermarket ID
    switch(supermarket.id) {
      case 'lidl':
      case 'aldi':
        estimatedPrice = basePrice * 0.85;
        break;
      case 'coop':
      case 'spar':
        estimatedPrice = basePrice * 1.15;
        break;
      case 'dirk':
        estimatedPrice = basePrice * 0.9;
        break;
      default:
        estimatedPrice = basePrice * 1.0;
    }
  }
  
  // Calculate unit price if applicable
  let unitPrice: number | undefined;
  if (grocery.unit === 'kg' || grocery.unit === 'liter') {
    unitPrice = estimatedPrice / grocery.quantity;
  } else if (grocery.unit === 'gram' || grocery.unit === 'ml') {
    unitPrice = (estimatedPrice / grocery.quantity) * 1000;
  }
  
  // For discount supermarkets like Lidl and Aldi, simulate weekly specials
  // They have a higher chance of items being on sale
  const saleChance = supermarket.id === 'lidl' || supermarket.id === 'aldi' ? 0.4 : 0.25;
  const isOnSale = Math.random() < saleChance;
  let onSale = undefined;
  let regularPrice = undefined;
  
  if (isOnSale) {
    onSale = true;
    // For discount stores, regular prices might be 5-20% higher
    const saleDiscount = 1 + (Math.random() * 0.15 + 0.05);
    regularPrice = parseFloat((estimatedPrice * saleDiscount).toFixed(2));
    // The estimated price is already the sale price
  }
  
  return {
    supermarketName: supermarket?.name || '',
    price: parseFloat(estimatedPrice.toFixed(2)),
    isEstimated: true,
    unitPrice: unitPrice ? parseFloat(unitPrice.toFixed(2)) : undefined,
    priceDate: new Date().toISOString(),
    onSale,
    regularPrice
  };
};

// Main function to fetch prices for a grocery item
export const fetchPricesForGrocery = async (grocery: Grocery): Promise<SupermarketPrice[]> => {
  try {
    // First, try to get real prices from the supermarkets.json data
    const realPrices = await getRealPricesForGrocery(grocery);
    console.log(`Found ${realPrices.length} real prices for ${grocery.name}`);
    
    // Get the supermarkets we already have prices for
    const supermarketsWithRealPrices = new Set(realPrices.map(p => 
      supermarkets.find(s => s.name === p.supermarketName)?.id || ''
    ).filter(id => id !== ''));
    
    // For supermarkets with APIs that don't have real prices, fetch from API
    const apiPromises = supermarkets
      .filter(s => s.hasAPI && !supermarketsWithRealPrices.has(s.id))
      .map(s => fetchPriceFromAPI(s.id, grocery));
    
    const apiResults = await Promise.all(apiPromises);
    const validApiResults = apiResults.filter((result): result is SupermarketPrice => result !== null);
    
    // For remaining supermarkets, estimate prices
    const supermarketsWithPrices = new Set([
      ...Array.from(supermarketsWithRealPrices),
      ...validApiResults.map(p => 
        supermarkets.find(s => s.name === p.supermarketName)?.id || ''
      ).filter(id => id !== '')
    ]);
    
    // Estimate prices for ALL supermarkets without prices yet (not just a limited number)
    const remainingSupermarkets = supermarkets
      .filter(s => !supermarketsWithPrices.has(s.id));
    
    console.log(`Estimating prices for ${remainingSupermarkets.length} additional supermarkets`);
    
    const estimatedPrices: SupermarketPrice[] = [];
    
    for (const supermarket of remainingSupermarkets) {
      const estimatedPrice = await estimatePriceWithAI(grocery, [...realPrices, ...validApiResults]);
      estimatedPrice.supermarketName = supermarket.name;
      estimatedPrices.push(estimatedPrice);
    }
    
    // Combine all prices
    const allPrices = [...realPrices, ...validApiResults, ...estimatedPrices];
    console.log(`Total prices collected: ${allPrices.length} for ${supermarkets.length} supermarkets`);
    
    return allPrices;
  } catch (error) {
    console.error('Error fetching prices:', error);
    
    // Fallback to original method but ensure ALL supermarkets are included
    const apiPromises = supermarkets
      .filter(s => s.hasAPI)
      .map(s => fetchPriceFromAPI(s.id, grocery));
    
    const apiResults = await Promise.all(apiPromises);
    const validApiResults = apiResults.filter((result): result is SupermarketPrice => result !== null);
    
    // Get supermarkets already covered by API results
    const supermarketsWithAPIPrices = new Set(
      validApiResults.map(p => 
        supermarkets.find(s => s.name === p.supermarketName)?.id || ''
      ).filter(id => id !== '')
    );
    
    // Estimate prices for ALL remaining supermarkets
    const remainingSupermarkets = supermarkets
      .filter(s => !supermarketsWithAPIPrices.has(s.id));
    
    const estimatedPrices: SupermarketPrice[] = [];
    
    for (const supermarket of remainingSupermarkets) {
      const estimatedPrice = await estimatePriceWithAI(grocery, validApiResults);
      estimatedPrice.supermarketName = supermarket.name;
      estimatedPrices.push(estimatedPrice);
    }
    
    // Combine all prices
    const allPrices = [...validApiResults, ...estimatedPrices];
    console.log(`Total estimated prices: ${allPrices.length} for ${supermarkets.length} supermarkets`);
    
    return allPrices;
  }
}; 