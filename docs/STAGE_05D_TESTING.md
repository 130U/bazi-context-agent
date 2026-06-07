# Stage 5D Testing

## Required tests

1. Loads rectification weights from config.
2. Scores DefaultChart and CandidateChartV2[].
3. Always includes DefaultChart in scoring result.
4. Computes component scores:
   - recorded_time_prior
   - event_timing_fit
   - symbol_prior_fit
   - chart_profile_fit
   - contradiction_penalty
5. Outputs RectificationResultV2.
6. Outputs evidence table.
7. Outputs default chart protection result.
8. If event_count < 3, DefaultChart is protected.
9. If alternative lead <= 0.05, DefaultChart is selected.
10. If alternative lead > 0.15 and enough events support it, alternative may be selected.
11. context_box does not affect rectification result.
12. AI/provider does not appear in rectification path.
13. `/api/ranking` remains unchanged.
14. `/api/prediction` remains unchanged.
15. No real `.env`.
16. No real API key.
17. No React/Next/Vite/Vue/Svelte.
18. No login/payment/database/user system.

## Suggested test files

```text
tests/rectificationV2.test.ts
tests/rectificationDefaultProtection.test.ts
tests/rectificationApi.test.ts
tests/noAiBoundary.test.ts
```

## Golden fixtures

Use:

```text
fixtures/stage5d_rectification_input.json
fixtures/stage5d_rectification_result.json
fixtures/stage5d_event_cases.json
fixtures/stage5d_default_protection_cases.json
```

## Important boundary tests

### Context does not affect rectification

Run the same request twice:

```text
Same default_chart
Same candidates
Same life_events
Different context_box
```

Expected:

```text
selected_chart_id unchanged
scores unchanged
evidence table unchanged
metadata.context_box_used_for_rectification = false
```

### AI does not affect rectification

Scan `src` path for provider usage in rectification files.

Allowed:

```text
mock prediction provider in Stage 4 prediction path
OpenAI provider in Stage 4B prediction path
```

Forbidden:

```text
rectification module importing provider
rectification endpoint reading OPENAI_API_KEY
rectification endpoint calling /api/prediction
```
