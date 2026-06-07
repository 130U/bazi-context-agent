# Stage 5D EventTimingFit

## Goal

Use dated life events to compare candidate charts.

Event rectification in astrology commonly relies on major dated events, such as marriage, first job, job change, childbirth, surgery, accident, relocation, property purchase, separation, and family events. Stage 5D follows the same engineering principle: use dated events as rectification evidence, not general context facts.

## Input

```ts
type LifeEvent = {
  year: number;
  month?: number;
  event_type:
    | "education"
    | "career"
    | "migration"
    | "relationship"
    | "health"
    | "family"
    | "wealth"
    | "childbearing"
    | "major_turning_point"
    | "best_year"
    | "worst_year";
  description?: string;
  importance?: "low" | "medium" | "high";
};
```

## Candidate data needed

Stage 5D should use `BaziDerivedProfile` generated in Stage 5B/5C.

Preferred signals:

```text
annual_fortunes
luck_cycles
relations
ten_gods
five_elements
shensha
stars
warnings
```

If the derived profile lacks a needed field, scoring must not fail. It should record missing information and lower confidence.

## Deterministic scoring strategy

For each event:

```text
event_score =
  domain_signal_match
+ timing_relation_match
+ intensity_match
+ generic_change_signal
- contradiction_penalty
```

Recommended starting rules:

```text
domain_signal_match: 0.00 - 0.40
timing_relation_match: 0.00 - 0.25
intensity_match: 0.00 - 0.20
generic_change_signal: 0.00 - 0.15
```

Clamp each event score to `[0, 1]`.

## Domain signal mapping

```text
education:
  resource / study / exam / overseas-study signals

career:
  officer / wealth / authority / job-change / career-pressure signals

migration:
  travel / movement / clash / relocation / external-change signals

relationship:
  spouse / union / separation / peach-blossom / relationship-pressure signals

health:
  high-stress / clash / punishment / injury / surgery / imbalance signals

family:
  parent / home / housing / family-change / elder signals

wealth:
  wealth / income / investment / asset / volatility signals

childbearing:
  children / offspring / pregnancy / family-expansion signals

best_year:
  opportunity / support / breakthrough signals

worst_year:
  pressure / loss / conflict / accident / blockage signals
```

## Output

```ts
type EventTimingFitResult = {
  candidate_id: string;
  event_scores: Array<{
    event_id: string;
    year: number;
    event_type: string;
    fit_score: number;
    matched_rules: string[];
    missing_signals: string[];
    contradictions: string[];
  }>;
  event_timing_fit: number;
  missing_information: string[];
  warnings: string[];
};
```

## Non-goals

Stage 5D does not need master-level metaphysical precision. It needs deterministic candidate comparison and explainable evidence.
