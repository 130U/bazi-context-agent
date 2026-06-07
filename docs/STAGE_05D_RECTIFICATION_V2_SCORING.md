# Stage 5D Rectification v2 Scoring

## Goal

Build a deterministic scoring layer that ranks DefaultChart and CandidateChartV2[] without using AI and without using context_box.

## Score formula

```text
CandidateRectificationScore =
  0.35 * RecordedTimePrior
+ 0.45 * EventTimingFit
+ 0.10 * SymbolPriorFit
+ 0.10 * ChartProfileFit
- ContradictionPenalty
```

Weights must be loaded from:

```text
configs/rectification_weights.stage5d.json
```

Do not hard-code weights inside business logic.

## Components

### RecordedTimePrior

Measures how close the candidate is to the user's recorded time.

Examples:

```text
DefaultChart from exact recorded time: high prior
Adjacent hour: medium prior
Uncertain range candidate: lower prior
Full-day candidate: low prior
Date-boundary candidate: low but allowed
```

### EventTimingFit

Measures how well the candidate's BaziDerivedProfile explains dated life events.

Events include:

```text
education
career
migration
relationship
health
family
wealth
childbearing
major_turning_point
best_year
worst_year
```

### SymbolPriorFit

Weak prior from symbol questionnaire:

```text
hair whorl
birth/fetal order
siblings
little finger
face shape
sleep posture
birth posture
```

This must not dominate the score.

### ChartProfileFit

Lightweight fit between chart-derived profile and non-sensitive long-term pattern signals.

Allowed:

```text
broad temperament indicators
general path volatility
known major life trajectory categories
```

Forbidden:

```text
family wealth
parent occupation
current education
desired industry
current anxiety
context_box facts
```

### ContradictionPenalty

Penalty when a candidate strongly fails to explain important events or contradicts recorded time constraints.

## Required output

Each candidate score must include:

```ts
type CandidateRectificationScore = {
  candidate_id: string;
  chart_role: "default" | "candidate";
  total_score: number;
  confidence: number;
  components: {
    recorded_time_prior: number;
    event_timing_fit: number;
    symbol_prior_fit: number;
    chart_profile_fit: number;
    contradiction_penalty: number;
  };
  evidence: RectificationEvidence[];
  contradictions: RectificationContradiction[];
  missing_information: string[];
  warnings: string[];
};
```

## Required final result

```ts
type RectificationResultV2 = {
  selected_chart_id: string;
  selected_chart_role: "default" | "candidate";
  recommendation:
    | "use_default_chart"
    | "default_protected_uncertain"
    | "candidate_preferred"
    | "insufficient_evidence";
  scores: CandidateRectificationScore[];
  top_alternatives: CandidateRectificationScore[];
  evidence_table: RectificationEvidence[];
  default_chart_protection: DefaultChartProtectionResult;
  metadata: {
    stage: "5D";
    ai_used: false;
    context_box_used_for_rectification: false;
    weights_source: string;
  };
};
```
