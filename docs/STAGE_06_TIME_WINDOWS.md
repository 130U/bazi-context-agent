# Stage 6 Time Windows

## Forecast horizons

```text
3_months
6_months
1_year
3_years
10_years
```

## Time window object

```ts
type ForecastTimelineWindow = {
  window_id: string;
  start_date?: string;
  end_date?: string;
  label: string;
  theme: string;
  opportunity_level: "low" | "medium" | "high";
  risk_level: "low" | "medium" | "high";
  basis: string[];
  recommended_focus: string[];
};
```

## Current date

Do not hard-code the current date. Use:

```text
ForecastInput.current_date
```

The current date in fixtures may be 2026-06-07, but implementation must accept any ISO date.

## Date precision

Stage 6 may output broad windows. It must not claim exact dates unless the derivative profile provides explicit timing data.
