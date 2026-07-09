import { Product } from '../api/client';
import { Grocery } from '../types';

export function productToGrocery(product: Product): Grocery {
  let unit: Grocery['unit'] = 'piece';
  const sizeStr = product.packageSize.toLowerCase();

  if (sizeStr.includes('kg')) unit = 'kg';
  else if (sizeStr.includes('g')) unit = 'gram';
  else if (sizeStr.includes('l') && !sizeStr.includes('ml')) unit = 'liter';
  else if (sizeStr.includes('ml')) unit = 'ml';

  const match = sizeStr.match(/(\d+(?:\.\d+)?)/);
  const quantity = match ? parseFloat(match[1]) : 1;

  return {
    id: `supermarket-${Date.now()}-${Math.random()}`,
    name: product.productName,
    unit,
    quantity,
    variant: product.store,
    searchKeyword: product.productName,
    canonicalName: product.canonicalName,
    identityKey: product.identityKey,
    barcode: product.barcode,
    productId: product.id,
    packageSize: product.packageSize,
    category: product.category,
  };
}
