# Stage 5C API Contract

Stage 5C may expose new endpoints or internal handlers. Keep them separate from existing Stage 4 APIs.

## POST /api/default-chart

Input:

```ts
{
  recorded_birth_time: RecordedBirthTime;
}
```

Output:

```ts
{
  default_chart: DefaultChart;
  metadata: {
    ai_used: false;
    context_box_used: false;
    stage: "5C";
  }
}
```

## POST /api/candidate-charts-v2

Input:

```ts
{
  recorded_birth_time: RecordedBirthTime;
  symbol_prior?: HourGroupPrior;
  generation_policy?: ChartGenerationPolicy;
}
```

Output:

```ts
{
  default_chart: DefaultChart;
  candidates: CandidateChartV2[];
  generation_summary: {
    candidate_count: number;
    uncertainty_level: BirthTimeCertainty;
    boundary_flags: BoundaryFlag[];
    warnings: string[];
  };
  metadata: {
    ai_used: false;
    context_box_used: false;
    ranking_performed: false;
    stage: "5C";
  }
}
```

## Forbidden behavior

- Do not call `/api/ranking` from these handlers.
- Do not call `/api/prediction`.
- Do not call OpenAI provider.
- Do not read `contextBox`.
- Do not modify candidate scores from Stage 2/3.

## UI note

Stage 5C does not require UI changes. If UI changes are made, they must be minimal and only expose default/candidate chart preview.
