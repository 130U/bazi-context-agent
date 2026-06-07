# Architecture / 架构

```text
Birth Input
  ↓
DefaultChart
  ↓
CandidateChart[] if uncertain
  ↓
BaziEngineAdapter
  ↓
BaziDerivedProfile
  ↓
Rectification v2
  ↓
Context Box
  ↓
ForecastInput
  ↓
FutureForecastEngine
  ↓
Report / Export / Evaluation
```

## Hard boundaries

- `context_box` must not affect chart ranking.
- AI must not affect chart ranking or rectification.
- Forecasting can use context and selected chart, but cannot mutate them.
- Evaluation must distinguish known facts from predictions.
