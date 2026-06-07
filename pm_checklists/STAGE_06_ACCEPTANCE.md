# Stage 6 Acceptance Checklist

## Core

- [ ] FutureForecastRequest type exists.
- [ ] FutureForecastResult type exists.
- [ ] Forecast prompt builder exists.
- [ ] Mock future forecast provider exists.
- [ ] Forecast result schema validation exists.
- [ ] `/api/future-forecast` exists or equivalent handler exists.
- [ ] Missing ForecastInput returns a clear error.
- [ ] ForecastInput is not mutated.
- [ ] selected_chart is not mutated.
- [ ] rectification_result is not mutated.
- [ ] BaziDerivedProfile is not mutated.

## Output

- [ ] Output includes executive_summary.
- [ ] Output includes domain_forecasts.
- [ ] Output includes timeline_windows.
- [ ] Output includes opportunity_windows.
- [ ] Output includes risk_windows.
- [ ] Output includes recommended_actions.
- [ ] Output includes uncertainty.
- [ ] Output separates known_facts_used.
- [ ] Output separates derivative_signals_used.
- [ ] Output separates initial_value_adjustments.
- [ ] Output includes policy metadata.

## Boundaries

- [ ] `/api/ranking` is not modified.
- [ ] `/api/rectification-v2` is not modified.
- [ ] `/api/forecast-input` is not modified.
- [ ] Forecast engine does not call ranking.
- [ ] Forecast engine does not call rectification.
- [ ] AI is not used for ranking.
- [ ] AI is not used for rectification.
- [ ] context_box is used only as initial value.
- [ ] No real API key is committed.
- [ ] No real `.env` is created.
- [ ] Tests do not make real network calls.
- [ ] No login/payment/database/user system is added.

## Tests

- [ ] `npm test` passes.
- [ ] Schema validation tests pass.
- [ ] Boundary tests pass.
- [ ] Secret redaction tests pass.
- [ ] Stage 0–5 existing tests still pass.
