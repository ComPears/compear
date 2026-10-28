# Dependency review: 28 October 2026

## Changes

- Incorporates Dependabot #81 (Zustand 5.0.16), #82 (EmailJS browser 5.0.3),
  #83 (jsdom 30.1.3), and #77 (GitHub Actions updates).
- EmailJS 5 changes the package/build format without intentional public API
  changes. Five new regression tests exercise the actual SDK with a stubbed
  HTTP boundary: normalized payloads, public-key arguments, throttling, input
  limits, waitlist mapping and HTTP failures. They never send real email.
- jsdom 30.1.3 includes upstream cross-origin XMLHttpRequest credential fixes.
  Existing search, comparison and basket integration tests pass after the major
  jsdom upgrade and Zustand patch update.
- Update SHA-pinned setup-node, upload/download-artifact and CodeQL actions.
  Keep patched Node 24.22.1 and the existing deployment approval boundary.
- GitHub returned no open Dependabot vulnerability or CodeQL alerts at review
  time. Open version-update PRs are distinct from vulnerability alerts.

## Local verification

- Clean `npm ci` and all 40 tests pass on Node 24.22.1.
- TypeScript checking and production build pass; SEO prerender produces
  2,181 indexable URLs with the currently available catalog.
- `npm audit`: zero known vulnerabilities.
- All workflows pass actionlint; `git diff --check` passes.
- Existing non-blocking Vite warning remains: NotFoundPage is imported both
  statically and dynamically, so it cannot be isolated into a lazy chunk.

## Rollout and limits

Review CI/CodeQL, merge and deploy through the normal workflow. Nothing has been
merged or deployed by this review. No live email delivery was tested and audit
results do not establish the absence of all vulnerabilities or malware.

Upstream notes: [EmailJS 5.0.3](https://github.com/emailjs-com/emailjs-sdk/releases/tag/v5.0.3),
[jsdom 30.1.3](https://github.com/jsdom/jsdom/releases/tag/v30.1.3).
