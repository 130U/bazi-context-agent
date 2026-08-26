# Architecture / 架构

The repository has one canonical interface under `site/`. GitHub Pages deploys it directly, the local preview server serves it unchanged, and the Node/TypeScript API server serves the same files alongside research endpoints. The `src/` APIs are not uploaded by the Pages workflow.

本仓库只维护 `site/` 中的一套正式界面：GitHub Pages 直接部署，本地预览服务原样提供，Node/TypeScript API 服务也复用同一组文件并附加研究接口。`src/` 下的 API 不会被 Pages 工作流上传。

## Public dependency direction / 公开版依赖方向

```text
configs/question_bank.v1.json ─┐
configs/scoring_weights.v1.json ├─> scripts/buildPublicConfig.ts
                               └─> site/data/runtime-config.json

site/core/shared.js
  ├─> site/core/branches.js
  ├─> site/core/rectification.js
  └─> site/core/forecast.js
             │
             v
       site/engine.js      stable public facade
             │
             v
         site/app.js       state and interaction controller
          ├─> site/ui/dom.js
          ├─> site/ui/forms.js
          ├─> site/ui/labels.js
          ├─> site/ui/privacy.js
          └─> site/ui/forecast-view.js
```

Dependencies point down this list. `site/core/` cannot import DOM, storage, network, or provider code. UI modules can consume core outputs but cannot implement scoring rules. `site/engine.js` preserves the import contract used by tests and the application, so internal modules can evolve without forcing callers to change.

依赖只能沿上图向下：`site/core/` 不得访问 DOM、存储、网络或模型 provider；UI 只能消费核心输出，不能另写评分规则。`site/engine.js` 保留稳定导入契约，使内部模块可独立演进。

## Deterministic flow / 确定性流程

```text
Birth intake
  -> candidate universe
  -> configured B/C questions
  -> deterministic scoring and evidence
  -> stable or provisional working-chart lock
  -> configured D context questions
  -> local dated branch-cycle forecast
  -> report and explicit export
```

Hard invariants:

- Every question originates in `configs/question_bank.v1.json`.
- Every scoring weight originates in `configs/scoring_weights.v1.json`.
- Context answers cannot change candidates, scores, or the selected chart.
- The public ranking and forecast paths do not call an AI provider or remote API.
- An unknown birth time produces a symmetric twelve-branch candidate set; it does not create an arbitrary default Zi hour.
- A provisional lock remains visibly provisional.

## Module responsibilities / 模块职责

| Module | Owns | Must not own |
|---|---|---|
| `site/core/shared.js` | Runtime config validation, config lookup, cloning and numeric helpers | Domain scoring, DOM, network |
| `site/core/branches.js` | Branch labels, time mapping and deterministic branch relations | Questions, context, UI |
| `site/core/rectification.js` | Intake normalization, candidates, B/C validation, scoring and chart lock | Forecast rendering, storage, AI |
| `site/core/forecast.js` | Dated local forecast from an immutable lock and context | Candidate mutation, DOM, network |
| `site/engine.js` | Stable exports and compatibility aliases | Product logic |
| `site/app.js` | In-memory session state, navigation and event coordination | Scoring rules |
| `site/ui/*` | Config-driven forms, safe DOM construction, labels, legacy-key removal and forecast presentation | Core state mutation |

## Runtime safety and privacy / 运行安全与隐私

- The public app keeps the active session in JavaScript memory. It does not write answers to `localStorage`, `sessionStorage`, cookies, or a backend.
- Entry, exit and page-hide lifecycle hooks remove only the project's known legacy storage keys; they never call broad storage `clear()` methods.
- User values are rendered with `textContent` and element construction. HTML injection sinks and inline scripts/events are rejected by `scripts/validatePublicSite.ts`.
- `index.html` sets a restrictive document-level Content Security Policy and referrer policy. Because the site is static, the validator treats this as one defense layer rather than a substitute for safe DOM code.
- Runtime config is same-origin, size-limited, JSON-parsed and schema-checked before the UI is enabled.
- GitHub Actions use least-privilege job permissions, timeouts and full immutable commit SHAs. Dependabot monitors Action updates.

## Repository checks / 仓库门禁

```bash
npm run build:site      # regenerate the committed public config after authority config edits
npm run check           # strict types + generated parity + static security checks + complete test suite
```

`npm run check` is the required pull-request gate. Deployment rebuilds the runtime config, repeats the same checks, and uploads only `site/`.

## Extension points / 扩展点

- Replace or enrich branch/calendar derivation behind `site/core/branches.js` without changing UI imports.
- Add a new deterministic rectification component in `site/core/rectification.js`, with every numeric weight first added to the authority scoring config.
- Add a forecast provider only after the working-chart lock. Any networked or AI provider belongs behind a server-side boundary, never in the public browser bundle with a secret.
- Add UI views under `site/ui/`; pass structured data into renderers and keep scoring in core modules.
- Keep the `site/engine.js` facade backward compatible or version it explicitly before removing an export.

The current public forecast remains a Gregorian-month-to-seasonal-branch approximation. It is not a full four-pillars, luck-cycle, or solar-term calendar engine.

当前公开预测仍是“公历月份到季节支”的近似，不是完整四柱、大运或精确节气历法引擎。
