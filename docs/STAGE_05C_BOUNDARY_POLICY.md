# Stage 5C Boundary Policy

## Purpose

Boundary handling is the main reason Stage 5C exists.

The user's recorded time is the default anchor, but candidate generation must expand around known ambiguity points.

## Hour branches

```text
子: 23:00-00:59
丑: 01:00-02:59
寅: 03:00-04:59
卯: 05:00-06:59
辰: 07:00-08:59
巳: 09:00-10:59
午: 11:00-12:59
未: 13:00-14:59
申: 15:00-16:59
酉: 17:00-18:59
戌: 19:00-20:59
亥: 21:00-22:59
```

## Boundary flags

```ts
type BoundaryFlag =
  | "near_zi_boundary"
  | "near_hour_boundary"
  | "near_solar_term"
  | "near_date_boundary"
  | "date_uncertain"
  | "timezone_uncertain"
  | "true_solar_time_requested";
```

## Rules

### near_hour_boundary

Add adjacent hour candidates.

### near_zi_boundary

Add variants for 子时 boundary assumptions.

The system must preserve assumptions rather than pretending there is only one rule.

Example assumptions:

```text
zi_hour_same_day
zi_hour_next_day
late_zi_day_boundary
```

### near_solar_term

Stage 5C may preserve a candidate or warning but does not need to fully recalculate solar-term variants unless the adapter already supports it.

### date_uncertain

Allow date ± 1 day expansion, but cap candidate count.

### timezone_uncertain / true_solar_time_requested

Preserve assumptions and warnings for Stage 5D/5E.

## No scoring here

Stage 5C does not score these boundary variants.

It only emits candidates and assumptions.
