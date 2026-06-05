# Stage 4B Acceptance Checklist

- [ ] Default provider is still mock.
- [ ] Real provider activates only with `PREDICTION_PROVIDER=openai`.
- [ ] `OPENAI_API_KEY` is read only from environment variables.
- [ ] Missing key with provider=openai returns `provider_config_error`.
- [ ] No real API key appears in code, docs, tests, fixtures, examples.
- [ ] No `.env` real file is created or committed.
- [ ] API key is not exposed to client-side HTML/JS.
- [ ] OpenAI provider is server-side only.
- [ ] OpenAI provider is not imported by ranking modules.
- [ ] `/api/ranking` remains deterministic.
- [ ] `/api/prediction` validates output schema.
- [ ] Tests do not make real API calls.
- [ ] npm test passes.
