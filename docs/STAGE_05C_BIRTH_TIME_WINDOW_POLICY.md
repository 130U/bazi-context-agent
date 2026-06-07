# Stage 5C Birth Time Window Policy

## Purpose

Birth-time uncertainty controls candidate generation.

## Certainty levels

```ts
type BirthTimeCertainty =
  | "exact_to_minute"
  | "within_1_hour"
  | "approximate_hour"
  | "time_range"
  | "part_of_day"
  | "unknown_time"
  | "unknown_date";
```

## Boundary flags

```ts
type BoundaryFlag =
  | "near_zi_hour"
  | "near_hour_boundary"
  | "near_date_boundary"
  | "near_solar_term"
  | "possible_timezone_issue"
  | "possible_dst_issue"
  | "manual_expand";
```

## Expansion rules

### near_zi_hour

If recorded time is near 23:00–01:00:

```text
include previous day late 子候选
include current day 子候选
include adjacent 亥/丑 as applicable
add warning: zi_hour_day_boundary_assumption_required
```

### near_hour_boundary

If time is within configured minutes of a two-hour boundary:

```text
include previous and next hour branch
```

### near_date_boundary

If date may be off by one day:

```text
include date -1 and date +1 variants
```

### near_solar_term

If birth date is close to solar term boundary:

```text
include solar-term-boundary warning
Stage 5C may stub exact solar-term expansion unless adapter supports it
```

## Output policy

Candidate generation should include `generation_reasons` and `warnings` for every expanded candidate.

Stage 5D will use these reasons to explain why candidates exist.
