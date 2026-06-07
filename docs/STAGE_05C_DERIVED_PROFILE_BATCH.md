# Stage 5C Derived Profile Batch

## Goal

Generate a `BaziDerivedProfile` for every chart in the bundle.

## Input

```text
DefaultChart
CandidateChartV2[]
BaziEngineAdapter
```

## Output

```text
BaziDerivedProfile[]
```

Each profile must preserve:

```text
source_chart_id
source_libraries
calculation_mode
assumptions
warnings
raw, if available
```

## Error handling

If the adapter cannot derive full fields:

1. Do not crash the whole bundle.
2. Return a minimal profile where possible.
3. Add warnings.
4. Mark missing fields as empty arrays, null, or explicit fallback values.

## Required behavior

1. Derive default chart profile.
2. Derive candidate profiles.
3. Keep profile identity stable.
4. Do not mutate input charts unexpectedly.
5. Do not call AI.
6. Do not use context_box.

## Stage 5D handoff

Stage 5D will consume these profiles for event timing scoring.
