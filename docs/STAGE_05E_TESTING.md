# Stage 5E Testing

## Required tests

1. Builds ForecastInput from valid request.
2. Requires selected_chart.
3. Requires derivative_profile.
4. Requires non-empty user_question.
5. Validates forecast_horizon.
6. Validates forecast_domains.
7. Separates derivative_function and initial_value.
8. Includes context_box in initial_value.
9. Includes known_life_events in initial_value.
10. Does not modify selected_chart.
11. Does not modify rectification_result.
12. Does not call AI provider.
13. Does not call ranking.
14. Does not call rectification scoring.
15. Does not include secrets.
16. Emits data_provenance.
17. Emits boundaries.
18. Emits ready-for-Stage-6 metadata.
19. Existing tests continue to pass.

## Optional endpoint tests

If `/api/forecast-input` exists:

1. POST valid request returns ForecastInput.
2. Missing selected chart returns `MISSING_SELECTED_CHART`.
3. Missing derivative profile returns `MISSING_DERIVATIVE_PROFILE`.
4. Missing user question returns `MISSING_USER_QUESTION`.
5. Response metadata has `stage = "5E"` and `ai_used = false`.

## No-AI scan

The no-AI scan should confirm that Stage 5E code does not introduce a new provider call.

OpenAI provider code from Stage 4B may exist, but Stage 5E builder must not call it.
