# Stage 4C Report Schema

## Report Object

The report builder should return a serializable object:

```ts
type PredictionReport = {
  report_id: string;
  generated_at: string;
  version: string;
  ranking_snapshot_summary: RankingSnapshotSummary;
  selected_candidate_summary: SelectedCandidateSummary;
  context_box_summary: ContextBoxSummary;
  prediction_result: PredictionResult;
  policy: ReportPolicy;
  privacy_notice: string[];
  export_metadata: ExportMetadata;
};
```

## Required Fields

- `report_id`: deterministic-enough generated identifier or timestamp-based ID;
- `generated_at`: ISO timestamp;
- `version`: report schema version;
- `ranking_snapshot_summary`: summary of Top 3 / selected candidate;
- `selected_candidate_summary`: selected candidate id and confidence if available;
- `context_box_summary`: normalized user-provided context facts;
- `prediction_result`: Stage 4 prediction result;
- `policy`: boundary and provider metadata;
- `privacy_notice`: user-facing privacy warnings;
- `export_metadata`: format, created_at, redaction status.

## Forbidden Fields

Report output must not include:

- API keys;
- `OPENAI_API_KEY` values;
- raw provider request;
- raw provider response;
- raw process.env dump;
- hidden debug fields;
- server-only secrets.

## Policy Fields

The report policy should include:

- `ai_used_for_ranking: false`;
- `ranking_modified_by_ai: false`;
- `context_box_used_for_ranking: false`;
- `context_box_used_for_prediction: true`;
- `provider`;
- `api_key_exported: false`.
