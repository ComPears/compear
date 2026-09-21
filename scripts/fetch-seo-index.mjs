// Sequential pages bound the work requested from the small production API.
// An older API returns a full array without pagination headers; accept it once.
export async function fetchSeoIndex(apiUrl, country, fetchImpl = fetch) {
  const groups = [];
  const limit = 250;
  let offset = 0;
  while (true) {
    const url = new URL(`${apiUrl.replace(/\/$/, '')}/products/seo-index`);
    url.search = new URLSearchParams({ country, limit: String(limit), offset: String(offset) }).toString();
    const response = await fetchImpl(url, { signal: AbortSignal.timeout(30_000) });
    if (!response.ok) throw new Error(`SEO index returned ${response.status}`);
    const page = await response.json();
    if (!Array.isArray(page)) throw new Error('SEO index must return an array');
    const pageOffset = response.headers.get('X-Result-Offset');
    if (pageOffset === null) return page; // backend not yet upgraded
    const totalHeader = response.headers.get('X-Total-Count');
    const total = Number(totalHeader);
    if (totalHeader === null || Number(pageOffset) !== offset || !Number.isSafeInteger(total) || total < 0 || total > 1_000_000) {
      throw new Error('Invalid SEO pagination metadata');
    }
    groups.push(...page);
    offset += page.length;
    if (offset >= total) return groups;
    if (page.length === 0) throw new Error('SEO index pagination made no progress');
  }
}
