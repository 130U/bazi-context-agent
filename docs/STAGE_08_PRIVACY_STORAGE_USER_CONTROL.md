# Stage 8: Privacy / Storage / User Control

## Why Stage 8 exists

This project asks users for information that can be sensitive:

- birth data;
- family background;
- education and career history;
- relationship years;
- health / accident years;
- preferences and anxieties;
- generated forecasts.

Therefore, Stage 8 introduces user-facing control and a strict storage boundary.

## Product rule

```text
Stage 8 is local-first.
No user account.
No database.
No cloud sync.
No telemetry.
No hidden upload of user data.
```

## User controls

The user must be able to:

1. Save current session locally.
2. Restore current session locally.
3. Export session JSON.
4. Import session JSON.
5. Hide a context fact from forecast.
6. Hide a context fact from export.
7. Delete a context fact completely.
8. Clear all local data.
9. See a privacy notice.
10. See which data is used for forecast.

## Core distinction

```text
hide_from_forecast:
  keep the fact locally, but exclude it from ForecastInput.

hide_from_export:
  keep the fact locally, but redact it from export/report.

delete:
  remove the fact value from session state.
```

## Stage 8 safety boundary

Stage 8 may read generated objects for storage/export, but it must not modify their semantics:

- DefaultChart;
- CandidateChartV2;
- RectificationResultV2;
- BaziDerivedProfile;
- ForecastInput;
- FutureForecastResult.
