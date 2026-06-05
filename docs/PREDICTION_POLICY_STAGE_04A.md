# Prediction Policy Stage 4A

## Hard boundary

AI/prediction layer is downstream of ranking only.

Forbidden:

- AI cannot choose birth hour.
- AI cannot change candidate order.
- AI cannot change candidate score.
- AI cannot change candidate confidence.
- AI cannot call `/api/ranking`.
- AI cannot cause context box to flow back into ranking.

Allowed:

- AI/mock provider may read a frozen ranking snapshot.
- AI/mock provider may read context box.
- AI/mock provider may generate explanations and predictions.
- AI/mock provider may ask follow-up questions.

## Required policy metadata

Every PredictionResult must include:

```json
{
  "ai_used_for_ranking": false,
  "ranking_modified_by_ai": false,
  "provider": "mock"
}
```
