# Stage 4B Security and API Keys

## Rules

- Do not commit real API keys.
- Do not commit real `.env`.
- Do not place API keys in browser code.
- Do not print API keys in logs.
- Do not expose environment variables in API responses.
- Tests must not require or use real `OPENAI_API_KEY`.

## Allowed example file

Use example files with empty placeholders only:

```text
PREDICTION_PROVIDER=mock
OPENAI_API_KEY=
OPENAI_MODEL=
```

## `.gitignore` reminder

Real env files should remain ignored:

```gitignore
.env
.env.*
```

Example files may be allow-listed if necessary.

## Production note

Stage 4B is not a production deployment. It only creates a safe provider boundary and testable environment flag.
