# Stage 8 Acceptance Checklist

## Session / Storage

- [ ] SessionState type exists.
- [ ] MemorySessionStore or equivalent test store exists.
- [ ] Browser local/session storage wrapper or equivalent exists.
- [ ] save/load/clear works.
- [ ] Default is local-first.
- [ ] Persistent storage requires explicit user action.
- [ ] No database.
- [ ] No cloud sync.
- [ ] No user account system.

## User Controls

- [ ] hide_from_forecast exists.
- [ ] hide_from_export exists.
- [ ] delete_fact exists.
- [ ] clear_all_local_data exists.
- [ ] export_session exists.
- [ ] import_session exists.
- [ ] hide_from_forecast excludes fact from ForecastInput.
- [ ] hide_from_export redacts fact from export/report.
- [ ] delete_fact removes value.
- [ ] clear_all removes stored session.

## Export / Import / Redaction

- [ ] JSON export has schema_version/exported_at/redaction_metadata.
- [ ] Export does not include API keys.
- [ ] Export does not include .env content.
- [ ] Export redacts hidden-from-export values.
- [ ] Import validates schema.
- [ ] Import rejects malformed JSON.
- [ ] Import rejects secrets.
- [ ] Invalid import does not overwrite current session.
- [ ] Redaction handles API-key-like strings.
- [ ] Redaction handles local path-like strings.

## UI

- [ ] UI has Save Session.
- [ ] UI has Load Session.
- [ ] UI has Export JSON.
- [ ] UI has Import JSON.
- [ ] UI has Clear All Local Data.
- [ ] UI has fact-level hide/delete controls or equivalent.
- [ ] UI has privacy notice.
- [ ] UI has boundary copy.

## Boundary

- [ ] /api/ranking semantics unchanged.
- [ ] /api/rectification-v2 semantics unchanged.
- [ ] /api/forecast-input semantics unchanged.
- [ ] /api/future-forecast semantics unchanged.
- [ ] No selected_chart changes.
- [ ] No BaziDerivedProfile changes.
- [ ] No RectificationResultV2 changes.
- [ ] No ForecastInput semantic changes.
- [ ] No FutureForecastResult semantic changes.
- [ ] No new AI provider.
- [ ] No real .env.
- [ ] No real API key.
- [ ] No login/payment/database/cloud sync/user system.

## Tests

- [ ] npm test passes.
- [ ] Storage tests exist.
- [ ] User control tests exist.
- [ ] Export/import tests exist.
- [ ] Redaction tests exist.
- [ ] Boundary tests exist.
