# Stage 5B: BaziDerivedProfile Schema

## Design principle

The schema must be stable, explicit, and tolerant of partial third-party outputs.

Some libraries may output rich BaZi information. Others may output only four pillars. The adapter must always return the same shape.

## Required top-level fields

```text
profile_id
source_chart_id
source_libraries
calculation_mode
pillars
day_master
five_elements
ten_gods
hidden_stems
nayin
stars
shensha
relations
assumptions
warnings
```

## Optional fields

```text
luck_cycles
annual_fortunes
raw
```

## Source library provenance

Every profile must include:

```ts
source_libraries: string[]
```

Examples:

```json
["static-adapter"]
["6tail/lunar-javascript"]
["6tail/lunar-javascript", "mystilight-8char"]
```

## Calculation mode

Valid values:

```text
recorded_time
candidate_time
fixed_pillars
static_fallback
```

## Warnings

Warnings should include cases such as:

```text
- external library unavailable;
- fixed-pillars mode cannot compute luck cycles;
- timezone not provided;
- true solar time not applied;
- Zi hour day-boundary policy unresolved;
- derived field unavailable from current adapter.
```

## Privacy boundary

`BaziDerivedProfile` is chart-derived. It must not contain sensitive context facts such as:

```text
family wealth
parental occupation
highest education
inner preferred industry
recent anxiety
```

Those belong to `ForecastInitialValue`, not the derivative function object.
