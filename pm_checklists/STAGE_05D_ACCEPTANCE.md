# Stage 5D Acceptance Checklist

## Rectification modules

- [ ] Rectification v2 module exists.
- [ ] EventTimingFit module exists.
- [ ] DefaultChart protection module exists.
- [ ] Evidence model exists.
- [ ] Rectification config reader exists.

## Scoring

- [ ] Loads `configs/rectification_weights.stage5d.json`.
- [ ] Uses recorded_time_prior.
- [ ] Uses event_timing_fit.
- [ ] Uses symbol_prior_fit.
- [ ] Uses chart_profile_fit.
- [ ] Uses contradiction_penalty.
- [ ] Outputs total_score.
- [ ] Outputs confidence.
- [ ] Outputs evidence table.
- [ ] Outputs missing_information.
- [ ] Outputs warnings.

## DefaultChart protection

- [ ] DefaultChart is always scored.
- [ ] Fewer than 3 major events prevents override.
- [ ] Lead <= 0.05 protects DefaultChart.
- [ ] Lead 0.05–0.15 returns default_protected_uncertain.
- [ ] Lead > 0.15 with enough evidence allows candidate_preferred.
- [ ] DefaultChartProtectionResult is output.

## Boundaries

- [ ] context_box is not used for rectification.
- [ ] Different context_box input does not change RectificationResultV2.
- [ ] AI is not used for rectification.
- [ ] OpenAI provider is not imported/called in rectification path.
- [ ] `/api/ranking` behavior is unchanged.
- [ ] `/api/prediction` behavior is unchanged.
- [ ] No real `.env`.
- [ ] No real API key.
- [ ] No login/payment/database/user system.
- [ ] No Zi Wei / Qi Men / Feng Shui.
- [ ] No Stage 6 forecast.

## Tests

- [ ] Rectification weights test.
- [ ] EventTimingFit output fields test.
- [ ] Default protection threshold tests.
- [ ] Context non-leakage test.
- [ ] AI boundary test.
- [ ] npm test passes.
