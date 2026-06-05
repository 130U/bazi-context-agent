# Stage 04 Overview

Stage 04 adds a prediction layer after deterministic candidate ranking.

## Pipeline boundary

```text
Birth Input
→ Symbol Prior Scoring
→ Candidate Generation
→ Event Backtest
→ Top 3 Candidate Ranking
→ Context Box
→ Prediction Layer
→ Report / Export
```

Rules:

1. Everything before and including Top 3 candidate ranking is deterministic.
2. `/api/ranking` must not use `context_box` initial value.
3. `/api/prediction` may use `context_box`, `life_events`, and a frozen `rankingSnapshot`.
4. Prediction may explain and forecast, but must not mutate ranking.
5. AI is only allowed after ranking is complete.

## Stage split

| Stage | Purpose | Real AI allowed? |
|---|---|---:|
| 4A | Mock prediction layer and schema | No |
| 4B | Real OpenAI provider behind env flag | Yes, server-side prediction only |
| 4C | Prediction UI and report polish | Uses provider abstraction |

## Stage 04 success condition

The product can generate a context-aware prediction from:

- Top 3 candidate ranking snapshot;
- context box facts;
- life events;
- user prediction question.

The output must distinguish:

- known facts;
- chart signals;
- context adjustments;
- actual prediction;
- uncertainty;
- policy boundaries.
