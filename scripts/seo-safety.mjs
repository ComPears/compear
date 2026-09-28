export const escapeHtml = (value = '') => String(value).replace(/[&<>"']/g, (character) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
})[character]);

// API-provided slugs become both paths and HTML attributes. Accept only the
// same bounded, ASCII slug alphabet generated from local catalog names.
export const isSafeProductSlug = (value) =>
  typeof value === 'string' && value.length > 0 && value.length <= 120
  && /^[a-z0-9]/.test(value) && !/[^a-z0-9-]/.test(value);

export function renderProductBody(name, description, offers, symbol) {
  const offerRows = offers.map((offer) => `<li>${escapeHtml(offer.store)}: ${escapeHtml(symbol)}${offer.effectivePrice.toFixed(2)} (${escapeHtml(offer.packageSize)})</li>`).join('');
  return `<h1>${escapeHtml(name)}</h1><p>${escapeHtml(description)}</p><h2>Supermarket prices</h2><ul>${offerRows}</ul>`;
}
