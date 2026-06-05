# Stage 4B Testing

## Required tests

Stage 4B must include tests for:

1. default provider is mock;
2. `PREDICTION_PROVIDER=mock` uses mock;
3. `PREDICTION_PROVIDER=openai` routes to OpenAI provider only when key is present;
4. missing `OPENAI_API_KEY` is handled safely;
5. fake OpenAI client can produce valid `PredictionResult`;
6. invalid fake OpenAI output is rejected by schema validation;
7. `/api/prediction` does not modify `rankingSnapshot`;
8. `/api/ranking` does not import or call OpenAI provider;
9. no real OpenAI network call is made in tests;
10. no real `.env` or API key is present in repo;
11. no `langchain`, `llamaindex`, or `@ai-sdk` dependency;
12. all existing tests still pass.

## Test command

```powershell
$env:Path='C:\Program Files\nodejs;' + $env:Path; npm.cmd test
```

or:

```bash
npm test
```
