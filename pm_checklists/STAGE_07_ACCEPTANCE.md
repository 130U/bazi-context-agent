# Stage 7 Acceptance Checklist

## Files and configs

- [ ] Stage 7 docs exist.
- [ ] Stage 7 prompts exist.
- [ ] `configs/evaluation_modes.stage7.json` exists.
- [ ] `configs/evaluation_metrics.stage7.json` exists.
- [ ] `configs/holdout_policy.stage7.json` exists.
- [ ] `configs/eval_case_schema.stage7.json` exists.
- [ ] `configs/judge_rubric.stage7.json` exists.
- [ ] `configs/leakage_guard_policy.stage7.json` exists.
- [ ] Stage 7 fixtures exist.

## Core modules

- [ ] EvalCase schema/types implemented.
- [ ] Holdout builder implemented.
- [ ] Leakage guard implemented.
- [ ] Mode builder implements A/B/C/D.
- [ ] Deterministic judge implemented.
- [ ] Pairwise comparison implemented.
- [ ] Benchmark runner implemented.
- [ ] BenchmarkResult output implemented.

## Holdout and leakage

- [ ] Hidden targets are not included in allowed inputs.
- [ ] Post-cutoff events are removed.
- [ ] Direct leakage is detected.
- [ ] Temporal leakage is detected.
- [ ] Leakage penalties are applied.
- [ ] Invalid cases are marked.

## Modes

- [ ] Mode A excludes context_box.
- [ ] Mode B excludes derivative_profile.
- [ ] Mode C uses default chart + initial value.
- [ ] Mode D uses selected chart + initial value.
- [ ] All modes carry metadata.
- [ ] All modes are checked by leakage guard.

## Metrics

- [ ] Domain accuracy exists.
- [ ] Time window overlap exists.
- [ ] Directional correctness exists.
- [ ] Evidence separation exists.
- [ ] Leakage penalty exists.
- [ ] Pairwise win rate exists.
- [ ] Underpowered benchmarks output `insufficient_data`.

## Boundaries

- [ ] `/api/ranking` not modified.
- [ ] `/api/rectification-v2` not modified.
- [ ] `/api/forecast-input` not modified.
- [ ] selected chart not modified.
- [ ] BaziDerivedProfile not modified.
- [ ] No real OpenAI network calls in tests.
- [ ] No real `.env`.
- [ ] No real API keys.
- [ ] No login/payment/database/user system.

## Tests

- [ ] `npm test` passes.
- [ ] Tests cover holdout builder.
- [ ] Tests cover leakage guard.
- [ ] Tests cover A/B/C/D modes.
- [ ] Tests cover deterministic judge.
- [ ] Tests cover benchmark runner.
