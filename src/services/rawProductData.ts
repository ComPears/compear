import supermarketsData from '../data/supermarkets_merged.json';

export interface SupermarketProduct {
  n: string;
  o: any;
  p: string;
  s: string;
  l?: string; // Added optional image link field
}

export interface Supermarket {
  n: string;
  u: string;
  i: string;
  d: SupermarketProduct[];
};



// Import supermarkets from JSON file with proper typing
export const supermarkets: Supermarket[] = supermarketsData as Supermarket[];


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
  console.log("Finding products in supermarkets for:", term);
  if (!term || term.trim().length === 0) return {};
  
  term = term.toLowerCase().trim();
  
  // Create a result object with supermarket codes as keys
  const results: Record<string, any[]> = {};
  const supermarketValidItems = filterValidItems();
  
  // Search through each supermarket
  supermarketValidItems.forEach(supermarket => {
    // Improved matching: search for individual terms when multiple words are entered
    const searchTerms = term.split(/\s+/);

    console.log("Search terms ", searchTerms);
    
    const matchingProducts = supermarket.d.filter(product => {
      const productName = product.n.toLowerCase();
      
      // Match exact phrase first
      if (productName.includes(term)) {
        return true;
      }
      
      // For multi-word searches, check if ANY of the terms match
      if (searchTerms.length > 1) {
        return searchTerms.some(searchTerm => productName.includes(searchTerm));
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
      console.log(`Found ${matchingProducts.length} matches in ${supermarket.n}`);
      // Use the supermarket's code (n) as the key
      results[supermarket.n.toLowerCase()] = matchingProducts.map(product => ({
        n: product.n,
        o: product.o,
        p: parseFloat(product.p),  // Convert string price to number
        s: product.s,
        l: product.l  // Use actual image link from JSON
      }));
    }
  });
  
  console.log("Search results:", results);
  // Simulate async behavior to match the expected interface
  return results;
};