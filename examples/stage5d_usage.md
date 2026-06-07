# Stage 5D Usage Example

```ts
import { runRectificationV2 } from "./rectificationV2";

const result = runRectificationV2({
  default_chart,
  candidates,
  life_events,
  symbol_prior,
});

console.log(result.selected_chart_id);
console.log(result.recommendation);
console.log(result.default_chart_protection);
```

Expected boundaries:

```text
AI used: false
context_box used for rectification: false
ranking modified by AI: false
```
