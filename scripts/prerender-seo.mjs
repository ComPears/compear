import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { fetchSeoIndex } from './fetch-seo-index.mjs';
import { escapeHtml, isSafeProductSlug, renderProductBody } from './seo-safety.mjs';

const projectDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const distDir = path.join(projectDir, 'dist');
const dataRoot = path.resolve(projectDir, '../backend/src/data');
const siteUrl = (process.env.VITE_SITE_URL || 'https://www.compears.shop').replace(/\/$/, '');
const absoluteRoute = (route) => `${siteUrl}${route.endsWith('/') ? route : `${route}/`}`;
const shell = fs.readFileSync(path.join(distDir, 'index.html'), 'utf8');
const categories = ['Fruits & Vegetables', 'Dairy & Eggs', 'Meat & Seafood', 'Beverages', 'Bakery', 'Snacks', 'Frozen Foods', 'Pantry', 'Personal Care', 'Household', 'Other'];
const guideTopics = JSON.parse(fs.readFileSync(path.join(projectDir, 'src/config/shopping-guides.json'), 'utf8'));
const localCategories = {
  nl: ['Groente en fruit', 'Zuivel en eieren', 'Vlees en vis', 'Dranken', 'Brood en bakkerij', 'Snacks', 'Diepvries', 'Voorraadkast', 'Persoonlijke verzorging', 'Huishouden', 'Overig'],
  de: ['Obst und Gemüse', 'Milchprodukte und Eier', 'Fleisch und Fisch', 'Getränke', 'Brot und Backwaren', 'Snacks', 'Tiefkühlprodukte', 'Vorräte', 'Körperpflege', 'Haushalt', 'Sonstiges'],
};

const slugify = (value) => String(value).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 120);
const categorySlug = (value) => slugify(value);
const productSlug = (product) => slugify(`${product.canonicalName || product.productName} ${normalizePackage(product).packageSize}`);

function normalizePackage(product) {
  const text = `${product.productName || ''} ${product.canonicalName || ''}`;
  const multiPack = text.match(/\b(\d+)\s*(?:x|×)\s*(\d+(?:[.,]\d+)?)\s*(kg|g|ml|cl|litres?|liters?|l|pints?)\b/i);
  if (multiPack) {
    const count = Number(multiPack[1]);
    const amount = Number(multiPack[2].replace(',', '.'));
    const unit = multiPack[3].toLowerCase();
    const multiplier = unit === 'kg' ? 1000 : unit === 'g' || unit === 'ml' ? 1 : unit === 'cl' ? 10 : unit.startsWith('pint') ? 568.261 : 1000;
    const label = unit.startsWith('lit') ? 'l' : unit.startsWith('pint') ? (amount === 1 ? 'pint' : 'pints') : unit;
    return { ...product, packageSize: `${count} × ${amount} ${label}`, weightInGrams: Math.round(count * amount * multiplier) };
  }
  const matches = [...text.matchAll(/(\d+(?:[.,]\d+)?)\s*(kg|g|ml|cl|litres?|liters?|l|pints?)\b/gi)];
  if (!matches.length) return product;
  const match = matches[matches.length - 1];
  const amount = Number(match[1].replace(',', '.'));
  const unit = match[2].toLowerCase();
  const grams = unit === 'kg' ? amount * 1000 : unit === 'g' || unit === 'ml' ? amount : unit === 'cl' ? amount * 10 : unit.startsWith('pint') ? amount * 568.261 : amount * 1000;
  const label = unit.startsWith('lit') ? 'l' : unit.startsWith('pint') ? (amount === 1 ? 'pint' : 'pints') : unit;
  return { ...product, packageSize: `${amount} ${label}`, weightInGrams: Math.round(grams) };
}

