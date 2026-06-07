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
