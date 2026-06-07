# BaZi Context Agent / 八字上下文预测引擎

> **EN** - A local-first BaZi research prototype for deterministic chart derivation, candidate rectification, user-controlled context, structured forecasting, and holdout evaluation.
>
> **中文** - 一个 local-first 的八字研究型原型系统：先用确定性流程完成排盘、候选盘和校盘，再使用用户可控上下文生成结构化预测和报告。

[![Stage](https://img.shields.io/badge/stage-research%20prototype-blue)](#roadmap--开发路线)
[![Tests](https://img.shields.io/badge/tests-node--test-green)](#quick-start--快速开始)
[![AI Boundary](https://img.shields.io/badge/AI-after%20deterministic%20ranking-purple)](#ai-boundary--ai-边界)

[Try the interactive demo](https://madarame87.github.io/bazi-context-agent/) / [体验交互式演示](https://madarame87.github.io/bazi-context-agent/)

---

## Why This Exists / 为什么做这个项目

**EN** - Many BaZi tools assume the recorded birth time is correct and then produce a generic reading. In practice, a birth time can be rounded, uncertain, close to a boundary, or recorded under inconsistent assumptions. This project treats BaZi work as a staged pipeline: preserve uncertainty, generate chart candidates deterministically, compare candidates with dated life events, and only then use structured context for forecasting.

**中文** - 很多八字工具默认记录出生时间就是准确的，然后直接输出泛化解读。但现实中，出生时间可能被四舍五入、只知道大概时段、接近子时或节气边界，甚至记录口径本身不一致。本项目把八字分析拆成分阶段流程：保留不确定性，确定性生成候选盘，用有年份的人生事件做校盘比较，然后才让用户可控上下文进入预测阶段。

---

## Core Formula / 核心公式

```text
Derivative function / 导函数
= BaZi pillars + derived BaZi structure
= 八字八变量 + 五行/十神/藏干/纳音/神煞/关系等派生结构

Initial value / 初始值
= user-controlled context profile
= 用户主动填写并可控制用途的现实上下文

Forecast / 预测
= derivative function + initial value + current date + forecast horizon
= 导函数 + 初始值 + 当前日期 + 预测周期
```

**EN** - The system does not ask an LLM to decide the birth hour, rank candidates, or modify the selected chart. AI can be used only after deterministic ranking and rectification have produced structured inputs.

**中文** - 系统不会让 LLM 决定出生时辰、候选盘排序或选定盘。AI 只能在确定性候选盘排序和校盘完成之后，基于结构化输入生成预测、解释和报告。

---

## What Makes It Different / 差异点

| EN | 中文 |
|---|---|
| **Deterministic chart derivation**: chart candidates and derived profiles are produced by code before AI is allowed. | **确定性排盘与派生**：候选盘和八字派生结构先由代码生成，AI 不参与定盘。 |
| **BaZi derived-function engine**: chart data is normalized into a `BaziDerivedProfile` for downstream forecasting. | **八字导函数引擎**：将八字结构统一整理成 `BaziDerivedProfile`，供后续预测使用。 |
| **Context-aware forecast**: user-controlled context can personalize forecasts after chart derivation. | **上下文增强预测**：用户可控的信息框可在定盘完成后用于个性化预测。 |
| **Local-first privacy**: session save/load/export/import and redaction are designed for local control. | **本地优先隐私**：会话保存、恢复、导出、导入和脱敏都以本地控制为核心。 |
| **Evaluation benchmark**: A/B/C/D modes compare derivative-only, context-only, default-chart, and full-system variants. | **评估基准**：A/B/C/D 模式比较只看导函数、只看初始值、默认盘和完整系统。 |
| **Explicit AI boundary**: AI cannot alter upstream chart evidence or deterministic ranking. | **明确 AI 边界**：AI 不能回流修改上游排盘证据或确定性排序。 |

This public README intentionally describes the high-level architecture, not private scoring heuristics or prompt recipes.

本 README 只描述高层架构，不公开私有评分细节或提示词策略。

---

## Architecture / 架构

```text
Birth input / 出生信息
  |
  v
DefaultChart + CandidateChartV2 / 默认盘 + 候选盘
  |
  v
BaziEngineAdapter / 八字引擎适配层
  |
  v
BaziDerivedProfile / 八字导函数
  |
  v
RectificationResultV2 / 事件回测校盘
  |
  v
ForecastInput / 预测输入
  |
  v
FutureForecastResult / 未来预测结果
  |
  v
Report + Export + Evaluation / 报告、导出、评估
```

Important boundary:

```text
context_box -> ForecastInput only
context_box -/-> ranking or rectification
AI -/-> ranking or rectification
```

关键边界：

```text
信息框 -> 只进入预测输入
信息框 -/-> 不进入候选盘排序或校盘
AI -/-> 不进入候选盘排序或校盘
```

---

## Tech Stack / 技术栈

| Layer | Stack / Approach |
|---|---|
| Runtime | Node.js + TypeScript |
| Tests | Node.js built-in `node:test` |
| UI | Local vanilla HTML/JS served by Node |
| Config | JSON policy/config files under `configs/` |
| BaZi engine | Adapter boundary via `BaziEngineAdapter` |
| Prediction provider | Mock by default; OpenAI only behind server-side env flag |
| Privacy | Local-first session controls, redaction, export/import |
| Evaluation | Offline holdout benchmark modes A/B/C/D |

---

## Quick Start / 快速开始

Static public demo / 静态公开演示：

```text
site/index.html
```

Local preview:

```text
Open site/index.html in a browser, or serve site/ with a simple static server.
```

After GitHub Pages is enabled, the demo URL is:

```text
https://madarame87.github.io/bazi-context-agent/
```

启用 GitHub Pages 后，演示地址为：

```text
https://madarame87.github.io/bazi-context-agent/
```

```bash
npm install
npm test
npm run ui
```

PowerShell fallback:

```powershell
$env:Path='C:\Program Files\nodejs;' + $env:Path; npm.cmd test
$env:Path='C:\Program Files\nodejs;' + $env:Path; npm.cmd run ui
```

The local UI is a demo/prototype surface. It does not require login, payment, a database, or cloud sync.

本地 UI 是原型演示界面，不需要登录、支付、数据库或云同步。

---

## AI Boundary / AI 边界

**EN** - AI may generate forecast language and reports only after deterministic structures already exist. It must not decide the chart, rank candidates, alter rectification, change the selected chart, or modify the `BaziDerivedProfile`.

**中文** - AI 只能在确定性结构已经生成之后，用于生成预测文本和报告。AI 不得定盘、排序候选盘、修改校盘、改变选定盘或改写 `BaziDerivedProfile`。

Allowed after deterministic inputs:

- context-aware forecast;
- report generation;
- explanation and uncertainty notes.

在确定性输入完成后允许：

- 上下文增强预测；
- 报告生成；
- 解释和不确定性说明。

Not allowed:

- AI deciding birth hour;
- AI modifying candidate scores;
- AI changing selected chart;
- context box affecting rectification ranking.

不允许：

- AI 决定出生时辰；
- AI 修改候选盘分数；
- AI 改变选定盘；
- 信息框影响校盘排序。

---

## Privacy / 隐私

**EN** - The project is designed as local-first. User context is user-controlled: facts can be hidden from forecast, hidden from export, deleted, or cleared from local storage. Exported sessions and reports apply redaction rules and must not include API keys or secrets.

**中文** - 本项目按 local-first 设计。用户上下文由用户控制：可以隐藏不进入预测、隐藏不进入导出、删除事实，或清空本地数据。导出的 session 和报告会应用脱敏规则，不应包含 API key 或 secrets。

Do not commit:

- real `.env` files;
- real API keys;
- GitHub tokens;
- private user cases;
- personally identifying benchmark data.

请勿提交：

- 真实 `.env` 文件；
- 真实 API key；
- GitHub token；
- 私人命例；
- 可识别身份的评估数据。

---

## Evaluation / 评估

The project includes an offline holdout benchmark harness. It compares modes such as:

| Mode | Meaning | 中文 |
|---|---|---|
| A | derivative only | 只看导函数 |
| B | initial value only | 只看初始值 |
| C | default chart + initial value | 默认盘 + 初始值 |
| D | selected chart + initial value | 选定盘/校正盘 + 初始值 |

This framework supports comparative evaluation under holdout conditions. It does not claim guaranteed accuracy.

该框架支持在留出条件下做对比评估，但不宣称保证准确。

---

## Roadmap / 开发路线

| Stage | EN | 中文 | Status |
|---:|---|---|---|
| 1 | Scaffold | 项目骨架 | Done |
| 2 | Questionnaire + deterministic scoring | 问卷与确定性评分 | Done |
| 3 | Local UI flow | 本地 UI 流程 | Done |
| 4 | Prediction + report layer | 预测与报告层 | Done |
| 5 | BaZi derived-function pipeline | 八字导函数管线 | Done |
| 6 | Future forecast engine | 未来预测引擎 | Done |
| 7 | Evaluation benchmark | 评估基准 | Done |
| 8 | Privacy/storage/user control | 隐私、存储、用户控制 | Done |
| 9 | GitHub release polish | GitHub 发布包装 | Current |

---

## Limitations / 局限

**EN** - This is a research prototype. BaZi and metaphysical analysis should not be used as medical, legal, financial, or safety-critical advice. Forecasts are structured interpretations, not guarantees.

**中文** - 本项目是研究型原型。八字和玄学分析不应作为医疗、法律、金融或安全关键决策依据。预测是结构化解释，不是保证。

---

## Contributing / 贡献

See [`CONTRIBUTING.md`](CONTRIBUTING.md).

请查看 [`CONTRIBUTING.md`](CONTRIBUTING.md)。

---

## Security / 安全

See [`SECURITY.md`](SECURITY.md).

请查看 [`SECURITY.md`](SECURITY.md)。

---

## License / 许可证

License is TBD. No reuse rights are granted until a license is selected. See [`docs/LICENSE_DECISION_STAGE9.md`](docs/LICENSE_DECISION_STAGE9.md).

许可证待定。在明确选择许可证之前，不授予复用权利。请查看 [`docs/LICENSE_DECISION_STAGE9.md`](docs/LICENSE_DECISION_STAGE9.md)。
