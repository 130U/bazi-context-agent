# Stage 5B: BaziEngineAdapter Specification

## Purpose

`BaziEngineAdapter` prevents the app from being tightly coupled to any one third-party BaZi library.

Third-party libraries may expose different APIs and naming conventions. Our app should only consume `BaziDerivedProfile`.

## Interface

```ts
type BaziEngineAdapter = {
  adapter_id: string;
  source_library: string;
  supports_recorded_birth_time: boolean;
  supports_fixed_pillars: boolean;
  supports_luck_cycles: boolean;
  supports_annual_fortunes: boolean;

  deriveFromRecordedBirthTime(input: RecordedBirthTime): Promise<BaziDerivedProfile> | BaziDerivedProfile;
  deriveFromFixedPillars(input: FixedPillars): Promise<BaziDerivedProfile> | BaziDerivedProfile;
};
```

## Required adapters in Stage 5B

Stage 5B should implement at least one adapter that works in tests.

Recommended options:

1. `StaticBaziAdapter`
   - deterministic fallback adapter;
   - takes fixed pillars and returns a minimal `BaziDerivedProfile`;
   - requires no external dependency;
   - must be used for tests if external package installation fails.

2. `LunarJavascriptAdapter`
   - wraps `6tail/lunar-javascript` if the dependency can be installed;
   - derives pillars and available metadata from recorded birth time;
   - should normalize output into `BaziDerivedProfile`.

## Adapter selection

Stage 5B should expose a deterministic adapter selection function:

```ts
getBaziEngineAdapter(policy?: BaziAdapterPolicy): BaziEngineAdapter
```

Default behavior:

```text
- if lunar-javascript is installed and adapter is enabled: use LunarJavascriptAdapter;
- otherwise use StaticBaziAdapter;
- never fail existing ranking/prediction flows because adapter dependency is unavailable.
```

## Boundary

`BaziEngineAdapter` must not:

```text
- modify /api/ranking;
- read context_box;
- call AI provider;
- make network requests;
- read OPENAI_API_KEY;
- change candidate scores;
- choose selected chart;
- do future forecast.
```

It only derives profile data from chart inputs.
