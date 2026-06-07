# Stage 7 Judge and Scoring

## Judge types

Stage 7 should support two judge modes:

### 1. Deterministic judge

Uses structured hidden target labels and exact/rule-based matching.

Good for:

- domain classification
- occurred/not occurred
- year overlap
- forbidden leakage terms
- schema compliance

### 2. LLM judge, optional and disabled by default

Can later compare nuanced text quality.

In Stage 7, default must be deterministic/mock. Do not require real OpenAI calls.

## Scoring dimensions

Each mode output receives:

```ts
type ForecastEvalScore = {
  mode: string;
  total_score: number;
  domain_accuracy: number;
  time_window_overlap: number;
  directional_correctness: number;
  specificity: number;
  calibration: number;
  evidence_separation: number;
  leakage_penalty: number;
  notes: string[];
};
```

## Pairwise comparison

For each case:

```text
D vs A
D vs B
D vs C
A vs B
C vs A
C vs B
```

## No overclaim rule

If sample size is small, conclusion must be:

```text
insufficient_data
```

even if D wins the sample.
