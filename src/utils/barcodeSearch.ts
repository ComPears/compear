import { fetchCompare, fetchProducts, Product, ApiCountry } from '../api/client';
import { normalizeBarcode } from './barcode';

/** Expand barcode hits to cross-store matches via identityKey/canonicalName. */
export async function fetchProductsByBarcode(
  rawBarcode: string,
  country: ApiCountry = 'nl',
  options?: { signal?: AbortSignal }
): Promise<{ products: Product[]; normalized: string | null; invalid: boolean }> {
  const normalized = normalizeBarcode(rawBarcode);
  if (!normalized) {
    return { products: [], normalized: null, invalid: true };
  }

  const byBarcode = await fetchProducts({ barcode: normalized }, country, options);
  if (byBarcode.length === 0) {
    return { products: [], normalized, invalid: false };
  }

  const seed = byBarcode[0];
  if (seed.identityKey) {
    const compared = await fetchCompare(seed.canonicalName, seed.identityKey, country);
    if (compared.length > 0) {
      return { products: compared, normalized, invalid: false };
    }
  }
  if (seed.canonicalName) {
    const compared = await fetchCompare(seed.canonicalName, undefined, country);
    if (compared.length > 0) {
      return { products: compared, normalized, invalid: false };
    }
  }

  return { products: byBarcode, normalized, invalid: false };
}

export function isAbortError(err: unknown): boolean {
  if (err instanceof DOMException && err.name === 'AbortError') return true;
  if (typeof err === 'object' && err !== null && 'code' in err && (err as { code: string }).code === 'ERR_CANCELED') {
    return true;
  }
  return false;
}
