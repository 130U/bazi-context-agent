# Stage 5E ForecastInput Schema

## ForecastHorizon

```ts
type ForecastHorizon =
  | "3_months"
  | "6_months"
  | "1_year"
  | "3_years"
  | "5_years"
  | "10_years";
```

## ForecastDomain

```ts
type ForecastDomain =
  | "education"
  | "career"
  | "wealth"
  | "relationship"
  | "health"
  | "migration"
  | "family"
  | "personality"
  | "general";
```

## ForecastInitialValue

```ts
type ForecastInitialValue = {
  context_facts: ContextFact[];
  known_life_events: LifeEvent[];
  current_state_summary?: string;
  resource_baseline?: {
    family_support?: string;
    education_resources?: string;
    career_resources?: string;
    migration_resources?: string;
  };
  preference_profile?: {
    desired_life_outcomes?: string[];
    inner_preferred_direction?: string;
    actual_path?: string;
    recent_focus_or_anxiety?: string[];
  };
  warnings: string[];
};
```

## ForecastDataProvenance

```ts
type ForecastDataProvenance = {
  field_path: string;
  source:
    | "bazi_derived_profile"
    | "rectification_result"
    | "context_box"
    | "known_life_events"
    | "user_question"
    | "system_current_date";
  source_id?: string;
  confidence?: number;
  fact_type?: "direct_fact" | "inferred_fact" | "derived_chart_signal" | "system_metadata";
};
```

## ForecastInput

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

## Validation

The implementation may use a lightweight hand-written validator or a JSON Schema validator. The schema file is:

```text
configs/forecast_input_schema.stage5e.json
```

The builder must reject malformed input and must not silently produce invalid `ForecastInput`.
