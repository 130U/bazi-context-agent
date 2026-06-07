# Stage 5E Roadmap: ForecastInput Builder

## Current stage

```text
Stage 5E = ForecastInput Builder
```

Stage 5E is the bridge between the deterministic BaZi pipeline and the Stage 6 AI forecast layer.

## Core product formula

```text
Derivative function = BaziDerivedProfile
Initial value = questionnaire-derived context_box + known_life_events + current_state
Forecast = AI in Stage 6 uses derivative function + initial value + current_date + horizon
```

## What Stage 5E consumes

```text
1. SelectedChart or DefaultChart from Stage 5D
2. RectificationResultV2 from Stage 5D
3. BaziDerivedProfile from Stage 5B/5C
4. ContextBox facts from questionnaire
5. KnownLifeEvents from event backtest
6. UserQuestion
7. CurrentDate
8. ForecastHorizon
```

## What Stage 5E produces

```text
ForecastInput
```

This is the canonical payload consumed by Stage 6.

## Key boundaries

```text
Stage 5E does not forecast.
Stage 5E does not call AI.
Stage 5E does not modify rectification.
Stage 5E does not modify ranking.
Stage 5E only packages data.
```

## Stage 5E pipeline

```text
RectificationResultV2
  + BaziDerivedProfile
  + ContextBox
  + KnownLifeEvents
  + CurrentDate
  + ForecastHorizon
  + UserQuestion
    ↓
ForecastInputBuilder
    ↓
ForecastInput
    ↓
Stage 6 Future Forecast Engine
```

## Success criteria

1. `ForecastInput` has a stable type.
2. `ForecastInput` separates derivative function and initial value.
3. `ForecastInput` preserves provenance.
4. `ForecastInput` does not include secrets.
5. `ForecastInput` has boundary metadata.
6. Tests prove Stage 5E does not alter selected chart, ranking, or rectification.
