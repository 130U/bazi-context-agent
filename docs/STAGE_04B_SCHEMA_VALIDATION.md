# Stage 4B Schema Validation

## Purpose

Both mock and OpenAI provider outputs must be validated before returning from `/api/prediction`.

## Required output fields

A valid `PredictionResult` must include:

- `domain`
- `conclusion`
- `known_facts`
- `chart_signals`
- `context_adjustments`
- `prediction`
- `confidence`
- `uncertainty`
- `next_questions`
- `policy`

## Policy fields

`policy` must include:

- `provider`
- `ai_used_for_ranking: false`
- `ranking_modified_by_ai: false`
- `output_schema_validated: true`

## Validation behavior

If provider output is invalid:

- reject it;
- return a clear error;
- do not silently accept missing fields;
- do not mutate ranking snapshot to make output pass.

## Implementation option

A lightweight hand-written validator is acceptable for Stage 4B. Do not add a schema package unless needed.

If the OpenAI SDK supports structured outputs in the current environment, use JSON Schema based structured output where practical. If not, validate the returned JSON manually.
