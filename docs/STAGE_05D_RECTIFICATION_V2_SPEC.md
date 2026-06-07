# Stage 5D Rectification v2 Spec

## Goal

Rank DefaultChart and CandidateChart[] using evidence that is legitimately related to birth-time rectification.

## Input

```ts
DefaultChart
CandidateChartV2[]
RectificationEvidence[]
SymbolPrior
RecordedTimePrior
BaziDerivedProfile[]
```

## Output

```ts
export type RectificationResultV2 = {
  selected_chart_id: string;
  default_chart_id: "default_chart";
  default_chart_kept: boolean;
  confidence: number;
  candidates: Array<{
    candidate_id: string;
    total_score: number;
    confidence: number;
    score_breakdown: RectificationScoreBreakdown;
    evidence_table: RectificationEvidenceRow[];
    contradictions: string[];
    warnings: string[];
  }>;
  policy: {
    context_box_used_for_rectification: false;
    ai_used_for_rectification: false;
    default_chart_protection_applied: boolean;
  };
};
```

## Scoring Formula

```text
CandidateRectificationScore =
  0.35 * RecordedTimePrior
+ 0.45 * EventTimingFit
+ 0.10 * SymbolPriorFit
+ 0.10 * ChartProfileFit
- ContradictionPenalty
```

## Evidence Types

Strong rectification evidence:

- dated marriage/divorce;
- dated childbirth;
- dated major relocation;
- dated first job/career change;
- dated major surgery/accident;
- dated family death or major family event;
- dated property or immigration event;
- dated education/overseas event when significant.

Weak evidence:

- hair whorl;
- sibling/fetal order;
- sleep posture;
- self-described temperament.

Not rectification evidence:

- family wealth;
- parental education/occupation;
- current highest education;
- current job prestige;
- desired industry;
- recent anxiety;
- family support style.

These belong to forecast initial value.

## Default Override Rule

A non-default chart can override DefaultChart only if:

1. it beats DefaultChart by configured threshold;
2. at least 3 major dated events support it;
3. it has no major contradictions;
4. the result explicitly says DefaultChart was overridden.

## Boundary

Rectification v2 must never call:

- AI provider;
- prediction provider;
- report generator;
- context box forecast summarizer.