function inferCategory(product) {
  if (categories.includes(product.category) && product.category !== 'Other') return product.category;
  const value = `${product.productName} ${product.canonicalName}`.toLowerCase();
  const rules = [
    ['Dairy & Eggs', /\b(milk|melk|yogh?urt|cheese|kaas|butter|egg|eieren)\b/],
    ['Bakery', /\b(bread|brood|croissant|bagel|rolls?|buns?)\b/],
    ['Beverages', /\b(coffee|koffie|tea|thee|juice|sap|water|cola|drink)\b/],
    ['Fruits & Vegetables', /\b(apple|appel|banana|banaan|tomato|tomaat|vegetable|groente|fruit)\b/],
    ['Meat & Seafood', /\b(chicken|kip|beef|steak|fish|vis|salmon|zalm|pork)\b/],
    ['Frozen Foods', /\b(frozen|diepvries|ice cream|ijs)\b/],
    ['Snacks', /\b(crisps?|chips|chocolate|cookie|biscuit|snack)\b/],
    ['Personal Care', /\b(shampoo|toothpaste|deodorant|soap|razor)\b/],
    ['Household', /\b(detergent|cleaner|toilet roll|washing|dishwasher)\b/],
    ['Pantry', /\b(pasta|rice|rijst|flour|meel|sauce|oil|cereal)\b/],
  ];
  return rules.find(([, pattern]) => pattern.test(value))?.[0] || 'Other';
}

async function readCountry(country) {
  const directory = path.join(dataRoot, country);
  if (!fs.existsSync(directory)) {
    const apiUrl = (process.env.VITE_API_URL || 'https://compear-backend.onrender.com').replace(/\/$/, '');
    try {
      return { products: [], groups: await fetchSeoIndex(apiUrl, country) };
    } catch (error) {
      console.warn(`Product SEO index unavailable for ${country}; generating core landing pages only.`, error.message);
      return { products: [], groups: [] };
    }
  }
  const products = fs.readdirSync(directory)
    .filter((file) => file.endsWith('.json'))
    .flatMap((file) => JSON.parse(fs.readFileSync(path.join(directory, file), 'utf8')))
    .map((product) => ({ ...normalizePackage(product), category: inferCategory(product) }));
  return { products, groups: null };
}

function pageHead({ title, description, url, locale, type = 'website', schema, alternates = [], noIndex = false }) {
  return [
    `<title>${escapeHtml(title)}</title>`,
    `<meta name="description" content="${escapeHtml(description)}">`,
    `<meta name="robots" content="${noIndex ? 'noindex,follow' : 'index,follow,max-image-preview:large'}">`,
    `<link rel="canonical" href="${escapeHtml(url)}">`,
    `<meta property="og:title" content="${escapeHtml(title)}">`,
    `<meta property="og:description" content="${escapeHtml(description)}">`,
    `<meta property="og:url" content="${escapeHtml(url)}">`,
    `<meta property="og:type" content="${escapeHtml(type)}">`,
    `<meta property="og:locale" content="${escapeHtml(locale)}">`,
    '<meta name="twitter:card" content="summary">',
    ...alternates.map(({ lang, href }) => `<link rel="alternate" hreflang="${escapeHtml(lang)}" href="${escapeHtml(href)}">`),
    schema ? `<script type="application/ld+json">${JSON.stringify(schema).replace(/</g, '\\u003c')}</script>` : '',
  ].join('\n');
}

