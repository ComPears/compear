# Bounded SEO requests and Dependabot updates

The frontend build used one unbounded SEO-index request per country. It now requests sequential pages of 250 groups with a 30-second timeout, validates pagination metadata, and detects stalled pagination. This works with the backend memory fix while preserving compatibility with older backends that return the complete array without pagination headers. No product pages are intentionally dropped.

Includes Dependabot changes from #60 (production dependencies), #61 (development dependencies), #62 (React Vite plugin), and #63 (pinned CodeQL actions). Vite 8 was already on main. The new barcode library requires Node >=24, so `.nvmrc`, the package engine, GitHub build job and Netlify build configuration now agree on Node 24; do not run this updated build on Node 22.

Verification: 25 tests passed on Node 24.21.0, including pagination, legacy-backend compatibility, failed requests and invalid metadata. TypeScript and the Vite 8 production build passed; local SEO generation produced 4,178 indexable URLs from the current catalogs. `npm audit` reported zero known vulnerabilities.

Existing Dependabot PRs are incorporated into this fix branch, not merged to main. Deploy the backend fix first where practical; either ordering remains API-compatible. No production deployment was requested or performed during this task.
