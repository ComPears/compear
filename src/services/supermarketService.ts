// Update your fetchPricesForGrocery function in supermarketService.ts

import { Grocery, SupermarketPrice } from '../types';
import { findProductInSupermarkets } from './rawProductData';

// Your existing supermarkets array with logos
export const supermarkets = [
  // ... your existing supermarkets data
  {
    name: 'AH',
    logo: 'https://www.ah.nl/favicon.ico',
    url: 'https://www.ah.nl',
    id: '1',
  },
  {
    name: 'DIRK',
    logo: 'https://www.dirk.nl/favicon.ico',
    url: 'https://www.dirk.nl',
    id: '2',
  },
  {
    name: 'ALDI',
    logo: 'https://www.aldi.nl/favicon.ico',
    url: 'https://www.aldi.nl',
    id: '3',
  },
  {
    name: 'LIDL',
    logo: 'https://www.lidl.nl/favicon.ico',
    url: 'https://www.lidl.nl',
    id: '4',
  },
];

export const fetchPricesForGrocery = (grocery: Grocery): SupermarketPrice[] => {
  let prices: SupermarketPrice[] = [];
  // Search for the product in all supermarkets
  if (grocery?.searchKeyword) {
    const searchResults = findProductInSupermarkets(grocery?.searchKeyword);

    // console.log("Search result ", grocery?.searchKeyword, searchResults);
    
    // Convert the search results to SupermarketPrice format
    Object.entries(searchResults).forEach(([supermarketCode, products]) => {
      console.log("Data ", supermarketCode, products);
      if (products && products.length > 0) {
        products.forEach((product) => {
          prices.push({
            supermarketName: supermarketCode.toUpperCase(),
            price: product.p,
            productName: product.n,  // Include the actual product name
            size: product.s,         // Include the size information
            unitPrice: calculateUnitPrice(product.p, product.s, grocery.unit),
            onSale: product.o ? true : false,
            regularPrice: product.o || undefined,
            link: product.l
          });
        })
      }
    });
    return prices;
  }
  return [];
};

// Helper function to calculate unit price
function calculateUnitPrice(price: number, sizeString: string, unit: string): number | undefined {
  // Parse the size string to extract quantity and unit
  const sizeStr = sizeString.toLowerCase();
  
  // Extract numeric value
  const match = sizeStr.match(/(\d+(?:[.,]\d+)?)/);
  if (!match) return undefined;
  
  const quantity = parseFloat(match[1].replace(',', '.'));
  
  // Determine the unit from the size string
  let sizeUnit = '';
  if (sizeStr.includes('kg')) {
    sizeUnit = 'kg';
  } else if (sizeStr.includes(' g') || sizeStr.includes('gram')) {
    sizeUnit = 'g';
  } else if (sizeStr.includes(' l') && !sizeStr.includes('ml')) {
    sizeUnit = 'l';
  } else if (sizeStr.includes('ml')) {
    sizeUnit = 'ml';
  }
  
  // Calculate unit price based on the units
  if (unit === 'kg' || unit === 'gram') {
    // Convert to price per kg
    if (sizeUnit === 'kg') {
      return price / quantity;
    } else if (sizeUnit === 'g') {
      return (price / quantity) * 1000;
    }
  } else if (unit === 'liter' || unit === 'ml') {
    // Convert to price per liter
    if (sizeUnit === 'l') {
      return price / quantity;
    } else if (sizeUnit === 'ml') {
      return (price / quantity) * 1000;
    }
  }
  
  return undefined;
}