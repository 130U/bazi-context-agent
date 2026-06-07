# Stage 5E ForecastInput Builder

## Purpose

The ForecastInput Builder constructs the exact payload that Stage 6 AI forecast will consume.

It must combine:

```text
导函数 = BaziDerivedProfile
initial value = context_box + known_life_events + current state
current_date
forecast_horizon
user_question
rectification metadata
```

## Input

```ts
type ForecastInputBuildRequest = {
  current_date: string; // YYYY-MM-DD, provided by request or server current date
  timezone?: string;

  user_question: string;
  forecast_horizon: ForecastHorizon;
  forecast_domains?: ForecastDomain[];

  selected_chart: {
    chart_id: string;
    chart_role: "default" | "candidate";
    fixed_pillars: FixedPillars;
    confidence: number;
  };

  rectification_result: RectificationResultV2;
  derivative_profile: BaziDerivedProfile;

  context_box: ContextFact[];
  known_life_events: LifeEvent[];

  options?: {
    include_raw_profile?: boolean;
    include_alternatives?: boolean;
    include_private_context?: boolean;
  };
};
```

## Output

```ts
type ForecastInput = {
  forecast_input_id: string;
  schema_version: "stage5e.v1";
  current_date: string;
  timezone?: string;

  forecast_request: {
    user_question: string;
    forecast_horizon: ForecastHorizon;
    forecast_domains: ForecastDomain[];
  };

  selected_chart: {
    chart_id: string;
    chart_role: "default" | "candidate";
    fixed_pillars: FixedPillars;
    confidence: number;
    selection_source: "default_chart" | "rectification_v2";
  };

  derivative_function: BaziDerivedProfile;

  initial_value: ForecastInitialValue;

  rectification_summary: {
    recommendation: string;
    confidence: number;
    selected_chart_id: string;
    default_chart_protected: boolean;
    context_box_used_for_rectification: false;
    ai_used_for_rectification: false;
  };

  data_provenance: ForecastDataProvenance[];

  boundaries: {
    ai_used_to_build_forecast_input: false;
    ai_allowed_in_stage6_forecast: true;
    ranking_modified: false;
    rectification_modified: false;
    context_box_used_for_rectification: false;
    secrets_included: false;
  };

  warnings: string[];
};
```

## Required behavior

1. If `derivative_profile` is missing, return a clear error.
2. If `selected_chart` is missing, return a clear error.
3. If `user_question` is empty, return a clear error.
4. If `current_date` is missing, use server current date or explicit fallback in tests.
5. Do not hard-code a specific date in production logic.
6. Normalize context facts into `initial_value`.
7. Keep known facts separate from prediction.
8. Do not produce any actual forecast.
9. Do not call AI.

## Optional API

Stage 5E may add:

```text
POST /api/forecast-input
```

But it must only build `ForecastInput`.
