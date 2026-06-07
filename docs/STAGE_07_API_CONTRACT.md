# Stage 7 API Contract

Stage 7 can be implemented as internal functions first. Public API is optional.

## Optional endpoint: POST /api/evaluate-forecast

Input:

```ts
type EvaluateForecastRequest = {
  eval_case: EvalCase;
  mode_outputs: Record<string, FutureForecastResult>;
  options?: {
    judge_mode?: "deterministic" | "mock_llm";
  };
};
```

Output:

```ts
type EvaluateForecastResponse = {
  case_result: EvalCaseResult;
  leakage_guard: LeakageGuardResult;
  benchmark_partial?: BenchmarkResult;
};
```

## Optional endpoint: POST /api/benchmark

Input:

```ts
type BenchmarkRequest = {
  eval_cases: EvalCase[];
  mode_outputs?: Record<string, Record<string, FutureForecastResult>>;
};
```

Output:

```ts
type BenchmarkResult = {
  benchmark_id: string;
  case_count: number;
  mode_scores: Record<string, ModeAggregateScore>;
  pairwise_win_rates: Record<string, number>;
  leakage_summary: LeakageSummary;
  conclusion: string;
};
```

## Boundaries

These endpoints must not:

- call `/api/ranking`
- modify selected chart
- modify rectification result
- call real OpenAI by default
- create new forecasts unless explicitly using existing Stage 6 provider with mock/default policy
