# Security maintenance: 23 October 2026

## Findings and fixes

- Pin build, prerender and deployment to Node 24.22.1 for CVE-2026-111497 and
  the associated TLS/CA fixes. The separate deployment job now sets up Node too.
  Netlify and `.nvmrc` agree; engine-strict prevents older installs.
- Apply Dependabot #76 and #78 plus the compatible updates from #79.
  Vitest 4.1.12 fixes mock-registration code injection; follow-redirects 1.16.1
  fixes cross-origin credential exposure. npm audit reports zero findings.
- MUI icons had been upgraded to v9 while components remained v7. Testing v9
  components broke TypeScript and search rendering because APIs were removed.
  Align both on 7.3.11, remove legacy-peer-deps, and defer paired major migration.
  Dependabot still proposes v7 minor/patch updates; major MUI updates require a
  coordinated UI migration. Do not merge the icons-v9 part of #79 over this fix.
- The action updates proposed by #77 are already present on main.
- GitHub reported no open Dependabot or CodeQL alerts at review time. Audits are
  known-vulnerability checks, not a guarantee against malicious packages.

## Verification and rollout

Clean npm ci, all 35 tests, TypeScript/Vite production build and SEO prerender
(4,099 URLs) pass. npm audit is now a CI gate. Runtime regression tests cover
both workflow jobs and Netlify configuration.

After merge, rebuild/deploy with Node 24.22.1 and clear any stale Netlify build
cache. Check dashboard NODE_VERSION overrides and actual build logs. Production
has not been deployed as part of this review. The delivered site is static;
the Node vulnerability concerns its build/deploy/prerender tooling, not browser JS.
GitHub action-internal Node is runner-managed and separate from setup-node.

Source: [Node October security release](https://nodejs.org/en/blog/vulnerability/october-2026-security-releases).
