# Stage 5C → Stage 5D Handoff

Stage 5C should hand off the following to Stage 5D:

```ts
type ChartGenerationResult = {
  default_chart: DefaultChart;
  candidates: CandidateChartV2[];
  generation_summary: {
    candidate_count: number;
    uncertainty_level: BirthTimeCertainty;
    boundary_flags: BoundaryFlag[];
    warnings: string[];
  };
};
```

Stage 5D will add:

```ts
type RectificationResultV2 = {
  selected_chart_id: string;
  default_chart_protected: boolean;
  candidate_scores: CandidateRectificationScore[];
  evidence_table: unknown[];
  contradictions: unknown[];
  missing_information: unknown[];
  confidence: number;
  warnings: string[];
};
```

## Stage 5D scoring, not Stage 5C

Stage 5D will use:

```text
0.35 RecordedTimePrior
0.45 EventTimingFit
0.10 SymbolPriorFit
0.10 ChartProfileFit
- ContradictionPenalty
```

Stage 5C only prepares candidates and derived profiles.

## Boundary reminder

`context_box` stays out of rectification scoring. It is used later for forecast initial value.
