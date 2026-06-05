# Prediction Output Schema Stage 4A

Prediction output must separate what is known from what is inferred.

## Required sections

| Field | Meaning |
|---|---|
| `domain` | Prediction domain such as education, career, wealth, migration |
| `conclusion` | Short user-facing conclusion |
| `known_facts` | Facts already disclosed by user or stored in context box |
| `chart_signals` | Signals derived from selected/top candidate chart snapshot |
| `context_adjustments` | Real-world context corrections to chart-only reading |
| `prediction` | Actual prediction not directly disclosed by user |
| `confidence` | Overall prediction confidence, 0–1 |
| `uncertainty` | What could change the answer |
| `next_questions` | Follow-up questions that would improve accuracy |
| `policy` | Boundary metadata |

## Policy fields

```json
{
  "ai_used_for_ranking": false,
  "ranking_modified_by_ai": false,
  "provider": "mock"
}
```

In Stage 4B, provider may be `openai`, but the first two fields must remain false.
