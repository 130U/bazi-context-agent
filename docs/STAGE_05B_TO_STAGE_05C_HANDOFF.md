# Stage 5B to Stage 5C Handoff

## What Stage 5B delivers

```text
BaziEngineAdapter
BaziDerivedProfile
StaticBaziAdapter
optional LunarJavascriptAdapter
profile schema
adapter tests
```

## What Stage 5C should consume

Stage 5C should consume:

```text
RecordedBirthTime
CandidateChartV2
BaziEngineAdapter
BaziDerivedProfile
```

## Stage 5C objective

Stage 5C should build:

```text
DefaultChart from recorded birth time
CandidateChartV2[] only when time is uncertain
Derived profiles for every chart
```

Stage 5C should still not do final future forecast. That belongs to Stage 6.
