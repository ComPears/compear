import { Grocery, SupermarketPrice, Supermarket } from '../types';
import { fetchCompare, fetchProducts, Product } from '../api/client';
import { productToSupermarketPrice } from '../utils/productMapper';
import { filterBySearch } from '../utils/productGrouping';

export const supermarkets: Supermarket[] = [
  {
    name: 'AH',
    logo: 'https://www.ah.nl/favicon.ico',
    id: '1',
    hasAPI: true,
  },
  {
    name: 'DIRK',
    logo: 'https://www.dirk.nl/favicon.ico',
    id: '2',
    hasAPI: true,
  },
  {
    name: 'ALDI',
    logo: 'https://www.aldi.nl/favicon.ico',
    id: '3',
    hasAPI: true,
  },
  {
    name: 'LIDL',
    logo: 'https://www.lidl.nl/favicon.ico',
    id: '4',
    hasAPI: true,
  },
  {
    name: 'JUMBO',
    logo: 'https://www.jumbo.com/favicon.ico',
    id: '5',
    hasAPI: true,
  },
  {
    name: 'PLUS',
    logo: 'https://www.plus.nl/favicon.ico',
    id: '6',
    hasAPI: true,
  },
  {
    name: 'COOP',
    logo: 'https://www.coop.nl/favicon.ico',
    id: '7',
    hasAPI: true,
  },
];

async function resolveComparableProducts(grocery: Grocery): Promise<Product[]> {
  if (grocery.barcode) {
    return fetchProducts({ barcode: grocery.barcode });
  }

  if (grocery.identityKey) {
    const compared = await fetchCompare(grocery.canonicalName ?? '', grocery.identityKey);
    if (compared.length > 0) return compared;
  }

  if (grocery.canonicalName) {
    const compared = await fetchCompare(grocery.canonicalName);
    if (compared.length > 0) return compared;
  }

  if (grocery.searchKeyword) {
    const results = await fetchProducts({ search: grocery.searchKeyword });
    const filtered = filterBySearch(results, grocery.searchKeyword);
    if (filtered.length > 0) return filtered;

    if (grocery.productId) {
      const picked = results.find((p) => p.id === grocery.productId);
      if (picked?.canonicalName) {
        return fetchCompare(picked.canonicalName);
      }
      if (picked) return [picked];
    }
  }

  return [];
}

/** Fetch comparable prices for the grocery item the user picked (not fuzzy re-search). */
export const fetchPricesForGrocery = async (
  grocery: Grocery,
  countryCode: string = 'nl'
): Promise<SupermarketPrice[]> => {
  if (countryCode !== 'nl') {
    return [];
  }

  const products = await resolveComparableProducts(grocery);
  return products.map((product) => {
    const mapped = productToSupermarketPrice(product, grocery.unit);
    return {
      ...mapped,
      unitPrice:
        calculateUnitPrice(product.effectivePrice, product.packageSize, grocery.unit) ??
        mapped.unitPrice,
      category: product.category,
    };
  });
};

function calculateUnitPrice(
  price: number,
  sizeString: string,
  unit: string
): number | undefined {
  const sizeStr = sizeString.toLowerCase();
  const match = sizeStr.match(/(\d+(?:[.,]\d+)?)/);
  if (!match) return undefined;

  const quantity = parseFloat(match[1].replace(',', '.'));
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

  if (unit === 'kg' || unit === 'gram') {
    if (sizeUnit === 'kg') {
      return price / quantity;
    }
    if (sizeUnit === 'g') {
      return (price / quantity) * 1000;
    }
  } else if (unit === 'liter' || unit === 'ml') {
    if (sizeUnit === 'l') {
      return price / quantity;
    }
    if (sizeUnit === 'ml') {
      return (price / quantity) * 1000;
    }
  }

  return undefined;
}
