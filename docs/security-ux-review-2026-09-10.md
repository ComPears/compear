# ComPears security and UX review — 10 September 2026

## Scope

This review covered the production UK experience on desktop and a 390 × 844 mobile viewport, plus the `compear`, `compear-backend`, and `compears-data-wrangling` repositories. It included registry vulnerability audits, GitHub security settings, workflow supply-chain controls, authentication boundaries, shared-list editing, and responsive interaction checks.

## UX conclusion

The visual foundation is sound: the layout is responsive, the primary search action is clear, keyboard-accessible names are present, and the tested mobile page has no horizontal overflow. It was not fully trustworthy, however, because a one-store result was labelled “Cheapest” and headed “Compare supermarket prices.” The footer and target-price controls also had mobile targets below the recommended 44-pixel size, and failed retailer favicons produced very low-contrast initials.

The frontend fix:

- reserves “Cheapest” and comparison language for products with at least two matched stores;
- explains when only one store is available and uses neutral add/current-price language;
- increases mobile target sizes in the footer, breadcrumbs, and target-price input;
- gives failed retailer-logo fallbacks readable contrast;
- adds HSTS, cross-origin opener isolation, and a restrictive cross-domain policy.

One product-data concern remains operational rather than presentational: the live UK search sampled during this review contained implausible Morrisons milk prices and most returned groups had only one store. Those records should be corrected by the data-quality pipeline; the UI now avoids presenting a single observation as a comparison.

## Security findings and remediation

| Finding | Initial state | Remediation |
| --- | --- | --- |
| Vulnerable JavaScript dependency chains | Frontend: 8 advisories, including 3 high. Backend: 7 advisories, including 5 high. | Upgraded React Router, Vitest, Express, rate limiting, Helmet, Playwright, and patched transitive packages. Both `npm audit` runs now report zero vulnerabilities. |
| Vulnerable Python HTTP client | `urllib3==1.26.20` had known redirect, header-forwarding, and decompression denial-of-service advisories. | Upgraded to `urllib3==2.7.0`, removed the obsolete duplicate Albert Heijn dependency list, and verified `pip-audit` reports zero vulnerabilities. |
| Legacy shared-list takeover | A list created before edit tokens could be claimed and modified by any reader. | Legacy lists remain readable but are now permanently read-only; all modifications require the original edit token. |
| Mutable GitHub Action tags | Workflows trusted moving major-version tags. | Every third-party action is pinned to an immutable release commit; Dependabot monitors GitHub Actions updates. |
| Missing automated analysis | Code scanning had never run; backend and data-wrangling had no Dependabot configuration. | Added weekly and pull-request CodeQL analysis plus npm, pip, and GitHub Actions Dependabot coverage. |
| Secret scanning disabled | All three public repositories had secret scanning disabled. | Enabled secret scanning, push protection, automated security updates, and private vulnerability reporting in repository settings. |
| No coordinated disclosure policy | None of the repositories exposed a `SECURITY.md`. | Added a private-reporting policy to all three repositories. |
| Express 5 request parameter shape | The secure Express upgrade allows an array-shaped parameter type that older controller assumptions did not handle. | Added a shared strict path-parameter parser and tests; ambiguous parameters are rejected. |

## Repository controls requiring a separate migration

The frontend protects `main` with pull-request review and conversation resolution. Backend and data-wrangling currently publish generated data by pushing directly to `main`, so enabling a blanket “pull requests only” rule would stop production catalog refreshes. The safer follow-up is to move generated catalogs to a bot-owned data branch or configure a repository ruleset that grants a narrowly scoped GitHub Actions bypass, then require reviewed pull requests for human changes.

Secret validity checks and non-provider pattern scanning remain unavailable under the current GitHub organization feature set; provider-pattern secret scanning and push protection are enabled.

## Verification performed

- Production desktop and mobile flows: home → search → product detail.
- Mobile viewport: 390 × 844, no horizontal overflow.
- Frontend: unit/accessibility tests, TypeScript compilation, production build, and `npm audit`.
- Backend: unit/security tests, TypeScript compilation, production build, and `npm audit`.
- Data wrangling: full unit suite, requirements installation resolution, and `pip-audit` for both requirements entry points.
- Workflow YAML parsing and immutable-action reference checks in all repositories.
