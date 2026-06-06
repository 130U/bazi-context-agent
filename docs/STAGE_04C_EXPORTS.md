# Stage 4C Exports

## Export Formats

Stage 4C supports:

- JSON export;
- Markdown export.

## JSON Export

JSON export should be a serialized `PredictionReport` object.

It must be parseable and must not include secrets.

## Markdown Export

Markdown export should include:

1. Title;
2. Generated timestamp;
3. Ranking summary;
4. Context box summary;
5. Prediction conclusion;
6. Known facts;
7. Chart signals;
8. Context adjustments;
9. Prediction answer;
10. Confidence;
11. Uncertainty;
12. Next questions;
13. Policy and privacy notes.

## Download Implementation

Either server-side text response or client-side Blob/object URL download is acceptable.

Do not introduce database persistence for Stage 4C.

## Redaction

Export functions must remove:

- API keys;
- raw provider payloads;
- raw environment variables;
- implementation debug dumps.
