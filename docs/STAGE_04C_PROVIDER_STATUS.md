# Stage 4C Provider Status

## Goal

Provider status should help the user understand which prediction provider produced the output without exposing secrets.

## Allowed Display

Allowed:

- provider name: `mock`, `openai`, `mock_fallback`;
- output schema validation status;
- `ai_used_for_ranking=false`;
- `ranking_modified_by_ai=false`;
- `context_box_used_for_prediction=true`;
- `context_box_used_for_ranking=false`.

## Forbidden Display

Forbidden:

- `OPENAI_API_KEY` value;
- partial key;
- request headers;
- raw provider request;
- raw provider response if it contains hidden fields;
- process.env dump.

## Tests

Tests must verify that UI HTML, report JSON, and report Markdown do not include API key values or `OPENAI_API_KEY=` with non-empty secret-like values.
