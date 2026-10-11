# BaZi Context Agent

**A deterministic decision engine that turns uncertain birth times, dated life events, and personal context into an inspectable traditional BaZi interpretation.**

I designed the system around a concrete architectural problem: compare candidate birth hours reproducibly, then introduce personal context without letting it rewrite the selection. The result combines a configurable scoring engine, an immutable working-chart lock, a browser reporting experience, and a TypeScript research pipeline.

[Try the experience](https://www.theodoreoy.com/bazi-context-agent/) · [Architecture](docs/ARCHITECTURE.md) · [Evaluation design](docs/EVALUATION.md) · [Source and quality audit](docs/report-source.md)

## What I built

**A staged reasoning workflow.** Unknown birth times begin with **12 symmetric hour-branch candidates**. An adaptive **15–17 question** comparison combines configured symbolic priors and dated-event scoring, surfaces candidate evidence, and locks a working selection. Context questions then shape the report through a separate input layer.

**An explicit contract between rules and context.** Questions and scoring weights come from two authoritative JSON configurations. Pure core modules handle candidates, branch relations, scoring, and interpretation; UI modules render their structured outputs. In the research APIs, `BaziDerivedProfile` represents derived structure and `ForecastInput` adds user-supplied facts with provenance. Tests verify that downstream context and optional model providers preserve the upstream ranking.

**A complete public reporting experience.** The browser generates month-by-month support and transition windows, compares alternative-candidate sensitivity, and exports a readable report. Its interpretation uses deterministic seasonal branch rules mapped to Gregorian months. Public ranking and reporting run locally, with **no login, API key, or model call**; active answers remain in the tab's memory.

**An evaluation framework with four controlled input modes.** The offline harness separates chart-only, context-only, recorded-time chart plus context, and selected chart plus context. Holdout construction, temporal filtering, and leakage checks make each comparison inspectable. The [mode configuration](configs/evaluation_modes.stage7.json) and [evaluation tests](tests/stage7Evaluation.test.ts) expose the experiment design directly.

## Engineering evidence

- **146 automated tests passed** in the Node.js 24 test run on October 11, 2026, covering deterministic scoring, context isolation, API contracts, report generation, session controls, and provider boundaries. Run `npm test` to reproduce the software checks.
- The [recorded interface audit](docs/report-source.md) covers **9 viewport configurations, from 320 to 1920 pixels wide**, including navigation, validation focus, report generation, privacy-dialog behavior, and print fallbacks.
- One canonical `site/` interface serves GitHub Pages, the local preview, and the API server. The release gate checks strict types, generated-config parity, the public module graph, unsafe rendering patterns, and the test suite.

Inspect the [deterministic browser engine](site/core/rectification.js), [context input builder](src/forecastInputBuilder.ts), and [ranking invariant tests](tests/noAiBoundary.test.ts) to follow the implementation.

## Run locally

Requires **Node.js 24+**. Runtime code has no third-party package dependency.

```bash
git clone https://github.com/130U/bazi-context-agent.git
cd bazi-context-agent
npm ci --ignore-scripts
npm run check
npm run preview
```

Open [localhost:4173](http://127.0.0.1:4173). For the same interface with local research APIs, stop the preview and run `npm run ui`, then open [localhost:3000](http://127.0.0.1:3000). Windows PowerShell users can invoke `npm.cmd`.

Optional downstream provider configuration is in [the environment example](examples/stage4b.env.example); [privacy controls](docs/PRIVACY.md) and [research examples](examples/stage7_usage.md) document the corresponding workflows.
