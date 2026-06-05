# Prediction Layer Stage 4A

The prediction layer receives a frozen ranking snapshot and user context after deterministic ranking is complete.

## Input

```ts
type PredictionRequest = {
  question: string;
  domain?: PredictionDomain;
  rankingSnapshot: RankingSnapshot;
  contextBox: ContextFact[];
  lifeEvents: LifeEvent[];
};
```

## Output

```ts
type PredictionResult = {
  domain: PredictionDomain;
  conclusion: string;
  known_facts: KnownFact[];
  chart_signals: ChartSignal[];
  context_adjustments: ContextAdjustment[];
  prediction: {
    answer: string;
    confidence: number;
    timeframe?: string;
  };
  confidence: number;
  uncertainty: string[];
  next_questions: string[];
  policy: PredictionPolicy;
};
```

## Mandatory boundaries

- Prediction may read `rankingSnapshot` but must not mutate it.
- Prediction may read `contextBox` but must not send it back into `/api/ranking`.
- Prediction cannot call ranking.
- Prediction cannot alter candidate score or confidence.
- Stage 4A uses only `mock` provider.
