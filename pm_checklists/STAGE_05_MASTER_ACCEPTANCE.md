# Stage 5 Master Acceptance Checklist

## Stage 5A

- [ ] At least 3 candidate libraries are evaluated.
- [ ] 6tail/lunar-javascript is evaluated as base library.
- [ ] mystilight-8char is evaluated as enrichment candidate.
- [ ] VedAstro is evaluated as rectification architecture reference.
- [ ] Recommendation clearly says whether a perfect rectification black box exists.
- [ ] Adapter strategy is documented.
- [ ] No ranking logic is changed.
- [ ] Existing tests pass.

## Stage 5B

- [ ] BaziEngineAdapter interface exists.
- [ ] BaziDerivedProfile type exists.
- [ ] FixedPillars type exists.
- [ ] RecordedBirthTime type exists.
- [ ] Adapter does not read context_box.
- [ ] Adapter does not call AI.
- [ ] Adapter output includes source_libraries and assumptions.

## Stage 5C

- [ ] DefaultChart is generated from recorded birth time.
- [ ] CandidateChart[] is generated only when time uncertainty requires it.
- [ ] DefaultChart and CandidateChart can produce BaziDerivedProfile.
- [ ] Adapter enrichment does not rerank charts.
- [ ] Existing ranking boundary still holds.

## Stage 5D

- [ ] Rectification v2 uses recorded time prior.
- [ ] Rectification v2 uses dated major events.
- [ ] Rectification v2 uses symbol prior only as weak evidence.
- [ ] Rectification v2 does not use context_box.
- [ ] Rectification v2 does not call AI.
- [ ] DefaultChart protection is implemented.
- [ ] Fewer than 3 major dated events cannot force an override.

## Stage 5E

- [ ] ForecastInput is built.
- [ ] ForecastInput includes derivative_function.
- [ ] ForecastInput includes initial_value.
- [ ] ForecastInput includes boundaries.
- [ ] ForecastInput is ready for Stage 6.

