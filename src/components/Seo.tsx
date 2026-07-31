import { useEffect } from 'react';

interface SeoProps {
  title: string;
  description: string;
  path: string;
  country: 'nl' | 'uk' | 'de';
  noIndex?: boolean;
  image?: string;
  structuredData?: Record<string, unknown> | Array<Record<string, unknown>>;
}

export const SITE_URL = (import.meta.env.VITE_SITE_URL || 'https://www.compears.shop').replace(/\/$/, '');

export function sitePath(path: string): string {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${SITE_URL}${normalized.endsWith('/') ? normalized : `${normalized}/`}`;
}

function setMeta(name: string, content: string, attribute: 'name' | 'property' = 'name'): void {
  let element = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${name}"]`);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, name);
    document.head.appendChild(element);
  }
  element.content = content;
}

function setLink(rel: string, href: string, hreflang?: string): void {
  const selector = hreflang
    ? `link[rel="${rel}"][hreflang="${hreflang}"]`
    : `link[rel="${rel}"]:not([hreflang])`;
  let element = document.head.querySelector<HTMLLinkElement>(selector);
  if (!element) {
    element = document.createElement('link');
    element.rel = rel;
    if (hreflang) element.hreflang = hreflang;
    document.head.appendChild(element);
  }
  element.href = href;
}

export function Seo({
  title,
  description,
  path,
  country,
  noIndex = false,
  image = '/logo512.png',
  structuredData,
}: SeoProps): null {
  useEffect(() => {
    const canonicalPath = path.startsWith('/') ? path : `/${path}`;
    const canonical = sitePath(canonicalPath);
    const locale = country === 'uk' ? 'en_GB' : country === 'nl' ? 'nl_NL' : 'de_DE';
    const alternatePath = canonicalPath.replace(/^\/(uk|nl|de)(?=\/|$)/, '');

    document.title = title;
    document.documentElement.lang = country === 'uk' ? 'en-GB' : country === 'nl' ? 'nl-NL' : 'de-DE';
    setMeta('description', description);
    setMeta('robots', noIndex ? 'noindex,follow' : 'index,follow,max-image-preview:large');
    setMeta('og:title', title, 'property');
    setMeta('og:description', description, 'property');
    setMeta('og:type', canonicalPath.includes('/products/') ? 'product' : 'website', 'property');
    setMeta('og:url', canonical, 'property');
    setMeta('og:image', image.startsWith('http') ? image : `${SITE_URL}${image}`, 'property');
    setMeta('og:locale', locale, 'property');
    setMeta('twitter:card', 'summary_large_image');
    setMeta('twitter:title', title);
    setMeta('twitter:description', description);
    setLink('canonical', canonical);

    document.head.querySelectorAll('link[rel="alternate"][hreflang]').forEach((element) => element.remove());
    const hasEquivalentCountryPage = /^\/(uk|nl|de)(?:\/(?:categories|how-it-works)(?:\/|$)|\/?$)/.test(canonicalPath);
    if (hasEquivalentCountryPage) {
      setLink('alternate', sitePath(`/uk${alternatePath}`), 'en-GB');
      setLink('alternate', sitePath(`/nl${alternatePath}`), 'nl-NL');
      setLink('alternate', sitePath(`/uk${alternatePath}`), 'x-default');
    } else {
      setLink('alternate', canonical, country === 'uk' ? 'en-GB' : country === 'nl' ? 'nl-NL' : 'de-DE');
    }

    document.head.querySelectorAll('script[data-compear-seo]').forEach((element) => element.remove());
    if (structuredData) {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.dataset.compearSeo = 'true';
      script.textContent = JSON.stringify(structuredData);
      document.head.appendChild(script);
    }
  }, [country, description, image, noIndex, path, structuredData, title]);

  return null;
}
