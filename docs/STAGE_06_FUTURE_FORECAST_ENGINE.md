# Stage 6 Future Forecast Engine

## Goal

Build a future forecast engine that consumes `ForecastInput` from Stage 5E and returns a schema-validated `FutureForecastResult`.

## Inputs

```ts
type FutureForecastRequest = {
  forecast_input: ForecastInput;
  options?: {
    provider?: "mock" | "openai";
    language?: "zh-CN" | "en";
    include_action_plan?: boolean;
    include_timeline?: boolean;
    include_risk_windows?: boolean;
  };
};
```

## Output

```ts
type FutureForecastResult = {
  forecast_result_id: string;
  schema_version: "stage6.v1";
  generated_at: string;
  current_date: string;
  forecast_horizon: "3_months" | "6_months" | "1_year" | "3_years" | "10_years";
  executive_summary: string;
  domain_forecasts: DomainForecast[];
  timeline_windows: ForecastTimelineWindow[];
  opportunity_windows: ForecastWindow[];
  risk_windows: ForecastWindow[];
  recommended_actions: RecommendedAction[];
  uncertainty: ForecastUncertainty[];
  known_facts_used: KnownFactReference[];
  derivative_signals_used: DerivativeSignalReference[];
  initial_value_adjustments: InitialValueAdjustment[];
  policy: ForecastPolicyMetadata;
};
```

## Forecast engine pipeline

```text
1. Validate ForecastInput.
2. Compile provider input.
3. Select provider:
   - default mock
   - openai only when explicitly enabled by existing provider policy
4. Generate forecast.
5. Validate FutureForecastResult against schema.
6. Redact secrets.
7. Return result.
```

## Important split

```text
known_facts_used:
  Facts already provided by the user.

derivative_signals_used:
  Signals from BaziDerivedProfile.

initial_value_adjustments:
  How context changes the forecast interpretation.

forecast:
  Actual future-facing prediction.
```

Known facts must not be disguised as predictions.
