# Stage 5D API Contract

Stage 5D may add a local API endpoint if useful.

## Optional endpoint

```text
POST /api/rectification-v2
```

## Request

```ts
type RectificationV2Request = {
  default_chart: DefaultChart;
  candidates: CandidateChartV2[];
  life_events: LifeEvent[];
  symbol_prior?: HourGroupPrior;
  options?: {
    include_evidence_table?: boolean;
    include_alternatives?: boolean;
  };
  // context_box may be present in UI session, but must be ignored.
  context_box?: unknown;
};
```

## Response

```ts
type RectificationV2Response = {
  result: RectificationResultV2;
  metadata: {
    stage: "5D";
    ai_used: false;
    context_box_used_for_rectification: false;
    ranking_modified_by_ai: false;
  };
};
```

## Required behavior

1. Must not call `/api/prediction`.
2. Must not call OpenAI provider.
3. Must not read `OPENAI_API_KEY`.
4. Must not use `context_box`.
5. Must not modify Stage 4 prediction.
6. Must not modify Stage 3/4 `/api/ranking` behavior.
7. Must return a clear error if default_chart is missing.
8. Must return warning, not crash, if BaziDerivedProfile lacks enrichment fields.

## No context leakage

Even if request includes:

```json
{
  "context_box": [
    { "field": "parent_occupation", "value": "doctor" }
  ]
}
```

the result metadata must include:

```json
{
  "context_box_used_for_rectification": false
}
```

and candidate scores must not change.
