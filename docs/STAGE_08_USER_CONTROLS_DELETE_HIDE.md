# User Controls: Delete / Hide / Clear

## Required controls

### Hide from forecast

The fact remains in local session, but must be excluded from:

- ForecastInput builder;
- future forecast provider input;
- forecast prompt builder.

### Hide from export

The fact remains in local session, but must be redacted from:

- session JSON export;
- report JSON export;
- report Markdown export.

### Delete fact

The fact value must be removed from session state.

Allowed deleted representation:

```json
{
  "fact_id": "family_001",
  "deleted_at": "2026-06-07T00:00:00.000Z",
  "value": null
}
```

Do not keep old value in audit metadata.

### Clear all local data

Clear:

- local/session storage key;
- in-memory session state;
- UI preview state.

## Tests

Tests must prove:

1. Hidden-from-forecast facts are excluded from ForecastInput.
2. Hidden-from-export facts are redacted from export.
3. Deleted facts do not retain values.
4. Clear all removes the stored session.
