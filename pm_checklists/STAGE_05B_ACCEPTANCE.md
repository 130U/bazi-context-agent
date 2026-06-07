# Stage 5B Acceptance Checklist

## Core types

- [ ] `RecordedBirthTime` exists.
- [ ] `FixedPillars` exists.
- [ ] `CandidateChartV2` exists.
- [ ] `BaziDerivedProfile` exists.
- [ ] `BaziEngineAdapter` exists.
- [ ] `BaziAdapterPolicy` or equivalent exists.

## Adapter implementation

- [ ] `StaticBaziAdapter` exists.
- [ ] `StaticBaziAdapter` can derive a profile from fixed pillars.
- [ ] Adapter output includes required `BaziDerivedProfile` top-level fields.
- [ ] Missing derived fields produce warnings instead of crashes.
- [ ] `source_libraries` is populated.
- [ ] `calculation_mode` is populated.
- [ ] `assumptions` and `warnings` are populated.

## Optional lunar-javascript integration

- [ ] If installed, `LunarJavascriptAdapter` is wrapped behind `BaziEngineAdapter`.
- [ ] If unavailable, fallback to `StaticBaziAdapter` works.
- [ ] No runtime crash occurs when lunar-javascript is absent.

## Boundary

- [ ] Adapter does not use `context_box`.
- [ ] Adapter does not call AI provider.
- [ ] Adapter does not read `OPENAI_API_KEY`.
- [ ] Adapter does not modify `/api/ranking`.
- [ ] `/api/ranking` remains deterministic.
- [ ] context_box still does not affect ranking.
- [ ] Stage 4 prediction/report tests still pass.

## Scope

- [ ] No Stage 5C rectification v2.
- [ ] No Stage 6 forecast engine.
- [ ] No new UI framework.
- [ ] No login/payment/database/user system.
- [ ] No real `.env` or API key.

## Tests

- [ ] Adapter tests exist.
- [ ] Existing tests pass.
- [ ] `npm test` passes.
