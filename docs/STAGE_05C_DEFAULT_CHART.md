# Stage 5C DefaultChart Specification

## Definition

`DefaultChart` is the chart generated from the user's recorded birth time.

The product should treat recorded birth time as a strong prior, not as absolute truth.

```text
recorded birth time → DefaultChart
```

## Input

```ts
type RecordedBirthTime = {
  calendar_type: "solar" | "lunar" | "unknown";
  birth_date: string;             // YYYY-MM-DD
  birth_time: string;             // HH:mm, approximate allowed only through certainty metadata
  timezone?: string;
  location?: {
    country?: string;
    region?: string;
    city?: string;
    longitude?: number;
    latitude?: number;
  };
  sex_for_traditional_chart?: "male" | "female" | "unspecified";
  certainty: BirthTimeCertainty;
  boundary_flags: BoundaryFlag[];
  assumptions: string[];
};
```

## Output

```ts
type DefaultChart = {
  chart_id: string;
  chart_role: "default";
  source: "recorded_birth_time";
  recorded_time_prior_score: number;
  birth_input: RecordedBirthTime;
  fixed_pillars?: FixedPillars;
  derived_profile?: BaziDerivedProfile;
  boundary_flags: BoundaryFlag[];
  assumptions: string[];
  warnings: string[];
};
```

## Required behavior

1. Always generate a DefaultChart when a valid recorded birth date/time exists.
2. If adapter derivation succeeds, attach `derived_profile`.
3. If adapter derivation fails, keep DefaultChart and add warning.
4. Do not use `context_box`.
5. Do not use AI.
6. Do not modify `/api/ranking`.

## Default prior score

DefaultChart should receive a prior based on certainty:

```text
exact_to_minute: 1.00
within_1_hour: 0.85
approximate_hour: 0.70
time_range: 0.60
part_of_day: 0.45
unknown_time: 0.20
unknown_date: 0.05
```

These are generation priors. They do not finalize rectification.
