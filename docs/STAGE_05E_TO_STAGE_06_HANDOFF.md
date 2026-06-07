# Stage 5E to Stage 6 Handoff

## Stage 5E output

```text
ForecastInput
```

## Stage 6 input

Stage 6 must consume `ForecastInput` directly.

It should not rebuild:

```text
- selected chart
- rectification result
- BaziDerivedProfile
- context box
```

## Stage 6 responsibility

Stage 6 is responsible for:

```text
AI Future Forecast Engine
```

It may use:

```text
ForecastInput
PredictionProvider
forecast-specific prompt builder
forecast output schema
```

It must output:

```text
FutureForecastResult
```

## Stage 6 must preserve these boundaries

1. Known facts are not predictions.
2. Chart signals are not initial value.
3. Initial value is not chart signal.
4. AI forecast does not modify selected chart.
5. AI forecast does not modify rectification.
6. AI forecast must cite source categories internally:
   - derivative_function
   - initial_value
   - known_life_events
   - user_question
   - current_date
```

## Stage 6 suggested outputs

```text
- conclusion
- opportunity_windows
- risk_windows
- career_forecast
- wealth_forecast
- relationship_forecast
- migration_forecast
- health_risk_notes
- confidence
- uncertainty
- next_questions
```