function writePage(route, metadata, body) {
  const output = path.join(distDir, route.replace(/^\//, ''), 'index.html');
  fs.mkdirSync(path.dirname(output), { recursive: true });
  let html = shell
    .replace(/<title>[\s\S]*?<\/title>/i, '')
    .replace(/<meta\s+name="description"[\s\S]*?>/i, '')
    .replace(/<meta\s+name="robots"[\s\S]*?>/i, '')
    .replace('</head>', `${pageHead(metadata)}\n</head>`)
    .replace('<div id="root"></div>', `<div id="root"><main data-prerendered="true">${body}</main></div>`);
  fs.writeFileSync(output, html);
  const observedAt = metadata.schema?.dateModified;
  if (typeof observedAt === 'string' && Number.isFinite(Date.parse(observedAt)) && Date.parse(observedAt) <= Date.now()) lastModified.set(absoluteRoute(route), observedAt.slice(0, 10));
}

const sitemap = [];
const lastModified = new Map();
for (const country of ['uk', 'nl', 'de']) {
  const locale = country === 'uk' ? 'en_GB' : country === 'de' ? 'de_DE' : 'nl_NL';
  const currency = country === 'uk' ? 'GBP' : 'EUR';
  const symbol = country === 'uk' ? '£' : '€';
  const source = await readCountry(country);
  const bySlug = new Map();
  for (const product of source.products) {
    const slug = productSlug(product);
    const list = bySlug.get(slug) || [];
    list.push(product);
    bySlug.set(slug, list);
  }
  const candidateGroups = source.groups
    ? source.groups.map((group) => [group.slug, group.offers])
    : [...bySlug.entries()].filter(([, offers]) => new Set(offers.map((offer) => offer.store)).size > 1);
  const comparable = candidateGroups.filter(([slug, offers]) =>
    isSafeProductSlug(slug) && Array.isArray(offers) && offers.length > 0);
  const homeRoute = `/${country}`;
  const homeTitle = country === 'uk' ? 'Compare UK supermarket prices | ComPear' : country === 'de' ? 'Supermarktpreise vergleichen | ComPear' : 'Vergelijk supermarktprijzen | ComPear';
  const homeDescription = country === 'uk' ? 'Compare grocery prices across Tesco, Sainsbury’s, Asda, Morrisons, Aldi and Lidl.' : country === 'de' ? 'Aktuelle Lebensmittelpreise deutscher Supermärkte vergleichen und Packungsgrößen prüfen.' : 'Vergelijk actuele boodschappenprijzen bij Nederlandse supermarkten.';
  const categoryLabel = category => localCategories[country]?.[categories.indexOf(category)] ?? category;
  const homeLinks = categories.filter((category) => category !== 'Other').map((category) => `<li><a href="/${country}/categories/${categorySlug(category)}">${escapeHtml(categoryLabel(category))}</a></li>`).join('');
  const homeAlternates = [{ lang: 'en-GB', href: absoluteRoute('/uk') }, { lang: 'nl-NL', href: absoluteRoute('/nl') }, { lang: 'de-DE', href: absoluteRoute('/de') }, { lang: 'x-default', href: absoluteRoute('/uk') }];
  writePage(homeRoute, { title: homeTitle, description: homeDescription, url: absoluteRoute(homeRoute), locale, alternates: homeAlternates, schema: { '@context': 'https://schema.org', '@type': 'WebSite', name: 'ComPear', url: absoluteRoute(`/${country}`), potentialAction: { '@type': 'SearchAction', target: `${siteUrl}/${country}/search?q={search_term_string}`, 'query-input': 'required name=search_term_string' } } }, `<h1>${homeTitle.replace(' | ComPear', '')}</h1><p>${homeDescription}</p><nav><ul>${homeLinks}</ul></nav>`);
  sitemap.push(absoluteRoute(homeRoute), absoluteRoute(`/${country}/how-it-works`));

  const guideTitle = country === 'uk' ? 'Shopping guides' : country === 'de' ? 'Einkaufsratgeber' : 'Boodschappengidsen';
  const guideDescription = country === 'uk' ? 'Practical supermarket comparisons: pack sizes, unit prices and the details to check before choosing.' : country === 'de' ? 'Praktische Supermarktvergleiche: Packungsgrößen, Grundpreise und wichtige Produktunterschiede.' : 'Praktische supermarktvergelijkingen: verpakkingen, eenheidsprijzen en verschillen om op te letten.';
  const guideIndexRoute = `/${country}/guides`;
  writePage(guideIndexRoute, { title: `${guideTitle} | ComPear`, description: guideDescription, url: absoluteRoute(guideIndexRoute), locale, alternates: ['uk', 'nl', 'de'].map(code => ({ lang: code === 'uk' ? 'en-GB' : code === 'nl' ? 'nl-NL' : 'de-DE', href: absoluteRoute(`/${code}/guides`) })) }, `<h1>${escapeHtml(guideTitle)}</h1><p>${escapeHtml(guideDescription)}</p><ul>${guideTopics.map(topic => `<li><a href="/${country}/guides/${topic.slug}/">${escapeHtml(topic.titles[country])}</a></li>`).join('')}</ul>`);
  sitemap.push(absoluteRoute(guideIndexRoute));
  for (const topic of guideTopics) {
    const route = `/${country}/guides/${topic.slug}`;
    const alternates = ['uk', 'nl', 'de'].map(code => ({ lang: code === 'uk' ? 'en-GB' : code === 'nl' ? 'nl-NL' : 'de-DE', href: absoluteRoute(`/${code}/guides/${topic.slug}`) }));
    writePage(route, { title: `${topic.titles[country]} | ${guideTitle} | ComPear`, description: topic.tips[country], url: absoluteRoute(route), locale, alternates, schema: { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'ComPear', item: absoluteRoute(`/${country}`) }, { '@type': 'ListItem', position: 2, name: guideTitle, item: absoluteRoute(guideIndexRoute) }, { '@type': 'ListItem', position: 3, name: topic.titles[country] }] } }, `<h1>${escapeHtml(topic.titles[country])}</h1><p>${escapeHtml(topic.tips[country])}</p><p>${escapeHtml(guideDescription)}</p><a href="/${country}/brief/">${country === 'uk' ? 'Build your shopping brief' : country === 'de' ? 'Einkaufswünsche prüfen' : 'Controleer je boodschappenwensen'}</a>`);
    sitemap.push(absoluteRoute(route));
  }

  const howTitle = country === 'uk' ? 'How ComPear compares prices' : country === 'de' ? 'So vergleicht ComPear Preise' : 'Zo vergelijkt ComPear prijzen';
  const howDescription = country === 'uk' ? 'We compare product identity, variant and package size, show when prices were checked, and link to the retailer source.' : country === 'de' ? 'Wir vergleichen Produktidentität, Variante und Packungsgröße, zeigen den Prüfzeitpunkt und verlinken die Händlerquelle.' : 'We vergelijken productidentiteit, variant en verpakking, tonen wanneer prijzen zijn gecontroleerd en linken naar de winkelbron.';
  writePage(`/${country}/how-it-works`, { title: `${howTitle} | ComPear`, description: howDescription, url: absoluteRoute(`/${country}/how-it-works`), locale, alternates: ['uk', 'nl', 'de'].map(code => ({ lang: code === 'uk' ? 'en-GB' : code === 'nl' ? 'nl-NL' : 'de-DE', href: absoluteRoute(`/${code}/how-it-works`) })) }, `<h1>${howTitle}</h1><p>${howDescription}</p>`);

  // A crawler sees noindex even before JavaScript. No private content is rendered
  // or added to the sitemap, and action tokens remain client-side fragments.
  for (const tail of ['brief', 'alerts', 'alerts/confirm', 'alerts/unsubscribe']) {
    const route = `/${country}/${tail}`;
    const title = tail === 'brief' ? (country === 'uk' ? 'Shopping brief' : country === 'de' ? 'Einkaufswünsche' : 'Boodschappenwensen') : (country === 'uk' ? 'Price watch' : country === 'de' ? 'Preiswache' : 'Prijswacht');
    writePage(route, { title: `${title} | ComPear`, description: title, url: absoluteRoute(route), locale, noIndex: true }, `<h1>${title}</h1>`);
  }

  for (const category of categories.filter((value) => value !== 'Other')) {
    const route = `/${country}/categories/${categorySlug(category)}`;
    const groups = comparable.filter(([, offers]) => offers.some((offer) => offer.category === category)).slice(0, 150);
    const label = categoryLabel(category);
    const description = country === 'uk' ? `Compare current ${label.toLowerCase()} prices across UK supermarkets.` : country === 'de' ? `Aktuelle Preise für ${label} bei deutschen Supermärkten vergleichen.` : `Vergelijk actuele prijzen voor ${label.toLowerCase()} bij Nederlandse supermarkten.`;
    const links = groups.map(([slug, offers]) => `<li><a href="/${country}/products/${slug}">${escapeHtml(offers[0].productName)}</a> — from ${symbol}${Math.min(...offers.map((offer) => offer.effectivePrice)).toFixed(2)}</li>`).join('');
    const comparisonTitle = country === 'uk' ? `${label} price comparison` : country === 'de' ? `${label}: Preisvergleich` : `${label}: prijzen vergelijken`;
    writePage(route, { title: `${comparisonTitle} | ComPear`, description, url: absoluteRoute(route), locale, alternates: ['uk', 'nl', 'de'].map(code => ({ lang: code === 'uk' ? 'en-GB' : code === 'nl' ? 'nl-NL' : 'de-DE', href: absoluteRoute(`/${code}/categories/${categorySlug(category)}`) })), schema: { '@context': 'https://schema.org', '@type': 'ItemList', name: comparisonTitle, numberOfItems: groups.length, itemListElement: groups.map(([slug, offers], index) => ({ '@type': 'ListItem', position: index + 1, name: offers[0].productName, url: absoluteRoute(`/${country}/products/${slug}`) })) } }, `<h1>${escapeHtml(comparisonTitle)}</h1><p>${description}</p><ul>${links}</ul>`);
    sitemap.push(absoluteRoute(route));
  }

  for (const [slug, offers] of comparable) {
    const route = `/${country}/products/${slug}`;
    const sorted = [...offers].sort((a, b) => a.effectivePrice - b.effectivePrice);
    const first = sorted[0];
    const lowPrice = first.effectivePrice;
    const highPrice = sorted[sorted.length - 1].effectivePrice;
    const storeCount = new Set(sorted.map((offer) => offer.store)).size;
    const description = country === 'uk' ? `Compare ${first.productName} across ${storeCount} supermarkets. Prices start at ${symbol}${lowPrice.toFixed(2)}.` : country === 'de' ? `${first.productName}: Preise bei ${storeCount} Supermärkten ab ${symbol}${lowPrice.toFixed(2)} vergleichen.` : `Vergelijk ${first.productName} bij ${storeCount} supermarkten. Prijzen vanaf ${symbol}${lowPrice.toFixed(2)}.`;
    const updated = sorted.map((offer) => offer.scrapedAt).filter(Boolean).sort().pop();
    writePage(route, { title: `${first.productName} prices | ComPear`, description, url: absoluteRoute(route), locale, type: 'product', schema: { '@context': 'https://schema.org', '@type': 'Product', name: first.productName, brand: first.brand ? { '@type': 'Brand', name: first.brand } : undefined, offers: { '@type': 'AggregateOffer', lowPrice, highPrice, offerCount: sorted.length, priceCurrency: currency }, dateModified: updated } }, renderProductBody(first.productName, description, sorted, symbol));
    sitemap.push(absoluteRoute(route));
  }
}

const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${[...new Set(sitemap)].map((url) => `  <url><loc>${escapeHtml(url)}</loc>${lastModified.has(url) ? `<lastmod>${lastModified.get(url)}</lastmod>` : ''}</url>`).join('\n')}\n</urlset>\n`;
fs.writeFileSync(path.join(distDir, 'sitemap.xml'), sitemapXml);
console.log(`Generated ${new Set(sitemap).size} indexable URLs and sitemap.xml`);
