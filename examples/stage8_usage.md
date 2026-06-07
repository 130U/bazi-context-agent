# Stage 8 Usage Example

## Save local session

```ts
await sessionStore.save(sessionState);
```

## Hide a fact from forecast

```ts
const next = applyUserControl(sessionState, {
  control: "hide_from_forecast",
  fact_id: "family_001"
});
```

## Export session

```ts
const exported = exportSession(next, { redact: true });
```

## Clear all local data

```ts
await sessionStore.clear();
```

## Boundary

Stage 8 must not call ranking, rectification, forecast providers, OpenAI, or any database.
