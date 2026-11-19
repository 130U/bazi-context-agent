# Evaluation

The harness answers one question: what does each input add to a forecast, measured on facts the system was never
shown?

## Four modes

| Mode | Chart | Context | Compared with D, it shows |
| --- | --- | --- | --- |
| **A** | Selected | None | What context adds |
| **B** | None | Supplied | What the chart adds |
| **C** | Recorded time | Supplied | What rectification adds |
| **D** | Selected | Supplied | The full system |

`buildAllModeInputs` in [`src/evaluationModes.ts`](../src/evaluationModes.ts) builds the four inputs from one
evaluation case, with each mode's required exclusions applied.

## Holdout and leakage

- **Holdout construction.** [`buildHoldoutSnapshot`](../src/holdoutBuilder.ts) removes the hidden target fields,
  the terms that name them, and every event after the forecast cutoff.
- **Leakage guard.** [`runLeakageGuard`](../src/leakageGuard.ts) checks every mode's input for direct leakage (the
  target itself) and temporal leakage (facts from after the cutoff), and redacts flagged terms.
- **Judge.** [`scoreModeOutput`](../src/forecastJudge.ts) scores each mode's output against the held-out target and
  penalizes any mode whose input leaked; `comparePair` compares two modes with a tie threshold of 0.03.
- **Benchmark.** [`runBenchmark`](../src/benchmarkRunner.ts) aggregates mode scores and pairwise win rates over a
  case set and marks comparisons with too little data.

The harness runs offline. It calls no model provider and has no write access to the ranking path, and ten tests
cover the holdout builder, the leakage guard, mode construction, the judge and the benchmark runner.
