# Stage 5E Forecast Input Builder Spec

## Goal

Build the structure that Stage 6 AI forecast will consume.

## Input

```ts
SelectedChart | DefaultChart
BaziDerivedProfile
ContextFact[]
LifeEvent[]
PredictionQuestion
CurrentDate
ForecastHorizon
```

## Output

```ts
export type ForecastInput = {
  current_date: string; // e.g. 2026-06-06
  forecast_horizon: "6_months" | "1_year" | "3_years" | "10_years";
  selected_chart: {
    chart_id: string;
    fixed_pillars: FixedPillars;
    source: "default_chart" | "rectified_candidate";
    confidence: number;
  };
  derivative_function: BaziDerivedProfile;
  initial_value: {
    context_box: ContextFact[];
    known_life_events: LifeEvent[];
    user_current_state_summary?: string;
  };
  user_question: string;
  boundaries: {
    ai_used_for_rectification: false;
    context_box_used_for_rectification: false;
    ai_allowed_for_forecast: true;
  };
};
```

## Logic

The builder must separate:

- derivative_function: BaZi-derived timing structure;
- initial_value: questionnaire-derived real-world state;
- forecast question and horizon;
- boundaries.

## Effect

Stage 6 can focus on forecasting only. It does not need to know how charts were generated or rectified.

