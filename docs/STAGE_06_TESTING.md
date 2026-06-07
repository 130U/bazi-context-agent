# Stage 6 Testing

## Required tests

```text
1. ForecastInput fixture loads.
2. mock future forecast provider returns full schema.
3. /api/future-forecast rejects missing ForecastInput.
4. /api/future-forecast does not call ranking.
5. /api/future-forecast does not call rectification.
6. forecast output validates against schema.
7. known facts are separate from predictions.
8. derivative signals are separate from initial value adjustments.
9. policy fields are correct.
10. no secrets in result.
11. default provider is safe in tests.
12. no real network calls in tests.
13. existing Stage 0–5 tests still pass.
```

## Snapshot tests

Use fixtures:

```text
fixtures/stage6_forecast_input.json
fixtures/stage6_future_forecast_result.mock.json
fixtures/stage6_prompt_builder_snapshot.md
```

## Boundary tests

Changing forecast options may change forecast wording, but must not change:

```text
selected chart
rectification result
ranking scores
BaziDerivedProfile
```
