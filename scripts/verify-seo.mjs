import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sitemap = fs.readFileSync(path.join(root, 'dist/sitemap.xml'), 'utf8');
const topics = JSON.parse(fs.readFileSync(path.join(root, 'src/config/shopping-guides.json'), 'utf8'));
const articles = JSON.parse(fs.readFileSync(path.join(root, 'src/config/journal.json'), 'utf8'));
const html = route => fs.readFileSync(path.join(root, 'dist', route, 'index.html'), 'utf8');
assert.doesNotMatch(sitemap, /\/(?:brief|alerts|space)(?:\/|<)/, 'Private routes must not be in the sitemap');
assert.doesNotMatch(sitemap, /\/departments\/electronics\//, 'Do not index an unconnected price department');
for (const country of ['uk', 'nl', 'de']) {
  for (const route of ['brief', 'alerts', 'alerts/confirm', 'alerts/unsubscribe', 'space', 'departments/electronics']) {
    assert.match(html(`${country}/${route}`), /name="robots" content="noindex,follow"/, 'Private routes must be noindex without JavaScript');
  }
  for (const article of articles) {
    const page = html(`${country}/journal/${article.slug}`);
    assert.ok(page.includes(article[country === 'uk' ? 'en' : country].title));
    assert.ok(page.includes('"@type":"Article"'));
    assert.ok(sitemap.includes(`/${country}/journal/${article.slug}/</loc>`));
  }
  for (const topic of topics) {
    const page = html(`${country}/guides/${topic.slug}`);
    assert.ok(page.includes(topic.titles[country]));
    for (const language of ['en-GB', 'nl-NL', 'de-DE']) assert.ok(page.includes(`hreflang="${language}"`));
    assert.ok(sitemap.includes(`/${country}/guides/${topic.slug}/</loc>`));
  }
  const homeEntry = sitemap.match(new RegExp(`<url><loc>[^<]+/${country}/</loc>(.*?)</url>`));
  assert.ok(homeEntry);
  assert.doesNotMatch(homeEntry[1], /lastmod/, 'Do not invent a new modification date on every build');
}
console.log(`SEO verified: ${topics.length * 3} localized guides, ${articles.length * 3} journal articles, reciprocal alternates and private/disconnected noindex pages`);
