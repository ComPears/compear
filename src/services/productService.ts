import { ProductVariant } from '../types';

// Mock database of common grocery products with variants
export const productDatabase: Record<string, ProductVariant[]> = {
  'milk': [
    {
      id: 'milk-whole-ah',
      name: 'Milk',
      variant: 'Whole Milk (Volle Melk) 3.5%',
      brand: 'Albert Heijn',
      unit: 'liter',
      defaultQuantity: 1,
      imageUrl: 'https://static.ah.nl/dam/product/AHI_43545239303733373731?revLabel=1&rendition=800x800_JPG_Q90&fileType=binary',
      category: 'dairy'
    },
    {
      id: 'milk-semi-ah',
      name: 'Milk',
      variant: 'Semi-Skimmed (Halfvolle Melk) 1.5%',
      brand: 'Albert Heijn',
      unit: 'liter',
      defaultQuantity: 1,
      imageUrl: 'https://static.ah.nl/dam/product/AHI_43545239303733383134?revLabel=3&rendition=800x800_JPG_Q90&fileType=binary',
      category: 'dairy'
    },
    {
      id: 'milk-skim-ah',
      name: 'Milk',
      variant: 'Skimmed (Magere Melk) 0.3%',
      brand: 'Albert Heijn',
      unit: 'liter',
      defaultQuantity: 1,
      imageUrl: 'https://static.ah.nl/dam/product/AHI_43545239303733383435?revLabel=1&rendition=800x800_JPG_Q90&fileType=binary',
      category: 'dairy'
    },
    {
      id: 'milk-whole-jumbo',
      name: 'Milk',
      variant: 'Whole Milk (Volle Melk) 3.5%',
      brand: 'Jumbo',
      unit: 'liter',
      defaultQuantity: 1,
      imageUrl: 'https://assets.smaak.jumbo.com/product/96026VAR/images/jumbo-volle-melk/1.600x600.jpg',
      category: 'dairy'
    },
    {
      id: 'milk-semi-jumbo',
      name: 'Milk',
      variant: 'Semi-Skimmed (Halfvolle Melk) 1.5%',
      brand: 'Jumbo',
      unit: 'liter',
      defaultQuantity: 1,
      imageUrl: 'https://assets.smaak.jumbo.com/product/96025VAR/images/jumbo-halfvolle-melk/1.600x600.jpg',
      category: 'dairy'
    }
  ],
  'bread': [
    {
      id: 'bread-whole-ah',
      name: 'Bread',
      variant: 'Whole Wheat (Volkoren)',
      brand: 'Albert Heijn',
      unit: 'piece',
      defaultQuantity: 1,
      imageUrl: 'https://static.ah.nl/dam/product/AHI_43545239383931393537?revLabel=1&rendition=800x800_JPG_Q90&fileType=binary',
      category: 'bakery'
    },
    {
      id: 'bread-white-ah',
      name: 'Bread',
      variant: 'White (Wit)',
      brand: 'Albert Heijn',
      unit: 'piece',
      defaultQuantity: 1,
      imageUrl: 'https://static.ah.nl/dam/product/AHI_43545239383931393834?revLabel=1&rendition=800x800_JPG_Q90&fileType=binary',
      category: 'bakery'
    },
    {
      id: 'bread-whole-jumbo',
      name: 'Bread',
      variant: 'Whole Wheat (Volkoren)',
      brand: 'Jumbo',
      unit: 'piece',
      defaultQuantity: 1,
      imageUrl: 'https://assets.smaak.jumbo.com/product/16485VAR/images/jumbo-volkoren-brood-heel/1.600x600.jpg',
      category: 'bakery'
    }
  ],
  'coffee': [
    {
      id: 'coffee-beans-ah',
      name: 'Coffee',
      variant: 'Beans (Bonen)',
      brand: 'Perla',
      unit: 'kg',
      defaultQuantity: 0.5,
      imageUrl: 'https://static.ah.nl/dam/product/AHI_43545239303733343435?revLabel=1&rendition=800x800_JPG_Q90&fileType=binary',
      category: 'drinks'
    },
    {
      id: 'coffee-ground-ah',
      name: 'Coffee',
      variant: 'Ground (Gemalen)',
      brand: 'Douwe Egberts',
      unit: 'kg',
      defaultQuantity: 0.5,
      imageUrl: 'https://static.ah.nl/dam/product/AHI_43545239383534313735?revLabel=1&rendition=800x800_JPG_Q90&fileType=binary',
      category: 'drinks'
    }
  ],
  'popcorn': [
    {
      id: 'popcorn-sweet-ah',
      name: 'Popcorn',
      variant: 'Sweet (Zoet)',
      brand: 'Lay\'s',
      unit: 'gram',
      defaultQuantity: 100,
      imageUrl: 'https://static.ah.nl/dam/product/AHI_43545239383330343635?revLabel=1&rendition=800x800_JPG_Q90&fileType=binary',
      category: 'snacks'
    },
    {
      id: 'popcorn-salt-ah',
      name: 'Popcorn',
      variant: 'Salty (Zout)',
      brand: 'Lay\'s',
      unit: 'gram',
      defaultQuantity: 100,
      imageUrl: 'https://static.ah.nl/dam/product/AHI_43545239383330343832?revLabel=1&rendition=800x800_JPG_Q90&fileType=binary',
      category: 'snacks'
    },
    {
      id: 'popcorn-caramel-ah',
      name: 'Popcorn',
      variant: 'Caramel',
      brand: 'Lay\'s',
      unit: 'gram',
      defaultQuantity: 100,
      imageUrl: 'https://static.ah.nl/dam/product/AHI_43545239383330343733?revLabel=1&rendition=800x800_JPG_Q90&fileType=binary',
      category: 'snacks'
    }
  ],
  'cheese': [
    {
      id: 'cheese-young-ah',
      name: 'Cheese',
      variant: 'Young (Jong)',
      brand: 'Goudse',
      unit: 'gram',
      defaultQuantity: 200,
      imageUrl: 'https://static.ah.nl/dam/product/AHI_43545239383330373732?revLabel=1&rendition=800x800_JPG_Q90&fileType=binary',
      category: 'dairy'
    },
    {
      id: 'cheese-old-ah',
      name: 'Cheese',
      variant: 'Old (Oud)',
      brand: 'Goudse',
      unit: 'gram',
      defaultQuantity: 200,
      imageUrl: 'https://static.ah.nl/dam/product/AHI_43545239383330373832?revLabel=1&rendition=800x800_JPG_Q90&fileType=binary',
      category: 'dairy'
    },
    {
      id: 'cheese-goat-ah',
      name: 'Cheese',
      variant: 'Goat (Geiten)',
      brand: 'Président',
      unit: 'gram',
      defaultQuantity: 150,
      imageUrl: 'https://static.ah.nl/dam/product/AHI_43545239383536323036?revLabel=1&rendition=800x800_JPG_Q90&fileType=binary',
      category: 'dairy'
    }
  ]
};

/**
 * Search for product variants based on a search term
 */
export const searchProducts = (term: string): ProductVariant[] => {
  if (!term || term.trim().length === 0) return [];
  
  term = term.toLowerCase().trim();
  
  // Check for exact match in the database
  if (productDatabase[term]) {
    return productDatabase[term];
  }
  
  // Search through all products for partial matches
  const results: ProductVariant[] = [];
  
  // Collect all products from the database
  const allProducts = Object.values(productDatabase).flat();
  
  // Search through all products and their variants
  for (const product of allProducts) {
    if (
      product.name.toLowerCase().includes(term) ||
      product.variant.toLowerCase().includes(term) ||
      product.brand.toLowerCase().includes(term)
    ) {
      results.push(product);
    }
  }
  
  return results;
};

/**
 * Get a product by ID
 */
export const getProductById = (id: string): ProductVariant | undefined => {
  const allProducts = Object.values(productDatabase).flat();
  return allProducts.find(product => product.id === id);
}; 