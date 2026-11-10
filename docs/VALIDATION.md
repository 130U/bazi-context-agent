# Validation

## Release gate

```sh
npm ci --ignore-scripts
npm run check
```

The gate checks strict types, generated browser configuration, the public module graph, static security constraints, and deterministic tests. It rejects inline script handlers and unsafe HTML sinks and verifies the deployable file set. Scoring and candidate generation remain deterministic; context and model providers cannot change a locked ranking.

## Browser evidence

The 2026-08-26 browser check exercised welcome and report states at 320, 360, 390, 412, 768, 1024, 1366, 1440 and 1920 CSS pixels. The inspected states had no page-level horizontal overflow, clipped inspected text, or targets below 24 pixels.

The interaction sequence covered generated intake fields, invalid-field focus, a 17-question provisional path, working-chart lock, ten context questions, forecast validation, report generation, and privacy-dialog Escape/focus return. Reduced-motion, reduced-transparency, contrast and print fallbacks are explicit media queries. This dated browser evidence is separate from the automated checks run for each commit.

## Runtime boundaries

- The static GitHub Pages host cannot set the `frame-ancestors` response header; the local Node server supplies it. Edge-level protection requires host configuration.
- Field Core Web Vitals remain unmeasured.
- The static adapter requires supplied pillar data. It does not derive a complete calendar, luck cycle, annual fortune or exact solar-term profile; missing inputs remain explicit.
- Public monthly forecast windows use a disclosed Gregorian-month-to-seasonal-branch approximation.
- Engineering checks do not establish birth-time identification accuracy or future-prediction validity.

## Deployment

The `Deploy GitHub Pages demo` workflow publishes `site/` from `master`. It can also be dispatched manually after documentation-only changes. The public entry is [BaZi Context Agent](https://www.theodoreoy.com/bazi-context-agent/).
