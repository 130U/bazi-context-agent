# Stage 5 Adapter Decision

## Decision

Adopt a two-layer adapter strategy:

```text
Base BaZi Adapter       -> 6tail/lunar-javascript
Enrichment Adapter      -> mystilight-8char, experimental
Reference Architecture  -> VedAstro and PyJHora only
```

This decision is deliberately conservative. Stage 5 should compute the BaZi derived function, not give any third-party package ownership of rectification policy.

## Why This Decision

No researched project is a complete drop-in BaZi birth-time rectification system for this product.

The closest workable architecture is:

1. Use a mature JavaScript calendar/BaZi library for base deterministic chart facts.
2. Normalize all output into our own `BaziDerivedProfile`.
3. Optionally enrich that profile with a second BaZi-specific analysis library.
4. Keep rectification scoring in our own deterministic code.
5. Keep context_box outside ranking.
6. Use context_box only later as forecast initial value.

## Core Product Boundary

### Derived Function

```text
derived function = BaZi + BaZi-derived luck/structure information
```

It is the structured representation of:

- four pillars;
- day master;
- five elements;
- ten gods;
- hidden stems;
- na yin;
- stars/shensha if available;
- relations;
- luck cycles;
- annual/current luck structures;
- adapter assumptions and warnings.

### Initial Value

```text
initial value = questionnaire-derived real-world initial state
```

It includes education, family, current identity, preferences, constraints, and recent concerns from context_box.

### Prediction

Stage 6 prediction should use:

```text
derived function + initial value + current date -> forecast
```

Stage 5 does not produce the final forecast.

## Recommended Adapter Boundary

Stage 5B should define these stable internal types before any dependency install:

- `RecordedBirthTime`
- `DefaultChart`
- `CandidateChartV2`
- `FixedPillars`
- `BaziDerivedProfile`
- `BaziEngineAdapter`
- `BaziAdapterError`
- `DerivedFunctionSource`
- `RectificationEvidence`
- `ForecastInput`

Third-party library output must never leak directly into ranking or prediction UI. The app should talk to our adapter and normalized schemas only.

## Base Adapter

### Source Library

`6tail/lunar-javascript`

### Role

```text
RecordedBirthTime -> FixedPillars + base BaZi/calendar metadata
```

### Responsibilities

- Convert recorded birth datetime into solar/lunar calendar context.
- Generate gan-zhi pillars.
- Expose base five elements / ten gods / na yin / stars where available.
- Preserve assumptions around timezone, zi hour, jieqi, date boundary and sect.
- Fail explicitly when birth time is missing or unsupported.

### Non-Responsibilities

- Do not run rectification.
- Do not read context_box.
- Do not call AI.
- Do not modify ranking.
- Do not produce final forecast.

## Enrichment Adapter

### Source Library

`mystilight-8char`

### Role

```text
FixedPillars or RecordedBirthTime -> enriched BaziDerivedProfile fields
```

### Responsibilities

- Add hidden stem details.
- Add ten-god details.
- Add five-element power/strength structures.
- Add dayun/liunian/currentYun structures if validated.
- Add gan/zhi relations if validated.
- Support fixed-pillar reverse/search helper only behind explicit adapter methods.

### Policy

The enrichment adapter is experimental until Stage 5C spike tests confirm:

- deterministic output;
- API stability;
- assumptions are explicit;
- cross-check against base adapter for pillars;
- no context_box input;
- no ranking mutation.

## Reference-Only Projects

### VedAstro

Use as a reference for:

- birth-time finder architecture;
- API layering;
- calculation service boundaries;
- event/log style rectification UX.

Do not use as the BaZi engine because it is Vedic/Jyotish, not BaZi.

### PyJHora

Use as a reference for:

- broad computational astrology test coverage;
- dasha/luck-cycle style architecture;
- handling large ephemeris/data requirements.

Do not integrate into the TypeScript MVP because it is Python and Vedic/Jyotish.

## Not Recommended

### afjoseph/sacredstar

Not recommended because an authoritative source/package could not be reliably verified.

### tommitoan/bazica

Not recommended as primary because it is Go, pre-v1, lacks package documentation on pkg.go.dev, and does not fit the current TypeScript runtime.

### Zi Wei / Qi Men / Feng Shui Libraries

Explicitly out of scope. This MVP remains BaZi-only.

## DefaultChart and CandidateChart Policy

### DefaultChart

DefaultChart comes from the user's recorded birth time.

It should be protected as the default chart and overridden only by strong deterministic rectification evidence.

### CandidateChart[]

CandidateChart[] should be generated only when time uncertainty exists:

- unknown time;
- wide uncertainty range;
- near hour boundary;
- near zi hour/date boundary;
- near jieqi boundary;
- user explicitly asks to explore alternatives.

Candidate generation remains deterministic.

## Rectification v2 Policy

Rectification v2 can use:

- birth record plausibility;
- symbol prior;
- major dated events;
- event backtest against derived profiles;
- candidate chart assumptions/warnings.

Rectification v2 must not use:

- context_box;
- prediction output;
- AI/LLM;
- real-world preference facts;
- report text.

## Forecast Input Policy

Stage 5E should build `ForecastInput` using:

```text
selected/default chart
+ BaziDerivedProfile
+ context_box initial value
+ known life events
+ current date
+ forecast horizon
```

The ForecastInput is for Stage 6. It must not flow back into rectification ranking.

## Stage 5B Acceptance Direction

Proceed to Stage 5B with no dependency install yet.

Stage 5B should produce:

- adapter interfaces;
- normalized derived profile schema;
- no business logic rewrite;
- no `/api/ranking` modification;
- no context_box ranking path;
- no AI provider changes.

Stage 5C can then do the smallest dependency spike against `6tail/lunar-javascript`, and only after the adapter boundary is stable.

## Final Decision

```text
Use 6tail/lunar-javascript as base.
Evaluate mystilight-8char as enrichment.
Use VedAstro/PyJHora as references.
Build our own adapter, normalization and rectification-v2 policy.
Do not use context_box or AI for chart ranking.
Do not forecast until Stage 6.
```
