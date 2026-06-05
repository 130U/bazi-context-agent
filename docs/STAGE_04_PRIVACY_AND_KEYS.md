# Stage 04 Privacy and API Key Rules

## API key rules

- Use `OPENAI_API_KEY` environment variable.
- Do not commit real keys.
- Do not create `.env` with real values.
- Do not expose keys to client-side code.
- `examples/.env.stage4.example` may contain placeholders only.

## User data rules

- Do not commit real user context boxes.
- Do not commit private BaZi cases.
- Fixtures must be synthetic.
- Prediction reports should distinguish known facts from predictions.

## Context-box rule

Context box can be used by `/api/prediction`, not `/api/ranking`.
