# Stage 5C Acceptance Checklist

## DefaultChart

- [ ] `RecordedBirthTime` type exists or is reused from Stage 5B.
- [ ] `DefaultChart` type exists.
- [ ] Exact recorded birth time can generate DefaultChart.
- [ ] DefaultChart includes `chart_id`.
- [ ] DefaultChart includes `chart_role="default"`.
- [ ] DefaultChart includes `recorded_time_prior_score`.
- [ ] DefaultChart can include `BaziDerivedProfile`.
- [ ] Adapter failure creates warnings and does not fatal.

## CandidateChartV2

- [ ] `CandidateChartV2` type exists.
- [ ] `ChartGenerationPolicy` exists.
- [ ] `ChartGenerationResult` exists.
- [ ] `within_1_hour` generates adjacent-hour candidates.
- [ ] `time_range` generates candidates across the range.
- [ ] `part_of_day` generates corresponding hour candidates.
- [ ] `unknown_time` generates full-day hour candidates or policy-capped candidates.
- [ ] `near_zi_hour` expands 子时 boundary candidates.
- [ ] `near_hour_boundary` adds adjacent candidates.
- [ ] `near_solar_term` returns warning/stub.
- [ ] Candidate records include `generation_reasons`.
- [ ] Candidate records include `warnings` when applicable.

## Adapter integration

- [ ] Stage 5B adapter is called or cleanly stubbed.
- [ ] Every derived profile includes source library metadata.
- [ ] Fallback adapter does not block chart generation.

## Boundaries

- [ ] Stage 5C does not implement Rectification v2 scoring.
- [ ] Stage 5C does not implement forecast.
- [ ] Stage 5C does not use AI.
- [ ] Stage 5C does not use context_box for chart generation.
- [ ] Stage 5C does not modify `/api/ranking` scoring.
- [ ] Stage 4 prediction/report tests still pass.
- [ ] No real `.env` file.
- [ ] No real API key.
- [ ] No login/payment/database/user system.

## Tests

- [ ] Tests cover DefaultChart generation.
- [ ] Tests cover candidate generation by certainty.
- [ ] Tests cover boundary expansion.
- [ ] Tests cover adapter failure handling.
- [ ] Tests cover no context_box usage.
- [ ] Tests cover no AI usage.
- [ ] `npm test` passes.
