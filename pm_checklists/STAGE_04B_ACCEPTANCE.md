# Stage 4B Acceptance Checklist

## Provider selection

- [ ] Default provider is mock.
- [ ] `PREDICTION_PROVIDER=mock` uses mock provider.
- [ ] `PREDICTION_PROVIDER=openai` routes to OpenAI provider only when allowed.
- [ ] Missing `OPENAI_API_KEY` is handled safely.
- [ ] `OPENAI_MODEL` is read from centralized server-side config.
- [ ] Provider selection only affects `/api/prediction`.
- [ ] Provider selection does not affect `/api/ranking`.

## OpenAI provider

- [ ] OpenAI provider module exists.
- [ ] OpenAI provider is not imported by ranking modules.
- [ ] OpenAI provider does not mutate ranking snapshot.
- [ ] OpenAI provider does not mutate candidate ids.
- [ ] OpenAI provider does not mutate scores.
- [ ] OpenAI provider does not mutate confidence.
- [ ] Tests use fake client and make no real network calls.

## Schema validation

- [ ] Mock provider output is schema validated.
- [ ] OpenAI provider output is schema validated.
- [ ] Valid fake OpenAI output passes.
- [ ] Invalid fake OpenAI output fails.
- [ ] PredictionResult contains all required fields.
- [ ] Policy contains `provider`.
- [ ] Policy contains `ai_used_for_ranking: false`.
- [ ] Policy contains `ranking_modified_by_ai: false`.
- [ ] Policy contains schema validation status.

## Security

- [ ] No real `.env` file is committed.
- [ ] No real API key is committed.
- [ ] API key is not exposed in browser HTML/JS.
- [ ] `examples/stage4b.env.example` contains empty placeholders only.
- [ ] Tests do not require real `OPENAI_API_KEY`.

## Ranking boundary

- [ ] `/api/ranking` remains deterministic.
- [ ] `/api/ranking` does not use context_box.
- [ ] `/api/ranking` does not use prediction provider.
- [ ] `/api/ranking` does not import OpenAI provider.
- [ ] `/api/ranking` does not read `OPENAI_API_KEY`.

## Scope

- [ ] No login.
- [ ] No payment.
- [ ] No database.
- [ ] No user system.
- [ ] No Zi Wei Dou Shu.
- [ ] No Qi Men.
- [ ] No Feng Shui.
- [ ] No full real BaZi calendar engine.
- [ ] No React / Next / Vite / Vue / Svelte.
- [ ] `npm test` passes.
