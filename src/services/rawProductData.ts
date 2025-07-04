import supermarketsData from '../data/supermarkets.json';

export interface SupermarketProduct {
  n: string;
  o: any;
  p: string;
  s: string;
  l?: string;
};

export interface Supermarket {
  n: string;
  u: string;
  i: string;
  d: SupermarketProduct[];
};

// Type the imported JSON data
const supermarkets: Supermarket[] = supermarketsData as Supermarket[];

export const filterValidItems = () => {
  const filteredSuperMarket = supermarkets.map(supermarket => ({
    ...supermarket,
    d: supermarket.d.filter(item => {
      const hasValidName = item.n && item.n.trim() !== '';
      const hasValidPrice = item.p && item.p.trim() !== '';
      return hasValidName && hasValidPrice;
    })
  }));
  return filteredSuperMarket;
}

export const findProductInSupermarkets = (term: string): Record<string, any[]> => {
  if (!term || term.trim().length === 0) return {};
  
  term = term.toLowerCase().trim();
  
  // Create a result object with supermarket codes as keys
  const results: Record<string, any[]> = {};
  const supermarketValidItems = filterValidItems();
  
  // Search through each supermarket
  supermarketValidItems.forEach(supermarket => {
    
    const matchingProducts = supermarket.d.filter(product => {
      const productName = product.n.toLowerCase();
      
      // Match exact phrase first
      if (productName.includes(term)) {
        return true;
      }
      
      // For single terms, also try partial matching for terms longer than 3 chars
      if (term.length > 3) {
        return productName.split(/\s+/).some(word => 
          word.startsWith(term) || (term.length > 4 && word.includes(term))
        );
      }
      
      return false;
    });
    
    if (matchingProducts.length > 0) {
      // Use the supermarket's code (n) as the key
      results[supermarket.n.toLowerCase()] = matchingProducts.map(product => ({
        n: product.n,
        o: product.o,
        p: parseFloat(product.p),  // Convert string price to number
        s: product.s,
        l: product.l || `${supermarket.u}${product.n.toLowerCase().replace(/\s+/g, '-')}`
      }));
    }
  });
  
  return results;
};