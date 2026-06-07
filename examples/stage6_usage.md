# Stage 6 Usage Example

## Build request

```json
{
  "forecast_input": "<ForecastInput from Stage 5E>",
  "options": {
    "provider": "mock",
    "language": "zh-CN",
    "include_action_plan": true,
    "include_timeline": true,
    "include_risk_windows": true
  }
}
```

## Call

```text
POST /api/future-forecast
```

## Expected response

```json
{
  "forecast_result": {
    "schema_version": "stage6.v1",
    "executive_summary": "...",
    "domain_forecasts": [],
    "policy": {
      "ai_used_for_ranking": false,
      "ai_used_for_rectification": false,
      "selected_chart_modified": false
    }
  }
}
```
