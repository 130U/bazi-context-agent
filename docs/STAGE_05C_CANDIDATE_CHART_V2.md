# Stage 5C CandidateChartV2 Specification

## Definition

`CandidateChartV2` represents a plausible birth-time candidate generated from uncertainty rules.

Stage 5C generates candidates; Stage 5D scores them.

## Input

```ts
type CandidateGenerationInput = {
  recorded_birth_time: RecordedBirthTime;
  default_chart: DefaultChart;
  symbol_prior?: HourGroupPrior;
  generation_policy: ChartGenerationPolicy;
};
```

## Output

```ts
type CandidateChartV2 = {
  candidate_id: string;
  chart_role: "candidate";
  source:
    | "recorded_time"
    | "adjacent_hour"
    | "uncertain_range"
    | "part_of_day"
    | "full_day"
    | "date_boundary"
    | "solar_term_boundary"
    | "manual_fixed_pillars";
  birth_input?: RecordedBirthTime;
  fixed_pillars?: FixedPillars;
  derived_profile?: BaziDerivedProfile;
  recorded_time_prior_score: number;
  symbol_prior_score?: number;
  generation_reasons: string[];
  boundary_flags: BoundaryFlag[];
  assumptions: string[];
  warnings: string[];
};
```

## Candidate count policy

Default candidate generation should target 2–6 candidates.

Exceptions:

- full-day unknown time can generate 12 hour candidates;
- unknown date can generate date ±1 day × hour candidates, but Stage 5C may cap or paginate;
- extreme ambiguity should return warnings instead of pretending confidence.

## Candidate generation tiers

```text
exact_to_minute:
  default chart + adjacent hour only if boundary flag exists

within_1_hour:
  default chart + previous/next hour branch

approximate_hour:
  default chart + previous/next hour branch

time_range:
  all hour branches covered by the range + adjacent boundary candidates

part_of_day:
  corresponding hour branches for morning/afternoon/evening/night

unknown_time:
  12 hour branches for the recorded date

unknown_date:
  date -1, date, date +1 with conservative hour generation
```

## Requirements

1. Candidate generation must be deterministic.
2. Candidate generation must not call AI.
3. Candidate generation must not read context_box.
4. Candidate generation must not rank candidates by future prediction data.
5. Candidate generation must attach derived profiles when adapter is available.
