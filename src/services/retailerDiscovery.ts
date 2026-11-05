import { ApiCountry } from '../api/client';

export type Department = 'grocery' | 'household' | 'family' | 'electronics';
export interface DiscoveryShop { id: string; name: string; url: string; departments: Department[]; queryParameter?: string }
const everyday: Department[] = ['grocery', 'household', 'family'];
const all: Department[] = [...everyday, 'electronics'];
// Discovery links only. These shops MUST NOT be counted as ingested price sources.
// A new price source requires its own approved connector, freshness and identity tests.
const SHOPS: Record<ApiCountry, DiscoveryShop[]> = {
  uk: [
    { id: 'amazon-uk', name: 'Amazon UK', url: 'https://www.amazon.co.uk/s', queryParameter: 'k', departments: all },
    { id: 'ocado', name: 'Ocado', url: 'https://www.ocado.com/', departments: everyday },
    { id: 'waitrose', name: 'Waitrose', url: 'https://www.waitrose.com/', departments: everyday },
    { id: 'iceland', name: 'Iceland', url: 'https://www.iceland.co.uk/', departments: everyday },
    { id: 'argos', name: 'Argos', url: 'https://www.argos.co.uk/', departments: ['household', 'family', 'electronics'] },
    { id: 'currys', name: 'Currys', url: 'https://www.currys.co.uk/', departments: ['household', 'electronics'] },
  ],
  nl: [
    { id: 'amazon-nl', name: 'Amazon NL', url: 'https://www.amazon.nl/s', queryParameter: 'k', departments: all },
    { id: 'bol', name: 'bol', url: 'https://www.bol.com/nl/nl/s/', queryParameter: 'searchtext', departments: ['household', 'family', 'electronics'] },
    { id: 'picnic-nl', name: 'Picnic', url: 'https://picnic.app/nl/', departments: everyday },
    { id: 'crisp', name: 'Crisp', url: 'https://crisp.nl/', departments: ['grocery'] },
    { id: 'coolblue', name: 'Coolblue', url: 'https://www.coolblue.nl/', departments: ['household', 'electronics'] },
  ],
  de: [
    { id: 'amazon-de', name: 'Amazon DE', url: 'https://www.amazon.de/s', queryParameter: 'k', departments: all },
    { id: 'dm', name: 'dm', url: 'https://www.dm.de/', departments: everyday },
    { id: 'rossmann', name: 'ROSSMANN', url: 'https://www.rossmann.de/de/', departments: everyday },
    { id: 'picnic-de', name: 'Picnic', url: 'https://picnic.app/de/', departments: everyday },
    { id: 'saturn', name: 'Saturn', url: 'https://www.saturn.de/', departments: ['household', 'electronics'] },
  ],
};

export function discoveryShops(country: ApiCountry, department: Department): DiscoveryShop[] {
  return SHOPS[country].filter(shop => shop.departments.includes(department)).map(shop => ({ ...shop, departments: [...shop.departments] }));
}

export function discoveryLink(country: ApiCountry, id: string, query = ''): string | undefined {
  const shop = SHOPS[country].find(candidate => candidate.id === id);
  if (!shop) return undefined;
  const url = new URL(shop.url);
  const term = query.replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, 200);
  if (term && shop.queryParameter) url.searchParams.set(shop.queryParameter, term);
  return url.href;
}
