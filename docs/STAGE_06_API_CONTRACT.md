# Stage 6 API Contract

## Endpoint

```text
POST /api/future-forecast
```

## Request

```json
{
  "forecast_input": {},
  "options": {
    "provider": "mock",
    "language": "zh-CN",
    "include_action_plan": true,
    "include_timeline": true,
    "include_risk_windows": true
  }
}
```

## Response

```json
{
  "forecast_result": {},
  "metadata": {
    "stage": "6",
    "schema_validated": true,
    "ai_used_for_forecast": true,
    "ai_used_for_ranking": false,
    "ai_used_for_rectification": false
  }
}
```

## Errors

```text
MISSING_FORECAST_INPUT
INVALID_FORECAST_INPUT
PROVIDER_NOT_CONFIGURED
FORECAST_SCHEMA_VALIDATION_FAILED
```

## Constraints

The endpoint must not:

```text
call rankCandidates
call rectificationV2 scoring
rebuild ForecastInput
modify selected chart
modify rectification result
modify BaziDerivedProfile
```
