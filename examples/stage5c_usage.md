# Stage 5C Usage Example

## Default chart

```ts
const defaultChart = createDefaultChart(recordedBirthTime, adapter, policy);
```

## Candidate generation

```ts
const result = generateCandidateChartsV2({
  recorded_birth_time: recordedBirthTime,
  default_chart: defaultChart,
  symbol_prior,
  generation_policy,
});
```

## Boundary

Do not pass `contextBox` into Stage 5C generation.

```ts
// Correct
const result = generateCandidateChartsV2({ recorded_birth_time, default_chart, symbol_prior, generation_policy });

// Wrong
const result = generateCandidateChartsV2({ recorded_birth_time, default_chart, contextBox });
```
