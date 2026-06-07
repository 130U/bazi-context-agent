# Session Export / Import

## Export goals

Users should be able to export their local session to JSON.

Export must include:

- schema_version;
- exported_at;
- session_id;
- birth/session state;
- context facts after redaction rules;
- forecast input/result after redaction;
- privacy metadata;
- redaction summary.

Export must not include:

- API keys;
- `.env` content;
- browser secrets;
- GitHub tokens;
- server filesystem paths;
- hidden-from-export fact values.

## Import goals

Users should be able to import a previously exported Stage 8 session JSON.

Import must validate:

- schema_version;
- required fields;
- no secrets;
- no unsupported version without warning;
- malformed JSON rejected.

## Import behavior

On valid import:

```text
replace current session only after validation passes.
```

On invalid import:

```text
return error and keep current session unchanged.
```

## API or client-only

Stage 8 may implement export/import client-side or through local server endpoints.
Either approach must preserve local-first behavior.
