# Stage 5D Evidence Model

## Purpose

Rectification must be explainable. Every candidate score should include an evidence trail.

## Evidence types

```ts
type RectificationEvidenceType =
  | "recorded_time_prior"
  | "event_timing_fit"
  | "symbol_prior"
  | "chart_profile_fit"
  | "contradiction"
  | "missing_information"
  | "default_protection";
```

## Evidence item

```ts
type RectificationEvidence = {
  evidence_id: string;
  candidate_id: string;
  evidence_type: RectificationEvidenceType;
  event_id?: string;
  label: string;
  description: string;
  score_delta?: number;
  weight?: number;
  confidence: number;
  source: "birth_record" | "life_event" | "symbol_answer" | "derived_profile" | "policy";
};
```

## Contradiction

```ts
type RectificationContradiction = {
  candidate_id: string;
  event_id?: string;
  severity: "low" | "medium" | "high";
  description: string;
  penalty: number;
};
```

## Missing information

Missing information should not crash the system.

Examples:

```text
No annual_fortunes in BaziDerivedProfile
Event lacks month
Fewer than 3 major dated events
No symbol prior available
No recorded time certainty
```

These should appear in `missing_information` and `warnings`.

## Evidence table

The final result should expose a table-like structure:

```ts
type RectificationEvidenceTableRow = {
  candidate_id: string;
  component: string;
  score: number;
  weight: number;
  weighted_score: number;
  evidence_summary: string[];
  contradictions: string[];
};
```
