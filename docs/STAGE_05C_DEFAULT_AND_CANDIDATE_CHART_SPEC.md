# Stage 5C DefaultChart and CandidateChart v2 Spec

## Goal

Use the user-recorded birth time as the default starting chart. Only generate candidate charts when the time is uncertain.

## Input

```ts
RecordedBirthTime
SymbolPrior
TimeUncertaintyPolicy
```

## Output

```ts
{
  default_chart: DefaultChart;
  candidate_charts: CandidateChartV2[];
  generation_policy: CandidateGenerationPolicyV2;
}
```

## Candidate Generation Policy

```text
If exact recorded time:
  DefaultChart + adjacent hour candidates only when boundary flag exists.

If approximate recorded time:
  DefaultChart + previous/next hour.

If range:
  all hours inside range + boundary expansion.

If unknown time but known date:
  12 hour candidates.

If date uncertain:
  date ±1 day × 12 hour candidates.
```

## Default Chart Protection

DefaultChart should not be casually displaced.

```text
If alternative_score <= default_score + 0.05:
  select DefaultChart.

If alternative_score > default_score + 0.05 and <= default_score + 0.15:
  mark uncertain; show alternative but keep DefaultChart as primary unless user asks.

If alternative_score > default_score + 0.15 and at least 3 major dated events support it:
  select alternative chart.

If fewer than 3 major dated events:
  do not override DefaultChart.
```

## Boundary

Candidate generation does not use:

- context_box;
- current education;
- family wealth;
- parental occupation;
- true preference;
- AI output.

It may use:

- recorded time;
- time certainty;
- boundary flags;
- weak symbol prior;
- dated major events in later scoring.

