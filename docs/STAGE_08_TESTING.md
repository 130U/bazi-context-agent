# Stage 8 Testing

## Required tests

1. Session schema validates fixtures.
2. Local/memory storage save/load/clear works.
3. Export JSON redacts hidden facts.
4. Export JSON does not include API keys or `.env` content.
5. Import rejects malformed JSON.
6. Import rejects unsupported schema version with clear error.
7. Delete fact removes value.
8. Hide-from-forecast excludes fact from ForecastInput.
9. Hide-from-export redacts fact from export.
10. Clear all removes stored session.
11. Privacy notice is present in UI or generated copy.
12. Stage 8 does not modify ranking / rectification / forecast semantics.
13. Stage 8 does not introduce login, payment, database, user system.

## Test mode

Use memory storage in tests.
Do not depend on real browser localStorage unless current project already has a browser test harness.

## No real secrets

Tests may include fake strings like:

```text
sk-test-redacted-placeholder
```

but must not include any real API key.
