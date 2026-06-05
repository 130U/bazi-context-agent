# Stage 4B Provider Selection

## Purpose

Add a small provider selection layer for `/api/prediction`.

## Suggested modules

- `src/predictionProviderConfig.ts`
- `src/predictionProvider.ts`
- `src/openaiPredictionProvider.ts`

## Provider enum

```ts
type PredictionProviderName = "mock" | "openai" | "mock_fallback";
```

## Inputs

Read from server-side environment only:

```text
PREDICTION_PROVIDER
OPENAI_API_KEY
OPENAI_MODEL
```

## Defaults

```text
PREDICTION_PROVIDER unset -> mock
OPENAI_MODEL unset -> project default model
```

The default model should be centralized in one module or config, not duplicated across files.

## Failure handling

If `PREDICTION_PROVIDER=openai` but `OPENAI_API_KEY` is missing:

- return an explicit provider configuration error; or
- fallback to mock if `prediction_provider_policy.stage4b.json` says fallback is allowed.

Do not crash the server.

## Browser boundary

The browser must never receive `OPENAI_API_KEY`, provider secrets, or raw environment variables.
