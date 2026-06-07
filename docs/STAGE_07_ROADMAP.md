# Stage 7 Roadmap: Evaluation / Holdout Benchmark

## Product thesis being tested

The product claim is:

```text
Full system = derivative function + initial value
should outperform:
A. derivative function only
B. initial value only
C. default/unrectified baseline
```

Where:

```text
derivative function = BaziDerivedProfile
initial value = questionnaire-derived context_box + known_life_events + current state
```

## Stage 7 objective

Build an offline benchmark framework that evaluates whether the full system actually improves prediction quality.

Stage 7 is not a new prediction model. It is an evaluation harness.

## Stage 7 pipeline

```text
EvalCase
  ↓
create holdout snapshot at cutoff date
  ↓
redact hidden target fields
  ↓
build mode-specific ForecastInput variants
  ↓
run forecast provider or use fixture outputs
  ↓
validate FutureForecastResult schema
  ↓
score outputs
  ↓
compare modes A/B/C/D
  ↓
produce BenchmarkResult
```

## Modes

```text
Mode A: derivative_only
Mode B: initial_value_only
Mode C: default_chart_plus_initial_value
Mode D: selected_chart_plus_initial_value_full_system
```

Optional later:

```text
Mode E: generic_llm_baseline
Mode F: human_written_baseline
```

## Stage 7 outputs

- EvalCase schema
- Holdout policy
- Leakage guard
- Benchmark runner
- Mode runner
- Judge/scoring rubric
- BenchmarkResult schema
- Fixtures and tests

## Non-goal

Do not claim real-world predictive superiority until there are enough holdout cases.
