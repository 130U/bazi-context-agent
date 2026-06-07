# Stage 7 Metrics

## Core metrics

### 1. Domain outcome accuracy

Does the forecast identify the correct domain-level outcome?

Example:

```text
Target: career transition within 3 years
Prediction: career change / pivot likely in 2021-2022
```

### 2. Time window overlap

Does the forecast time window overlap the ground truth year/month range?

### 3. Directional correctness

Is the predicted direction correct?

Examples:

- upward career movement
- instability
- relocation
- relationship stabilization
- academic upgrade

### 4. Specificity score

Does the output make concrete claims rather than vague statements?

### 5. Calibration score

Does the stated confidence match the evidence level?

### 6. Evidence separation score

Does the output separate:

- known facts
- derivative signals
- initial value adjustments
- actual predictions

### 7. Leakage penalty

Strong penalty if hidden target appears in input or output as copied facts.

### 8. Pairwise win rate

Compare outputs from modes A/B/C/D pairwise.

## BenchmarkResult

```ts
type BenchmarkResult = {
  benchmark_id: string;
  case_count: number;
  mode_scores: Record<string, ModeAggregateScore>;
  pairwise_win_rates: Record<string, number>;
  leakage_summary: LeakageSummary;
  conclusion: "insufficient_data" | "full_system_wins" | "mixed" | "baseline_wins";
};
```
