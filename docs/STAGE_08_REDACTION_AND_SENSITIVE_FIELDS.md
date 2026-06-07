# Redaction and Sensitive Fields

## Sensitive field categories

Stage 8 treats the following as sensitive:

- API keys;
- `.env` content;
- GitHub tokens;
- provider secrets;
- raw health details;
- raw relationship details;
- exact addresses;
- full names;
- phone numbers;
- emails;
- unredacted private context facts hidden by user.

## Redaction output

Use explicit placeholders:

```text
[REDACTED:api_key]
[REDACTED:hidden_context_fact]
[REDACTED:private_health_detail]
```

## Redaction metadata

Every export should include:

```json
{
  "redaction_applied": true,
  "redacted_fields_count": 3,
  "redaction_policy_version": "stage8.redaction.v1"
}
```

## Required tests

1. API key-like strings are redacted.
2. Hidden-from-export facts are redacted.
3. Deleted facts are not exported.
4. `.env` content is not exported.
5. Export metadata says secrets_included = false.
