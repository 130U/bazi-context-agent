# OpenAI Provider Policy Stage 4B

## Security

1. Use environment variables for keys.
2. Never commit `.env` or real keys.
3. Never expose keys in browser JavaScript.
4. Never store user private cases in fixtures.

## Structured output

The real provider must return output that validates against `configs/prediction_output_schema.v1.json`.

If schema validation fails, return a controlled error and do not modify ranking state.

## Provider isolation

The real provider belongs only to prediction. It must be impossible for ranking to import it accidentally.

Recommended structure:

```text
src/prediction/
  providers/
    mockPredictionProvider.ts
    openaiPredictionProvider.ts
  predictionProviderFactory.ts
  predictionSchemaValidation.ts
```

Ranking modules should not import from `src/prediction/providers/openaiPredictionProvider.ts`.
