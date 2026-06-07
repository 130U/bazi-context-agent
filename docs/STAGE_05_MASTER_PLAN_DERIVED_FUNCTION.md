# Stage 5 Master Plan: BaZi Derived Function Engine

## One-Line Goal

```text
Stage 5 求导函数：把用户记录出生时间或候选出生时间，稳定转换为八字八变量及其派生命理结构。
```

## Why This Is the Hardest Current Problem

Stage 0–4 already solved:

- questionnaire collection;
- deterministic ranking skeleton;
- context_box separation;
- mock/real prediction provider;
- report UI/export.

The remaining bottleneck is not AI. The bottleneck is:

```text
How do we reliably obtain the derivative function?
```

If the system has a reliable BaZi-derived profile, then future prediction becomes a much easier integration task:

```text
Derivative Function + Initial Value + Current Date -> AI forecast
```

## Stage 5 Sub-Stages

| Sub-stage | Name | Purpose | Main Output |
|---|---|---|---|
| 5A | Library Research & Adapter Decision | Pick main library and architecture | Stage 5 decision docs |
| 5B | Adapter Interface | Define stable internal types | BaziEngineAdapter, BaziDerivedProfile |
| 5C | Base Library Integration | Integrate selected library, likely 6tail/lunar-javascript | DefaultChart -> BaziDerivedProfile |
| 5D | Rectification v2 | Default chart protection + candidate event scoring | SelectedChart + Top alternatives |
| 5E | Forecast Input Builder | Build AI-ready future forecast input | ForecastInput |

## Stage 5A Input / Output / Logic

### Input

- Existing repo and Stage 4C code.
- Current question bank and event answers.
- Known candidate libraries:
  - 6tail/lunar-javascript
  - mystilight/mystilight-8char
  - VedAstro/VedAstro
  - PyJHora
  - sacredstar
  - bazica

### Output

- `docs/STAGE_05A_LIBRARY_RESEARCH.md`
- `docs/STAGE_05_ADAPTER_STRATEGY.md`
- `pm_checklists/STAGE_05A_ACCEPTANCE.md`
- Recommendation:
  - primary library;
  - enrichment library;
  - reference-only projects;
  - not recommended projects.

### Logic

Evaluate libraries by:

- runtime compatibility;
- license;
- reputation;
- API shape;
- ability to generate BaZi and derived data;
- ability to use recorded birth time;
- ability to use fixed pillars;
- ability to support luck cycles and annual fortunes;
- integration risk.

### Effect

The project should know exactly which external engine to integrate and where the adapter boundary is.

## Stage 5B Input / Output / Logic

### Input

- Stage 5A decision docs.
- Existing `CandidateChart`, `LifeEvent`, `ContextFact`, `RankingSnapshot`.

### Output

- Type definitions:
  - `RecordedBirthTime`
  - `DefaultChart`
  - `CandidateChartV2`
  - `FixedPillars`
  - `BaziDerivedProfile`
  - `BaziEngineAdapter`
  - `DerivedFunctionSource`
  - `RectificationEvidence`
  - `ForecastInput`

### Logic

Define stable internal structures before integrating any library. All third-party output must be normalized into our own structure.

### Effect

The rest of the app talks to our adapter, not directly to a random third-party API.

## Stage 5C Input / Output / Logic

### Input

- `RecordedBirthTime`
- `DefaultChart`
- selected base library

### Output

- `BaziDerivedProfile` for DefaultChart.
- Optional `BaziDerivedProfile` for CandidateChart[] if candidate mode is active.

### Logic

Use the selected library to compute BaZi and related derived values. Stage 5C only enriches charts; it must not rerank them.

### Effect

The product now has a usable derivative function from recorded birth data.

## Stage 5D Input / Output / Logic

### Input

- DefaultChart profile;
- CandidateChart profiles;
- dated major events;
- weak symbol priors;
- recorded time prior.

### Output

- `RectificationResultV2`
- selected chart;
- default chart status;
- top alternatives;
- evidence table;
- confidence;
- warnings.

### Logic

Use only rectification evidence, not context_box. Protect the default chart unless alternatives clearly outperform it.

### Effect

The system can handle uncertain birth time without pretending context_box facts are chart evidence.

## Stage 5E Input / Output / Logic

### Input

- selected/default chart;
- BaziDerivedProfile;
- ContextBox;
- known life events;
- current date;
- forecast horizon.

### Output

- `ForecastInput`

### Logic

Package the derivative function and initial value for Stage 6 AI forecast.

### Effect

Stage 6 can focus purely on forecast reasoning.

