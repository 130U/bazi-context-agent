# Stage 7 Testing

## Required tests

1. EvalCase schema loads and validates.
2. Holdout builder removes hidden target fields.
3. Leakage guard catches direct leakage.
4. Leakage guard catches post-cutoff events.
5. Mode builder creates A/B/C/D inputs.
6. Deterministic judge scores exact target matches.
7. Deterministic judge penalizes leakage.
8. Benchmark runner aggregates mode scores.
9. Pairwise win rates are computed.
10. Benchmark conclusion is `insufficient_data` for small samples.
11. Stage 7 does not modify `/api/ranking`.
12. Stage 7 does not call real AI provider by default.
13. No real API keys are present.
14. `npm test` passes.

## Test fixtures

Use fixtures in `fixtures/stage7_*`.

## No real network

Tests must not call OpenAI or any external provider.
