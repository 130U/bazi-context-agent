# Stage 5D to Stage 5E Handoff

Stage 5D outputs `RectificationResultV2`.

Stage 5E will build `ForecastInput`.

## Stage 5D output needed by 5E

```ts
type Stage5DToStage5EHandoff = {
  selected_chart_id: string;
  selected_chart_role: "default" | "candidate";
  selected_chart_confidence: number;
  bazi_derived_profile: BaziDerivedProfile;
  rectification_result: RectificationResultV2;
  known_life_events: LifeEvent[];
  warnings: string[];
};
```

## Stage 5E adds

```text
context_box = initial value
current_date
forecast_horizon
user_question
provider policy
```

## Boundary

Stage 5D does not use context_box.

Stage 5E can use context_box because it builds forecast input, not rectification ranking.

## Stage 6 receives

```ts
type ForecastInput = {
  derivative_function: BaziDerivedProfile;
  initial_value: ContextFact[];
  known_life_events: LifeEvent[];
  current_date: string;
  forecast_horizon: string;
  user_question: string;
  rectification_summary: RectificationResultV2;
};
```
