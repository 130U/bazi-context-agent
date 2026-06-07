# Stage 5C Adapter Integration

## Role of Stage 5B adapter

Stage 5B defines `BaziEngineAdapter` and `BaziDerivedProfile`.
Stage 5C uses the adapter to enrich default and candidate charts.

```text
DefaultChart / CandidateChartV2
  ↓
BaziEngineAdapter
  ↓
BaziDerivedProfile
```

## Adapter fallback

If `lunar-javascript` or the chosen base adapter is available, use it.
If not, use `StaticBaziAdapter` or the Stage 5B fallback adapter.

Stage 5C must not fail the entire flow merely because enrichment is incomplete. It should return warnings.

## Required metadata

Every generated derived profile should include:

```ts
{
  source_libraries: string[];
  calculation_mode: "recorded_time" | "candidate_time" | "fixed_pillars" | "static_fallback";
  assumptions: string[];
  warnings: string[];
}
```

## Boundary

The adapter output is enrichment. In Stage 5C, it must not:

1. score candidate correctness;
2. alter `/api/ranking`;
3. use AI;
4. use context_box;
5. produce final forecast.
