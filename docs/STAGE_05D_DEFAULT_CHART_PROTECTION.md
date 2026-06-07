# Stage 5D Default Chart Protection

## Why protection exists

The user's recorded birth time should be treated as the default anchor.

The system should not override DefaultChart just because an alternative candidate scores slightly higher.

## Inputs

```text
DefaultChart score
Top alternative score
Number of major dated events
Contradictions against DefaultChart
Recorded time certainty
Boundary flags
```

## Rules

Use defaults from:

```text
configs/default_chart_protection.stage5d.json
```

Recommended policy:

```text
If event_count < 3:
  recommendation = "insufficient_evidence"
  selected_chart = DefaultChart
  do not override

If top_alternative_score - default_score <= 0.05:
  recommendation = "use_default_chart"
  selected_chart = DefaultChart

If lead > 0.05 and lead <= 0.15:
  recommendation = "default_protected_uncertain"
  selected_chart = DefaultChart
  show alternative as serious possibility

If lead > 0.15 and event_count >= 3 and top alternative has at least 3 matched high-importance events:
  recommendation = "candidate_preferred"
  selected_chart = top alternative

If DefaultChart has major contradictions on high-importance events:
  allow override more easily, but still require evidence table
```

## Output

```ts
type DefaultChartProtectionResult = {
  default_chart_id: string;
  top_alternative_id?: string;
  default_score: number;
  top_alternative_score?: number;
  lead_over_default?: number;
  event_count: number;
  minimum_events_required: number;
  override_allowed: boolean;
  recommendation:
    | "use_default_chart"
    | "default_protected_uncertain"
    | "candidate_preferred"
    | "insufficient_evidence";
  reasons: string[];
};
```

## Required behavior

1. DefaultChart must always appear in scores.
2. DefaultChart should be selected unless evidence is strong enough.
3. Alternatives must be shown, not hidden.
4. If evidence is weak, do not pretend certainty.
5. The UI/report should preserve uncertainty.
