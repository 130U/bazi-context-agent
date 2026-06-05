# OpenAI Provider Policy Stage 4B

## Provider policy

Stage 4B introduces a real provider boundary, not a new decision engine.

## Provider selection

| Environment | Provider |
|---|---|
| `PREDICTION_PROVIDER` unset | `mock` |
| `PREDICTION_PROVIDER=mock` | `mock` |
| `PREDICTION_PROVIDER=openai` + `OPENAI_API_KEY` present | `openai` |
| `PREDICTION_PROVIDER=openai` + missing `OPENAI_API_KEY` | explicit configuration error OR safe mock fallback, as defined in config |

The implementation must make this behavior explicit and test it.

## Security

- Read `OPENAI_API_KEY` only on the server.
- Never expose key to browser-side JavaScript.
- Never commit a real `.env`.
- Never commit a real API key.
- Example env files may include empty placeholders only.

## Ranking boundary

OpenAI provider is forbidden before candidate ranking is complete.

Forbidden:

```text
birth input -> AI
symbol scoring -> AI
candidate generation -> AI
event backtest scoring -> AI
candidate ranking -> AI
```

Allowed:

```text
completed ranking snapshot + context_box + user question -> /api/prediction -> provider
```
