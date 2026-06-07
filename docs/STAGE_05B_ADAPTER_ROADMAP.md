# Stage 5B Roadmap: BaZiEngineAdapter

## Current position

Stage 5A has finished research and adapter decision. Stage 5B now turns the decision into a stable code boundary.

## Product formula

```text
导函数 = 八字八变量 + 八字派生运势结构
initial value = 问卷得到的现实初始状态
future forecast = AI(导函数 + initial value + 当前日期)
```

Stage 5B only builds the first half of the formula: deriving the BaZi function profile from a known birth time or fixed pillars.

## Stage 5B objective

Build a `BaziEngineAdapter` layer that transforms:

```text
RecordedBirthTime | FixedPillars | CandidateChartV2
```

into:

```text
BaziDerivedProfile
```

## Stage 5B does not solve rectification yet

Stage 5B does not choose the final chart. It only makes every chart computable and comparable later.

Rectification v2 starts in Stage 5D.

## Inputs

### RecordedBirthTime

Used when the user provides an actual birth date, location, and recorded time.

```ts
type RecordedBirthTime = {
  calendar_type: "solar" | "lunar" | "unknown";
  birth_date: string;
  birth_time: string;
  timezone?: string;
  location?: {
    country?: string;
    region?: string;
    city?: string;
    longitude?: number;
    latitude?: number;
  };
  sex_for_traditional_chart?: "male" | "female" | "unspecified";
  assumptions: string[];
};
```

### FixedPillars

Used when the eight variables are already known.

```ts
type FixedPillars = {
  year: { stem: string; branch: string };
  month: { stem: string; branch: string };
  day: { stem: string; branch: string };
  hour: { stem: string; branch: string };
};
```

### CandidateChartV2

Used for later candidate chart rectification.

```ts
type CandidateChartV2 = {
  candidate_id: string;
  source: "recorded_time" | "adjacent_hour" | "uncertain_range" | "manual_fixed_pillars";
  recorded_time_prior_score: number;
  birth_input?: RecordedBirthTime;
  fixed_pillars?: FixedPillars;
  boundary_flags: string[];
  assumptions: string[];
};
```

## Output: BaziDerivedProfile

`BaziDerivedProfile` is the standard derivative-function object used by future stages. It must be stable even if the underlying third-party library changes.

```ts
type BaziDerivedProfile = {
  profile_id: string;
  source_chart_id: string;
  source_libraries: string[];
  calculation_mode: "recorded_time" | "candidate_time" | "fixed_pillars" | "static_fallback";
  pillars: FixedPillars;
  day_master: string;
  five_elements: Record<string, number | string | null>;
  ten_gods: unknown[];
  hidden_stems: unknown[];
  nayin: unknown[];
  stars: unknown[];
  shensha: unknown[];
  relations: {
    clashes: unknown[];
    combinations: unknown[];
    punishments: unknown[];
    harms: unknown[];
  };
  luck_cycles?: unknown[];
  annual_fortunes?: unknown[];
  assumptions: string[];
  warnings: string[];
  raw?: unknown;
};
```

## Effect

After Stage 5B, the project should be able to say:

```text
给我一个记录出生时间或八字四柱，我能输出一个统一的导函数对象。
```

That object becomes the foundation for Stage 5C/5D/5E and Stage 6.
