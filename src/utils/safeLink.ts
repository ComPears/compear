const ALLOWED_HOSTS = new Set([
  // Netherlands
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
  // United Kingdom
  'tesco.com',
  'www.tesco.com',
  'sainsburys.co.uk',
  'www.sainsburys.co.uk',
  'asda.com',
  'www.asda.com',
  'morrisons.com',
  'www.morrisons.com',
  'groceries.morrisons.com',
  'aldi.co.uk',
  'www.aldi.co.uk',
  'lidl.co.uk',
  'www.lidl.co.uk',
  // Germany
  'rewe.de',
  'www.rewe.de',
  'edeka.de',
  'www.edeka.de',
  'lidl.de',
  'www.lidl.de',
  'aldi-sued.de',
  'www.aldi-sued.de',
  'penny.de',
  'www.penny.de',
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
