# Stage 7 Holdout Benchmark

## Holdout case structure

An eval case must include:

```text
1. Public input snapshot
2. Hidden target
3. Cutoff date
4. Forecast horizon
5. Permitted facts
6. Redacted facts
7. Ground truth outcome
```

## Cutoff date

The cutoff date simulates what the system would have known at that time.

Example:

```text
cutoff_date = 2020-06-01
forecast_horizon = 3_years
hidden_truth = career transition in 2021 and overseas move in 2022
```

The model input must not include post-2020 outcomes.

## Holdout domain

Each eval case can hide one or more domains:

- education
- career
- wealth
- relationship
- migration
- health
- family
- personality

## Leakage prevention

The holdout builder must remove or mask:

- direct target facts
- synonymous target facts
- post-cutoff events
- answer-containing context facts
- raw notes that contain labels

## Outcome labels

Each target should include structured labels where possible:

```json
{
  "domain": "career",
  "outcome_type": "career_transition",
  "occurred": true,
  "year": 2021,
  "severity": "major",
  "confidence": 0.95
}
```

## Minimum case quality

An eval case is not valid unless it contains:

- cutoff date
- hidden target
- allowed input snapshot
- ground truth answer
- leakage exclusions
