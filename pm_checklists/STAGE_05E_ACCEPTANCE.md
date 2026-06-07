# Stage 5E Acceptance Checklist

## Files / modules

- [ ] ForecastInput types exist.
- [ ] ForecastInput builder exists.
- [ ] ForecastInput validator exists.
- [ ] Data provenance is emitted.
- [ ] Boundaries metadata is emitted.
- [ ] Initial value normalization exists.
- [ ] Optional `/api/forecast-input` exists, or internal builder is fully tested.

## ForecastInput structure

- [ ] Contains `forecast_input_id`.
- [ ] Contains `schema_version`.
- [ ] Contains `current_date`.
- [ ] Contains `forecast_request`.
- [ ] Contains `selected_chart`.
- [ ] Contains `derivative_function`.
- [ ] Contains `initial_value`.
- [ ] Contains `rectification_summary`.
- [ ] Contains `data_provenance`.
- [ ] Contains `boundaries`.
- [ ] Contains `warnings`.

## Product logic

- [ ] `derivative_function` is separate from `initial_value`.
- [ ] `context_box` only appears in `initial_value`.
- [ ] `known_life_events` appears in `initial_value`.
- [ ] Known facts are not presented as predictions.
- [ ] No future forecast is generated in Stage 5E.
- [ ] `ai_allowed_in_stage6_forecast = true`.
- [ ] `ai_used_to_build_forecast_input = false`.

## Boundaries

- [ ] Does not call OpenAI.
- [ ] Does not call any AI provider.
- [ ] Does not modify `/api/ranking`.
- [ ] Does not modify `/api/rectification-v2`.
- [ ] Does not change selected chart.
- [ ] Does not re-score candidates.
- [ ] Does not use context_box for rectification.
- [ ] Does not create real `.env`.
- [ ] Does not include real API key.
- [ ] Does not add login/payment/database/user system.

## Testing

- [ ] Valid request builds ForecastInput.
- [ ] Missing selected_chart returns clear error.
- [ ] Missing derivative_profile returns clear error.
- [ ] Missing user_question returns clear error.
- [ ] Invalid forecast_horizon is rejected.
- [ ] Invalid forecast_domain is rejected.
- [ ] Data provenance is tested.
- [ ] Boundaries metadata is tested.
- [ ] No secrets included.
- [ ] selected_chart unchanged.
- [ ] rectification_result unchanged.
- [ ] Existing tests pass.
