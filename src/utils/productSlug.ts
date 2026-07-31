import { Product } from '../api/client';

export function productSlug(product: Pick<Product, 'canonicalName' | 'productName' | 'packageSize'>): string {
  return `${product.canonicalName || product.productName} ${product.packageSize}`
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120);
}

export function productPath(country: string, product: Pick<Product, 'canonicalName' | 'productName' | 'packageSize'>): string {
  return `/${country}/products/${productSlug(product)}`;
}
