# Stage 5C Roadmap: DefaultChart + CandidateChart v2

## Position

Stage 5C sits after `Stage 5B BaziEngineAdapter` and before `Stage 5D Rectification v2`.

```text
Stage 5B: BaziEngineAdapter
  ↓
Stage 5C: DefaultChart + CandidateChart v2
  ↓
Stage 5D: Rectification v2 scoring
  ↓
Stage 5E: ForecastInput Builder
```

## Purpose

Stage 5C turns user birth input into chart objects:

```text
RecordedBirthTime
  ↓
DefaultChart
  ↓
CandidateChartV2[] when uncertainty exists
```

Each chart should be able to call the Stage 5B adapter and return a `BaziDerivedProfile`.

## Product framing

- `DefaultChart` is generated from the user's recorded birth time.
- `CandidateChartV2[]` is generated only when the user reports uncertainty or boundary risk.
- `context_box` is not used in chart generation.
- AI is not used in chart generation.
- Rectification scoring is not implemented in Stage 5C; it starts in Stage 5D.

## Main deliverables

1. `DefaultChart` type and generator.
2. `CandidateChartV2` type and generator.
3. Birth-time uncertainty expansion policy.
4. Boundary expansion policy for 子时 / hour boundary / date boundary / solar-term boundary.
5. Adapter integration hook to produce `BaziDerivedProfile` for default and candidate charts.
6. Tests covering default chart generation, candidate generation, boundary expansion, and no context/AI pollution.

## Non-goal

Stage 5C does not decide which chart is correct. It only generates valid chart candidates and derived profiles. Stage 5D chooses or ranks them.
