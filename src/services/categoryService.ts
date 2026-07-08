/**
 * Category service for managing product categories
 */

export type ProductCategory = 
  | 'Fruits & Vegetables'
  | 'Dairy & Eggs'
  | 'Meat & Seafood'
  | 'Beverages'
  | 'Bakery'
  | 'Snacks'
  | 'Frozen Foods'
  | 'Pantry'
  | 'Personal Care'
  | 'Household'
  | 'Other';

/**
 * Common product categories
 */
export const CATEGORIES: ProductCategory[] = [
  'Fruits & Vegetables',
  'Dairy & Eggs',
  'Meat & Seafood',
  'Beverages',
  'Bakery',
  'Snacks',
  'Frozen Foods',
  'Pantry',
  'Personal Care',
  'Household',
  'Other',
];

/**
 * Get display name for a category
 */
export const getCategoryDisplayName = (category: string | undefined): string => {
  if (!category) return 'Other';
  return category;
};

/**
 * Get category icon (can be extended with Material-UI icons)
 */
export const getCategoryIcon = (category: string | undefined): string => {
  const iconMap: Record<string, string> = {
    'Fruits & Vegetables': '🥬',
    'Dairy & Eggs': '🥛',
    'Meat & Seafood': '🥩',
    'Beverages': '🥤',
    'Bakery': '🍞',
    'Snacks': '🍪',
    'Frozen Foods': '🧊',
    'Pantry': '🥫',
    'Personal Care': '🧴',
    'Household': '🧹',
    'Other': '📦',
  };
  
  return iconMap[category || 'Other'] || '📦';
};

/**
 * Normalize category name (handle variations)
 */
export const normalizeCategory = (category: string | undefined): ProductCategory => {
  if (!category) return 'Other';
  
  const normalized = category.trim();
  
  // Map common variations to standard categories
  const categoryMap: Record<string, ProductCategory> = {
    'fruits': 'Fruits & Vegetables',
    'vegetables': 'Fruits & Vegetables',
    'fruit': 'Fruits & Vegetables',
    'vegetable': 'Fruits & Vegetables',
    'dairy': 'Dairy & Eggs',
    'eggs': 'Dairy & Eggs',
    'milk': 'Dairy & Eggs',
    'meat': 'Meat & Seafood',
    'seafood': 'Meat & Seafood',
    'fish': 'Meat & Seafood',
    'beverage': 'Beverages',
    'drink': 'Beverages',
    'drinks': 'Beverages',
    'bread': 'Bakery',
    'bakery items': 'Bakery',
    'snack': 'Snacks',
    'frozen': 'Frozen Foods',
    'pantry items': 'Pantry',
    'personal care': 'Personal Care',
    'household items': 'Household',
  };
  
  const lowerCategory = normalized.toLowerCase();
  
  // Check for exact match first
  if (CATEGORIES.includes(normalized as ProductCategory)) {
    return normalized as ProductCategory;
  }
  
  // Check for variations
  for (const [key, value] of Object.entries(categoryMap)) {
    if (lowerCategory.includes(key)) {
      return value;
    }
  }
  
  return 'Other';
};

/**
 * Get all unique categories from a list of products
 */
export const extractCategories = (categories: (string | undefined)[]): ProductCategory[] => {
  const uniqueCategories = new Set<ProductCategory>();
  
  categories.forEach(cat => {
    if (cat) {
      uniqueCategories.add(normalizeCategory(cat));
    }
  });
  
  return Array.from(uniqueCategories).sort();
};

/**
 * Filter products by category
 * For GroceryWithPrices, also checks the category from prices
 */
export const filterByCategory = <T extends { category?: string }>(
  items: T[],
  category: ProductCategory | 'All'
): T[] => {
  if (category === 'All') {
    return items;
  }
  
  return items.filter(item => {
    // Check item's category
    let itemCategory = normalizeCategory(item.category);
    
    // For GroceryWithPrices, also check the first price's category
    if (itemCategory === 'Other' && 'prices' in item && Array.isArray((item as any).prices)) {
      const prices = (item as any).prices;
      if (prices.length > 0 && prices[0].category) {
        itemCategory = normalizeCategory(prices[0].category);
      }
    }
    
    return itemCategory === category;
  });
};

/**
 * Group products by category
 */
export const groupByCategory = <T extends { category?: string }>(
  items: T[]
): Record<ProductCategory, T[]> => {
  const grouped: Record<string, T[]> = {};
  
  // Initialize all categories
  CATEGORIES.forEach(cat => {
    grouped[cat] = [];
  });
  
  // Group items
  items.forEach(item => {
    const category = normalizeCategory(item.category);
    if (!grouped[category]) {
      grouped[category] = [];
    }
    grouped[category].push(item);
  });
  
  return grouped as Record<ProductCategory, T[]>;
};

