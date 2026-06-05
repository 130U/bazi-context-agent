# Stage 4B Real Provider

Stage 4B adds a real OpenAI provider behind an explicit environment flag.

## Provider rules

- Default provider is `mock`.
- Real provider is active only when `PREDICTION_PROVIDER=openai`.
- API key is read only from `process.env.OPENAI_API_KEY`.
- Model is read from `process.env.OPENAI_MODEL`.
- No API key may be committed.
- No API key may enter client-side HTML/JS.
- Real provider is server-side only.

## Failure behavior

If `PREDICTION_PROVIDER=openai` but `OPENAI_API_KEY` is missing:

```json
{
  "error": "provider_config_error",
  "message": "OPENAI_API_KEY is required when PREDICTION_PROVIDER=openai"
}
```

Do not silently call mock in this explicit configuration.

## Ranking protection

OpenAI provider must not be imported by:

- `ranking.ts`
- candidate generation modules
- symbol scoring modules
- event backtest modules
- `/api/ranking` handler
