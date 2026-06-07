# Stage 8 API Contract

Stage 8 may implement API endpoints or pure client-side functions. If endpoints are added, use these contracts.

## POST /api/session/export

Input:

```ts
SessionState
```

Output:

```ts
SessionExport
```

Must apply redaction.

## POST /api/session/import

Input:

```ts
SessionExport
```

Output:

```ts
{ ok: boolean; session?: SessionState; error?: string }
```

Must validate before replacing current state.

## POST /api/session/redact

Input:

```ts
{ session: SessionState; policy?: RedactionPolicy }
```

Output:

```ts
{ redacted_session: SessionState; metadata: RedactionMetadata }
```

## Boundary

No Stage 8 endpoint may:

- call rankCandidates;
- call rectification-v2 scoring;
- call forecast provider;
- call OpenAI;
- read OPENAI_API_KEY;
- persist server-side data to database.
