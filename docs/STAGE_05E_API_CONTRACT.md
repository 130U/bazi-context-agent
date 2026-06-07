# Stage 5E API Contract

## Optional endpoint

```text
POST /api/forecast-input
```

## Request

```json
{
  "current_date": "2026-06-07",
  "timezone": "Asia/Singapore",
  "user_question": "未来一年我的事业走势如何？",
  "forecast_horizon": "1_year",
  "forecast_domains": ["career", "wealth"],
  "selected_chart": {},
  "rectification_result": {},
  "derivative_profile": {},
  "context_box": [],
  "known_life_events": []
}
```

## Response

```json
{
  "forecast_input": {},
  "metadata": {
    "stage": "5E",
    "ai_used": false,
    "ready_for_stage6": true
  }
}
```

## Errors

```text
MISSING_SELECTED_CHART
MISSING_DERIVATIVE_PROFILE
MISSING_USER_QUESTION
INVALID_FORECAST_HORIZON
INVALID_FORECAST_DOMAIN
INVALID_FORECAST_INPUT_SCHEMA
```

## Endpoint constraints

`/api/forecast-input` must not:

1. Call `/api/ranking`.
2. Call `/api/rectification-v2`.
3. Call `/api/prediction`.
4. Call OpenAI.
5. Modify selected chart.
6. Modify rectification result.
7. Include secrets.

## Equivalent implementation

If the project does not add `/api/forecast-input`, it may implement an internal function:

```ts
buildForecastInput(request: ForecastInputBuildRequest): ForecastInput
```

But the tests must cover the same contract.
