# Dependency and security review — 2026-09-28

## Open PRs covered

This consolidation includes the complete requested updates from #65 (Vite
8.3.1), #66 (i18next 26.4.2), #67 (TypeScript 7.0.2), and #68 (CodeQL's pinned
action revision). Existing bot PRs should only be closed after this replacement
is merged. No production deployment was manually triggered during the review.

## Findings and fixes

- **Catalog text could become HTML in generated product descriptions.** The
  product title was escaped, but its interpolated description paragraph was not.
  A malicious catalog name could inject markup into static SEO output. The
  shared renderer now escapes names, descriptions, stores and package sizes.
  Metadata attributes and sitemap URLs are escaped too.
- **API product slugs were trusted as filesystem paths and link fragments.**
  Only bounded ASCII product slugs are accepted before writing pages. Path
  traversal, separators, encoded separators and HTML-shaped slugs are rejected.
- **CSP allowed arbitrary inline scripts.** Production bundles use external
  scripts; only MUI's inline styles need an exception. Inline scripts, inline
  handlers and embedded plugins are now blocked. Unneeded wildcard Netlify
  connections and localhost access were removed from the production policy.
- **Retailer links accepted embedded credentials and nonstandard ports.** The
  existing HTTPS/hostname allowlist now rejects both as defense in depth.

No evidence of an exploited production issue was established. These are source
findings and regression-tested boundary fixes, not a forensic incident report.

## Verification

- GitHub: zero open Dependabot, CodeQL and secret-scanning alerts at review time.
- Node 24: all 30 Vitest tests pass; TypeScript and production build pass.
  SEO generation produced 4,178 indexable URLs from local catalogs.
- Local Chromium test with the production CSP: React mounted without page
  errors; injected inline scripts and event handlers did not execute. External
  requests were stubbed; this did not exercise production APIs or paid services.
- `npm audit`: zero known vulnerabilities, including development dependencies.
- `npm audit signatures`: 230 installed packages had verified registry
  signatures; 59 had verified attestations.
- Lockfile sources remain on registry.npmjs.org; new platform-specific
  TypeScript/Rolldown packages belong to the requested compiler/bundler upgrades.
  Dependencies were installed with lifecycle scripts disabled for local review.

Signatures establish package provenance, not absence of malicious behavior.
This review is not an exhaustive malware audit or penetration test. Netlify
headers must be deployed before the CSP hardening reaches existing users.

Reference: [MDN script-src](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy/script-src).
