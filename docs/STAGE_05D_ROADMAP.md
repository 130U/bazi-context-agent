# Stage 5D Roadmap: Rectification v2 Scoring

## Product formula

```text
导函数 = 八字八变量 + 八字派生运势结构
initial value = 问卷得到的现实初始状态
未来预测 = AI 使用「导函数 + initial value + 当前日期」推未来
```

Stage 5D 处在“求导函数”的最后校正段：

```text
Stage 5B: BaziEngineAdapter
Stage 5C: DefaultChart + CandidateChartV2[]
Stage 5D: Rectification v2 Scoring
Stage 5E: ForecastInput Builder
```

## Stage 5D purpose

Stage 5D receives:

```text
DefaultChart
CandidateChartV2[]
BaziDerivedProfile[]
Major Dated Life Events
Symbol Prior
Recorded Time Prior
```

It outputs:

```text
RectificationResultV2
SelectedChart or DefaultChart
Top Alternatives
Evidence Table
Confidence
Warnings
```

## Core rules

1. DefaultChart is generated from the user's recorded birth time.
2. CandidateChartV2[] exists only when birth time is uncertain.
3. Rectification v2 scores candidates with deterministic logic.
4. AI must not participate in rectification.
5. context_box must not participate in rectification.
6. Dated major events are the main rectification evidence.
7. Symbol evidence is weak.
8. DefaultChart has protection and should not be overridden lightly.
9. If fewer than 3 major dated events exist, do not force override.
10. Stage 5D does not forecast the future.

## Stage 5D pipeline

```text
DefaultChart
CandidateChartV2[]
BaziDerivedProfile[]
LifeEvent[]
SymbolPrior
RecordedTimePrior
  ↓
score each candidate
  ↓
apply contradiction penalty
  ↓
apply default chart protection
  ↓
output RectificationResultV2
```

## Handoff to Stage 5E

Stage 5D produces `selected_chart` and `rectification_result`.

Stage 5E will combine:

```text
selected_chart
bazi_derived_profile
context_box
known_life_events
current_date
forecast_horizon
```

into `ForecastInput`.
