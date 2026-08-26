# BaZi Context Agent

A deterministic-first BaZi rectification and context-aware forecasting research prototype.

Interactive experience: https://www.theodoreoy.com/bazi-context-agent/

## Core Formula

```text
Derivative function = BaZi variables + derived BaZi structure
Initial value = user-controlled real-world context
Forecast = derivative function + initial value + current date + forecast horizon
```

## Differentiators

- Chart derivation, candidate generation, and rectification are deterministic.
- AI is used only after chart selection for forecasting, explanation, and reports.
- The context box can inform forecasts, but cannot leak back into ranking or rectification.
- A/B/C/D evaluation modes help separate recall of known facts from forecasting.
- The public Pages app is memory-only; local preview and API servers reuse the same canonical interface instead of maintaining a second UI.
- Strict TypeScript checks, generated-config parity, static-site validation, and 140+ automated tests form the release gate.

See the main README for the full bilingual version.
