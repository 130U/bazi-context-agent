# Stage 5B BaZi Adapter Spec

## Goal

Define a stable internal adapter boundary for BaZi-derived information.

Third-party libraries must be hidden behind our own interface.

## Core Type: FixedPillars

```ts
export type HeavenlyStem = string;
export type EarthlyBranch = string;

export type Pillar = {
  stem: HeavenlyStem;
  branch: EarthlyBranch;
};

export type FixedPillars = {
  year: Pillar;
  month: Pillar;
  day: Pillar;
  hour: Pillar;
};
```

## Core Type: RecordedBirthTime

```ts
export type RecordedBirthTime = {
  date: string;              // YYYY-MM-DD
  time: string;              // HH:mm
  timezone?: string;         // e.g. Asia/Shanghai
  location?: {
    country?: string;
    region?: string;
    city?: string;
    latitude?: number;
    longitude?: number;
  };
  certainty: "exact" | "approximate" | "range" | "unknown_time" | "unknown_date";
  boundary_flags?: Array<"near_zi_hour" | "near_hour_boundary" | "near_jieqi" | "near_date_boundary">;
};
```

## Core Type: DefaultChart

```ts
export type DefaultChart = {
  chart_id: "default_chart";
  source: "recorded_birth_time";
  recorded_birth_time: RecordedBirthTime;
  fixed_pillars?: FixedPillars;
  derived_profile?: BaziDerivedProfile;
  protection_policy: {
    protected_as_default: true;
    can_be_overridden_only_by_strong_evidence: true;
  };
};
```

## Core Type: CandidateChartV2

```ts
export type CandidateChartV2 = {
  candidate_id: string;
  source: "recorded_time_window" | "full_day_search" | "date_expansion";
  candidate_birth_time: RecordedBirthTime;
  fixed_pillars?: FixedPillars;
  derived_profile?: BaziDerivedProfile;
  is_default_chart?: boolean;
};
```

## Core Type: BaziDerivedProfile

```ts
export type BaziDerivedProfile = {
  pillars: FixedPillars;
  day_master: string;
  five_elements: unknown;
  ten_gods: unknown;
  hidden_stems: unknown;
  nayin: unknown;
  stars: unknown;
  shensha: unknown;
  relations: {
    clashes: unknown[];
    combinations: unknown[];
    punishments: unknown[];
    harms: unknown[];
  };
  luck_cycles?: unknown[];
  annual_fortunes?: unknown[];
  source_libraries: string[];
  calculation_mode: "recorded_time" | "candidate_time" | "fixed_pillars";
  assumptions: string[];
  warnings: string[];
};
```

## Adapter Interface

```ts
export type BaziEngineAdapter = {
  adapter_id: string;
  source_library: string;
  supports_birth_datetime: boolean;
  supports_fixed_pillars: boolean;
  deriveFromRecordedBirthTime(input: RecordedBirthTime): Promise<BaziDerivedProfile> | BaziDerivedProfile;
  deriveFromFixedPillars?(input: FixedPillars): Promise<BaziDerivedProfile> | BaziDerivedProfile;
};
```

## Adapter Rules

1. Adapter may enrich chart data.
2. Adapter must not call AI.
3. Adapter must not modify ranking.
4. Adapter must not read context_box.
5. Adapter must record assumptions and source_library.
6. Adapter must fail explicitly when required data is missing.

## Error Handling

```ts
export type BaziAdapterError = {
  code: "MISSING_BIRTH_TIME" | "UNSUPPORTED_FIXED_PILLARS" | "LIBRARY_ERROR" | "INVALID_DERIVED_PROFILE";
  message: string;
  source_library?: string;
};
```

