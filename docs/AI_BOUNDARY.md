# AI Boundary / AI 使用边界

## Allowed

- Forecast generation after `ForecastInput` is built.
- Explanation and report writing after chart selection.
- Optional provider behind environment flag.

## Forbidden

- AI-assisted chart ranking.
- AI-assisted rectification scoring.
- AI mutation of selected chart, candidate scores, BaziDerivedProfile, or ForecastInput.
- Exposing API keys to browser code.
- Committing real API keys or `.env` files.

## Providers

The public app calls no model. The local research API defaults to a mock provider; a real provider needs the
server-side `PREDICTION_PROVIDER=openai` flag and `OPENAI_API_KEY`, and its output is schema-validated under a
20-second timeout and a 1 MB response limit. Reports built from it are redacted before export.
