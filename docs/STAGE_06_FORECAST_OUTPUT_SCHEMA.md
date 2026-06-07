# Stage 6 Forecast Output Schema

## Purpose

The forecast output must be structured. Free-form fortune-telling text is not acceptable as the only result.

## Required top-level fields

```text
forecast_result_id
schema_version
generated_at
current_date
forecast_horizon
executive_summary
domain_forecasts
timeline_windows
opportunity_windows
risk_windows
recommended_actions
uncertainty
known_facts_used
derivative_signals_used
initial_value_adjustments
policy
```

## DomainForecast

```ts
type DomainForecast = {
  domain:
    | "career"
    | "wealth"
    | "relationship"
    | "education"
    | "migration"
    | "health"
    | "family"
    | "personal_growth"
    | "general";
  conclusion: string;
  forecast: string;
  confidence: number;
  derivative_basis: string[];
  initial_value_basis: string[];
  time_windows: string[];
  caveats: string[];
};
```

## Policy metadata

```ts
type ForecastPolicyMetadata = {
  provider: "mock" | "openai" | "mock_fallback";
  ai_used_for_forecast: boolean;
  ai_used_for_ranking: false;
  ai_used_for_rectification: false;
  ranking_modified: false;
  rectification_modified: false;
  selected_chart_modified: false;
  output_schema_validated: boolean;
  secrets_included: false;
};
```

## Validation rules

```text
confidence must be 0–1
policy.ai_used_for_ranking must be false
policy.ai_used_for_rectification must be false
policy.selected_chart_modified must be false
policy.secrets_included must be false
```
