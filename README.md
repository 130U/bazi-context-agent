# BaZi Context Agent / 八字上下文研究原型

**Compare uncertain birth-hour candidates and explore contextual reports through explicit, deterministic rules.**

一个将出生时间不确定性、传统八字规则、人生事件和用户上下文分层处理的研究原型。

[Public experience](https://www.theodoreoy.com/bazi-context-agent/) · [Architecture](docs/ARCHITECTURE.md) · [Evaluation](docs/EVALUATION.md) · [AI boundary](docs/AI_BOUNDARY.md)

## Try the public experience

The browser guides you through a configured 15–17 question birth-hour comparison, ranks candidate structures using dated life events, and lets you lock a working candidate before adding personal context. It then produces month-by-month branch-cycle interpretations with dated support and transition windows, alternative-candidate sensitivity, and a downloadable report.

The public experience requires no login or API key and makes no model call. Both ranking and reporting are deterministic. Its monthly interpretation relates the selected hour branch to an approximate seasonal branch for each Gregorian month; it does not compute a complete four-pillar chart, luck cycle, or exact solar-term calendar.

A working candidate is a result of the configured rules, not an established true birth time. Deterministic output makes the software inspectable and repeatable; it does not validate BaZi prediction.

## Quick start

Requires **Node.js 24+**. Runtime code has no third-party package dependency; development dependencies are locked for type checking.

```bash
git clone https://github.com/130U/bazi-context-agent.git
cd bazi-context-agent
npm ci --ignore-scripts
npm run check
npm run preview
```

Open [http://127.0.0.1:4173](http://127.0.0.1:4173) for the public browser interface.

For the same interface with local research APIs, stop the preview server and run `npm run ui`, then open [http://127.0.0.1:3000](http://127.0.0.1:3000). In Windows PowerShell, use `npm.cmd` if execution policy blocks `npm`.

## Design boundaries

| Layer | Implemented behavior |
|---|---|
| Candidate comparison | Deterministic generation, configured scoring, dated-event comparison, and protection of the recorded-time default |
| Context intake | User-provided facts enter downstream forecast input after the working chart is fixed; they do not change ranking |
| Public reports | Browser rules generate branch-cycle windows and expose calendar approximations and candidate uncertainty |
| Optional model integration | The local server has a mock-by-default prediction provider and an opt-in OpenAI adapter; neither can change upstream ranking or the selected chart |

The TypeScript research pipeline represents chart structure as a `BaziDerivedProfile` and combines it with user-controlled context in `ForecastInput`, keeping deterministic chart calculations separate from supplied personal facts.

See [`src/forecastInputBuilder.ts`](src/forecastInputBuilder.ts) for context isolation, [`site/core/forecast.js`](site/core/forecast.js) for the public interpretation, and [`tests/noAiBoundary.test.ts`](tests/noAiBoundary.test.ts) for the upstream AI boundary. Optional provider configuration is documented in [the example environment file](examples/stage4b.env.example).

## Evaluation scope

The offline harness compares four input modes:

| Mode | Inputs |
|---|---|
| A | Derived chart structure |
| B | User context |
| C | Recorded-time default chart + context |
| D | Selected chart + context |

Holdout construction and leakage checks keep hidden target answers out of the inputs under evaluation. Tests exercise the mode boundaries, scoring, and benchmark API.

The published [benchmark result fixture](fixtures/stage7_benchmark_result.mock.json) contains **two mock cases** and explicitly concludes `insufficient_data`. It demonstrates the reporting format, not measured predictive accuracy or an advantage for the full system. See [evaluation policy](docs/EVALUATION.md) and [evaluation tests](tests/stage7Evaluation.test.ts).

## Privacy and status

Public-session answers and reports remain in the current tab's memory. The interface does not save or resume them through browser storage, and it clears only this application's known legacy storage keys. Export is explicit and may contain personal information.

The local research layer separately supports session storage, redaction, import/export, and user controls. If an optional model provider is enabled, its requests follow that provider's data flow; the public browser experience does not use that integration. See [privacy policy](docs/PRIVACY.md) and [session tests](tests/stage8Session.test.ts).

This is a research prototype for structured traditional interpretation. Its engineering tests cover software behavior, input boundaries, and privacy controls; they do not establish the validity of BaZi or future-event predictions. Reports should not guide medical, legal, financial, or safety-critical decisions.

## Further reading

- [Architecture](docs/ARCHITECTURE.md): browser modules, local APIs, and extension points.
- [AI boundary](docs/AI_BOUNDARY.md): permitted downstream use and protected upstream inputs.
- [Quality audit](docs/report-source.md): recorded interface and security checks, with residual limitations.
- [Research examples](examples/stage7_usage.md): offline evaluation usage.
