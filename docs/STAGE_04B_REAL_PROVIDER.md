# Stage 4B Real Provider

## Goal

Stage 4B adds a real OpenAI prediction provider behind a strict environment flag.

The system must still default to the mock provider. The real OpenAI provider may only be used after deterministic ranking is complete and only inside `/api/prediction`.

## Required behavior

- Default provider: `mock`
- Real provider flag: `PREDICTION_PROVIDER=openai`
- API key source: server-side `process.env.OPENAI_API_KEY`
- Optional model env: `OPENAI_MODEL`
- No real `.env` file may be committed.
- No API key may be written into source, tests, docs, examples, or browser code.
- Tests must not make real network calls.

## Allowed path

```text
/api/prediction
  -> provider selection
  -> mock provider OR OpenAI provider
  -> schema validation
  -> PredictionResult
```

## Forbidden path

```text
/api/ranking
  -> OpenAI provider
```

This must never happen.

## OpenAI provider output

The OpenAI provider must return the same `PredictionResult` shape as the mock provider. It must not modify:

- `rankingSnapshot`
- candidate ids
- ranking scores
- confidence
- evidence table
- contradictions
- missing_information

The provider may use:

- user question
- ranking snapshot as read-only evidence
- context box
- life events
