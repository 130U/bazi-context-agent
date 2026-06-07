# Stage 6 Forecast Engine Plan

## Goal

Use the derivative function and initial value to forecast future life tendencies.

```text
Derivative Function + Initial Value + Current Date + Forecast Horizon -> Future Forecast
```

## Input

```ts
ForecastInput
PredictionProvider
PredictionOutputSchema
```

## Output

```ts
export type FutureForecastResult = {
  forecast_horizon: "6_months" | "1_year" | "3_years" | "10_years";
  conclusion: string;
  key_opportunities: Array<{
    domain: string;
    time_window: string;
    basis: string[];
    confidence: number;
  }>;
  key_risks: Array<{
    domain: string;
    time_window: string;
    basis: string[];
    confidence: number;
  }>;
  domain_forecasts: Array<{
    domain: "education" | "career" | "wealth" | "relationship" | "health" | "migration" | "family" | "personality" | "general";
    derivative_signal: string;
    initial_value_adjustment: string;
    forecast: string;
    confidence: number;
  }>;
  uncertainty: string[];
  next_questions: string[];
  policy: {
    ai_used_for_rectification: false;
    ai_used_for_forecast: true;
    context_box_used_for_forecast: true;
    known_facts_not_disguised_as_predictions: true;
  };
};
```

## Forecast Rules

The AI must distinguish:

- known facts;
- chart-derived signals;
- initial value adjustments;
- actual future prediction;
- uncertainty.

## Example Logic

If derivative function indicates career volatility but initial value shows elite education and strong family support, forecast should not simply say “career failure.” It should say something like:

```text
The chart suggests career transition pressure, but initial value raises downside protection and recovery capacity.
```

## Non-Goals

Stage 6 must not:

- recompute BaZi;
- modify selected chart;
- modify rectification result;
- pretend known facts are predictions;
- give medical, legal, or financial certainty.

