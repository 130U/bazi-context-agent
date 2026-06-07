# Stage 6 Roadmap — Future Forecast Engine

## Position

Stage 6 starts after Stage 5E.

```text
Stage 5E:
ForecastInput = derivative_function + initial_value + current_date + user_question

Stage 6:
ForecastInput -> FutureForecastResult
```

## Product formula

```text
导函数 = BaziDerivedProfile
initial value = context_box + known_life_events + current state
forecast = provider uses 导函数 + initial value to predict future
```

## Stage 6 substeps

```text
6A. Define FutureForecastResult schema
6B. Build forecast prompt/input compiler
6C. Implement mock forecast provider
6D. Connect optional real provider through existing provider policy
6E. Add /api/future-forecast
6F. Add tests proving boundaries
```

## Stage 6 output

The final Stage 6 output is a structured forecast, not a free-form essay.

It must include:

```text
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

## Key boundary

Stage 6 may use AI for forecasting, but it must not:

```text
change selected_chart
change rectification_result
change ranking scores
change BaziDerivedProfile
call ranking/rectification APIs
```
