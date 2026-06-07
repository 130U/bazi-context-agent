# Tech Stack and Architecture / 技术栈与架构

## Stack

- Node.js
- TypeScript
- Node built-in `node:test`
- Vanilla local UI
- JSON config-driven policies
- BaZi adapter layer
- Mock/OpenAI provider switch behind env flag
- Local-first session control

## Architecture

```text
Birth Input
  ↓
DefaultChart / CandidateChart
  ↓
BaziEngineAdapter
  ↓
BaziDerivedProfile
  ↓
RectificationResultV2
  ↓
ForecastInput
  ↓
FutureForecastResult
  ↓
Report / Export / Evaluation
```

## Boundary principles

- Deterministic stages produce chart and derived structure.
- Context box is user-controlled.
- AI can forecast but cannot change upstream evidence.
- Evaluation harness compares multiple modes.
