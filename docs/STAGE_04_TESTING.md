# Stage 04 Testing

## Stage 4A tests

- Domain classifier maps common Chinese questions to correct domains.
- Mock provider output validates against PredictionResult structure.
- `/api/prediction` rejects missing rankingSnapshot.
- `/api/prediction` does not mutate rankingSnapshot.
- Context box may change prediction result.
- Context box must not change ranking result.
- Provider is `mock`.
- `ai_used_for_ranking` is false.
- `ranking_modified_by_ai` is false.

## Stage 4B tests

- Default provider is mock.
- OpenAI provider requires env flag and key.
- Missing key returns provider_config_error.
- No real API call in tests.
- API key is not exposed to browser.
- OpenAI provider is not imported by ranking modules.
- Schema validation rejects invalid outputs.

## Stage 4C tests

- UI renders PredictionResult sections.
- Report preview contains ranking/context/prediction/policy.
- Export JSON or Markdown works.
- Ranking remains stable before/after prediction.
