# Stage 5E Usage Example

## Build ForecastInput

```ts
import { buildForecastInput } from "../src/forecastInputBuilder";

const forecastInput = buildForecastInput({
  current_date: "2026-06-07",
  timezone: "Asia/Singapore",
  user_question: "未来一年我的事业走势如何？",
  forecast_horizon: "1_year",
  forecast_domains: ["career", "wealth"],
  selected_chart,
  rectification_result,
  derivative_profile,
  context_box,
  known_life_events
});
```

## Important

Stage 5E only builds input.

It does not forecast.

Stage 6 consumes `forecastInput` and calls the AI forecast engine.
