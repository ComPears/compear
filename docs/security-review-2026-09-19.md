# Security review — 19 September 2026

## Findings and changes

GitHub reported two open high-severity `js/insecure-randomness` findings (#1 and #2). Both receipt flows use the shared user-ID helper, whose fallback used `Math.random`. The helper now uses `crypto.randomUUID`, or 16 bytes from `crypto.getRandomValues` when UUID generation is unavailable. It fails closed if neither secure API exists. Existing valid IDs remain unchanged. These IDs do not replace the backend-issued receipt authentication token.

Four regression tests cover both secure generation paths, unavailable crypto, and existing IDs. The frontend suite passed 21 tests and the TypeScript/Vite/SEO production build passed.

## Dependency and source review

- GitHub: no open Dependabot vulnerability alerts or secret-scanning alerts at review time.
- `npm audit --json --ignore-scripts`: zero known vulnerabilities, including development dependencies.
- Open Dependabot PRs #56 (production group), #57 (development group), and #58 (Vite 8) are version updates, not currently associated with open vulnerability alerts. They remain separate; this patch does not introduce an unrelated major bundler upgrade.
- Lockfile package downloads use `registry.npmjs.org` and have integrity hashes. Only esbuild and optional fsevents declare install hooks.
- Reviewed source/workflows for dynamic code execution, suspicious shell download/execute patterns, and common committed private-key/token patterns. No suspicious indicators were found in these checks.

This is a point-in-time source/dependency review, not an antivirus scan or proof that every transitive package or production host is malware-free. Historical git objects, deployed infrastructure, browser binaries, and private runtime secrets were not exhaustively inspected. CodeQL on the PR must verify the changed source; default-branch alerts can remain open until merge and rescan. No production deployment or merge was performed as part of the review.
