# Stage 7 Usage Example

```ts
import { runBenchmark } from "./evaluationBenchmark";

const result = runBenchmark({
  eval_cases,
  mode_outputs,
  judge_mode: "deterministic"
});

console.log(result.mode_scores);
console.log(result.pairwise_win_rates);
```

Expected result:

```text
Do not claim superiority when sample size is too small.
Use conclusion = insufficient_data until enough high-quality holdout cases exist.
```
