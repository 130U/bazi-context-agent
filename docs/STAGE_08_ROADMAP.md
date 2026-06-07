# Stage 8 Roadmap: Privacy / Storage / User Control

## Position

Stage 8 comes after:

- Stage 5E: ForecastInput Builder
- Stage 6: Future Forecast Engine
- Stage 7: Evaluation / Holdout Benchmark

Stage 8 exists to make the product safer and user-controllable before public release.

## Stage 8 Objective

Build a local-first privacy and user-control layer for a product that collects sensitive information:

- birth input;
- questionnaire answers;
- context box facts;
- known life events;
- derived BaZi profile;
- rectification result;
- forecast input;
- future forecast result;
- exported reports.

## Core Principle

```text
User data belongs to the user.
Default storage is local-first.
User can export, hide, delete, and clear data.
No cloud database or user account system in Stage 8.
```

## Stage 8 Pipeline

```text
SessionState
  ↓
LocalSessionStore
  ↓
User Controls
  - save session
  - restore session
  - export JSON
  - import JSON
  - hide fact from forecast
  - hide fact from export
  - delete fact
  - clear all data
  ↓
Redaction Engine
  ↓
Privacy Notice
```

## Stage 8 Deliverables

1. Session schema.
2. Local-first storage adapter.
3. Export/import schema and validator.
4. User controls for delete/hide/clear.
5. Redaction for exports and reports.
6. Privacy notice UI copy.
7. Tests proving sensitive data is not leaked.

## Non-Goals

Stage 8 must not add:

- cloud sync;
- login;
- payment;
- database;
- user accounts;
- analytics tracking;
- new AI provider;
- changes to ranking / rectification / forecast semantics.
