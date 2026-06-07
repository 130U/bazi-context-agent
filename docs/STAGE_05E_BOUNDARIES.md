# Stage 5E Boundaries

## Absolute boundaries

Stage 5E must not:

1. Call OpenAI.
2. Call any AI provider.
3. Generate a future forecast.
4. Modify `/api/ranking`.
5. Modify `/api/rectification-v2`.
6. Change selected chart.
7. Re-score candidate charts.
8. Let context_box influence rectification.
9. Write or read real API keys.
10. Create a real `.env` file.
11. Add login, payment, database, or user system.

## Allowed

Stage 5E may:

1. Read `RectificationResultV2`.
2. Read `BaziDerivedProfile`.
3. Read `ContextFact[]`.
4. Read `LifeEvent[]`.
5. Read `user_question`.
6. Read `forecast_horizon`.
7. Build `ForecastInput`.
8. Add `/api/forecast-input`.
9. Add tests and fixtures.

## Why the boundary matters

Stage 5E packages data for future AI use. It is not the AI stage.

The boundary must show:

```text
ai_used_to_build_forecast_input = false
ai_allowed_in_stage6_forecast = true
context_box_used_for_rectification = false
```

## Context box policy

The context box is included in `initial_value`.

It must not be included in:

```text
rectification scoring
candidate ranking
selected chart mutation
```

## Secret policy

ForecastInput must not include:

```text
OPENAI_API_KEY
ANTHROPIC_API_KEY
GitHub tokens
.env file contents
local absolute file paths
```
