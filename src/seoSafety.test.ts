import { describe, expect, it } from 'vitest';
import { escapeHtml, isSafeProductSlug, renderProductBody } from '../scripts/seo-safety.mjs';

describe('SEO output treats catalog data as untrusted text', () => {
  it('escapes product descriptions as well as names, store names and sizes', () => {
    const attack = '<img src=x onerror="alert(1)"><script>alert(1)</script>';
    const rendered = renderProductBody(attack, `Compare ${attack} at two shops`, [{
      store: attack, effectivePrice: 1.25, packageSize: attack,
    }], '£');
    const template = document.createElement('template');
    template.innerHTML = rendered;
    expect(template.content.querySelector('img,script')).toBeNull();
    expect(template.content.querySelector('p')?.textContent).toBe(`Compare ${attack} at two shops`);
    expect(template.content.querySelector('li')?.textContent).toContain('£1.25');
    expect(escapeHtml('"<&')).toBe('&quot;&lt;&amp;');
  });

  it('rejects path traversal, HTML injection and overlong API slugs', () => {
    expect(isSafeProductSlug('skimmed-milk-uht-1-l')).toBe(true);
    for (const slug of ['', '../outside', '../../index', '/absolute', 'a/b',
      'a\\b', 'a%2fb', 'milk\n', 'milk\r', 'milk\u2028', 'a" onmouseover="x', '<img>', 'a'.repeat(121), null]) {
      expect(isSafeProductSlug(slug)).toBe(false);
    }
  });
});
