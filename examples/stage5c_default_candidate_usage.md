# Stage 5C Adapter Usage Example

```ts
import { createDefaultAndCandidateChartBundle } from "../src/stage5cCandidateCharts";
import { getDefaultBaziAdapter } from "../src/baziEngineAdapter";

const adapter = getDefaultBaziAdapter();

const bundle = createDefaultAndCandidateChartBundle({
  recorded_birth_time: {
    calendar_type: "solar",
    birth_date: "1998-05-10",
    birth_time: "22:30",
    timezone: "Asia/Shanghai",
    assumptions: ["recorded_time_used_as_default_chart"]
  },
  uncertainty: {
    mode: "time_range",
    time_range: { start: "21:00", end: "23:30" },
    boundary_flags: ["near_zi_boundary"]
  },
  adapter
});

console.log(bundle.default_chart);
console.log(bundle.candidate_charts);
console.log(bundle.derived_profiles);
```

Stage 5C does not score the candidate charts. Stage 5D will do rectification scoring.
