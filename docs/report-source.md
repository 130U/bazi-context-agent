# Quality and Red-Team Audit

Date: 2026-08-26
Scope: public browser experience, local Node API, deterministic scoring boundary, repository release hygiene

## Release conclusion

The current version is a strong personal research project and is suitable for public portfolio use after the repository checks and deployment workflow pass. It is not presented as an industrial or scientifically validated BaZi service: the public forecast uses a disclosed Gregorian-month-to-seasonal-branch approximation, field Core Web Vitals are not yet available, and the static GitHub Pages host cannot set every desired HTTP response header.

## Standards used

- [WCAG 2.2 Reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html): non-exempt content should work at a 320 CSS-pixel viewport without two-dimensional scrolling.
- [WCAG 2.2 Target Size (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html): interactive targets were checked against the 24 CSS-pixel minimum; the design target is 44 pixels.
- [WCAG 2.2 Focus Visible](https://www.w3.org/WAI/WCAG22/Understanding/focus-visible.html): keyboard focus must remain perceivable.
- [OWASP DOM Based XSS](https://owasp.org/www-community/attacks/DOM_Based_XSS): user-controlled values must not enter executable HTML sinks.
- [OWASP REST Security](https://cheatsheetseries.owasp.org/cheatsheets/REST_Security_Cheat_Sheet.html): request methods, content types, input bounds, response types, and errors require explicit handling.
- [MDN CSP `frame-ancestors`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy/frame-ancestors): this directive must be delivered as an HTTP header; a meta CSP cannot enforce it.
- [web.dev Web Vitals](https://web.dev/articles/vitals): field performance claims require real-user evidence; local structural checks are not a substitute.

## Device and interaction matrix

The complete welcome and report states were exercised at these viewport sizes:

| Class | Viewport | Result |
|---|---:|---|
| Small phone | 320 × 568 | PASS: no page-level horizontal scroll, no clipped inspected text, no target below 24 px |
| Phones | 360 × 800, 390 × 844, 412 × 915 | PASS |
| Tablet portrait | 768 × 1024 | PASS |
| Tablet landscape | 1024 × 768 | PASS |
| Laptop and desktop | 1366 × 768, 1440 × 900, 1920 × 1080 | PASS |

The test also covered dynamically generated intake fields, empty-submit error focus, a 17-question provisional path, working-chart lock, ten context questions, empty forecast validation, report generation, the privacy dialog, and focus return after Escape. The 320-pixel check represents the WCAG reflow equivalence for a 1280-pixel viewport at 400% zoom. Reduced-motion, reduced-transparency, contrast, and print fallbacks are present as explicit media queries.

## Findings fixed

### Interface

- Removed page-level horizontal overflow caused by `100vw` sizing inside scrollbar-constrained layouts and fixed-width minimums.
- Replaced hard-coded A1–A6 markup with config-driven form generation; C9 now preserves “best year” versus “worst year” polarity.
- Added deterministic invalid-field focus and `aria-invalid` state for intake, evidence, and forecast forms.
- Added view-heading focus after navigation and explicit Escape/focus-return behavior for the privacy dialog.
- Kept all visible interactive targets above the WCAG minimum and used a 44-pixel design floor.
- Removed mixed-language stage labels, stale visual selectors, and 237 lines of unused CSS while preserving the restrained editorial system.
- Fixed print mode to reveal the actual forecast view rather than a deleted legacy selector.

### Deterministic core

- Consolidated numeric scoring values under `configs/scoring_weights.v1.json` and tightened runtime validation.
- Made uncertainty ranges and boundary flags control candidate expansion instead of being display-only input.
- Removed fictional birth defaults from API execution paths; missing required birth data now fails explicitly.
- Preserved C9 event polarity through form capture and deterministic event scoring.
- Removed the dormant lunar adapter wrapper that advertised an unimplemented integration.
- Kept context facts neutral in rectification and protected the AI boundary with tests.

### Security and server behavior

- Removed the obsolete embedded local UI and its HTML-string rendering path; Pages, preview, and API servers now share one canonical static interface.
- Added safe path resolution, explicit MIME types, `no-store`, `nosniff`, permissions policy, COOP/CORP, and CSP headers to the local server.
- Added same-origin checks, JSON content-type enforcement, a 256 KiB request limit, structured errors, and server timeouts.
- Added provider timeout and response-size limits.
- Centralized redaction patterns for modern OpenAI, GitHub, bearer-token, and environment-variable forms.
- Added strict TypeScript and Node type packages as locked development dependencies; runtime remains third-party-dependency free.

## Repository cleanup

The published repository now retains only current product contracts under `docs/`. Intermediate stage prompts, handoff notes, acceptance checklists, obsolete adapter/config files, and instructions such as “do not commit” were removed. Git history remains the recovery path for that process material.

## Verification gates

The release gate is:

```text
npm run check:type
npm run check:generated
npm run check:site
npm test
```

`check:site` validates the public module graph, blocks inline script/event handlers and unsafe HTML sinks, and verifies the deployable file set. Browser checks are a separate interaction and layout gate.

## Residual risks and honest limits

1. GitHub Pages cannot emit the `frame-ancestors` CSP response header from this repository. The local Node server does. Production clickjacking protection requires an edge/CDN header configuration; the protected personal-site repository was intentionally not changed.
2. No public real-user Core Web Vitals dataset was found or generated. LCP, INP, and CLS must remain “unknown” until field telemetry or an external measurement is intentionally introduced.
3. The static adapter does not derive a complete calendar, luck cycle, annual fortune, or exact solar-term profile. Missing data is surfaced rather than fabricated.
4. Automated checks and viewport metrics reduce risk but do not prove metaphysical validity, universal accessibility, or future browser compatibility.
