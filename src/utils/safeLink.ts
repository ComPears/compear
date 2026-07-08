const ALLOWED_HOSTS = new Set([
  'ah.nl',
  'www.ah.nl',
  'dirk.nl',
  'www.dirk.nl',
  'aldi.nl',
  'www.aldi.nl',
  'lidl.nl',
  'www.lidl.nl',
  'jumbo.com',
  'www.jumbo.com',
  'plus.nl',
  'www.plus.nl',
  'coop.nl',
  'www.coop.nl',
]);

export function sanitizeProductLink(link: string | null | undefined): string | undefined {
  if (!link) return undefined;

  try {
    const url = new URL(link);
    if (url.protocol !== 'https:') return undefined;
    if (!ALLOWED_HOSTS.has(url.hostname.toLowerCase())) return undefined;
    return url.toString();
  } catch {
    return undefined;
  }
}
