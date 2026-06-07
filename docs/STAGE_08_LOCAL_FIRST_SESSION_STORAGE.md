# Local-First Session Storage

## Storage modes

Stage 8 supports three storage modes:

1. `memory`
   - test-only;
   - lost on refresh/restart;
   - safest for tests.

2. `sessionStorage`
   - browser-tab scoped;
   - cleared when the page session ends;
   - useful for temporary sessions.

3. `localStorage`
   - persists across browser sessions;
   - user must explicitly opt in for persistent local saving.

## Recommended default

```text
Default = memory/session-only behavior.
Persistent localStorage = explicit user action.
```

## Session store interface

```ts
type SessionStore = {
  load(): Promise<SessionState | null>;
  save(session: SessionState): Promise<void>;
  clear(): Promise<void>;
  export(): Promise<SessionExport>;
  import(input: SessionExport): Promise<SessionState>;
};
```

## Browser storage caution

Do not store API keys, secrets, GitHub tokens, or raw `.env` content in browser storage.

## Key names

Use a namespaced key:

```text
bazi-context-agent.session.v1
```

## Data minimization

The session should store only the data needed to restore the local workflow.
Do not store server logs, request headers, IPs, analytics identifiers, or model-provider secrets.
