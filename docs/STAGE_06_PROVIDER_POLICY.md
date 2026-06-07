# Stage 6 Provider Policy

## Reuse Stage 4B provider boundary

Stage 6 must reuse the provider boundary introduced in Stage 4B.

```text
default provider = mock
openai provider only when explicitly enabled
API key only from process.env.OPENAI_API_KEY
no API key in browser
no API key in repo
tests must not make real network calls
```

## Provider options

```text
mock:
  always available; deterministic; used in tests.

openai:
  optional; server-side only; enabled by environment policy.
```

## Provider must not affect deterministic layers

The provider must not call or mutate:

```text
/api/ranking
/api/rectification-v2
/api/default-chart
/api/candidate-charts-v2
/api/forecast-input
```

## Failure behavior

If openai provider is requested but not configured:

```text
return explicit configuration error
or use project-approved mock_fallback
```

Do not crash the server.
Do not silently use a fake real forecast without policy metadata.
