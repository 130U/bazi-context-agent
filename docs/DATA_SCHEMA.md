# Data Schema / 数据结构

## Authority / 权威来源

- 问卷结构：`configs/question_bank.v1.json`
- 全部评分数值：`configs/scoring_weights.v1.json`
- TypeScript 契约：`src/types.ts`、`src/baziTypes.ts`、`src/rectificationTypes.ts`、`src/forecastInputTypes.ts`、`src/futureForecastTypes.ts`、`src/sessionTypes.ts`
- 浏览器运行配置：由 `scripts/buildPublicConfig.ts` 从两份权威配置生成，不可手改。

## Data flow / 数据流

```text
BirthInput + SymbolAnswer + LifeEvent
  -> CandidateChart / DefaultChart
  -> deterministic scores + evidence + contradictions
  -> locked working chart
  -> ContextFact + forecast request
  -> ForecastInput -> forecast result -> report/export
```

每个评分结果必须能区分确定性规则、用户已知事实、缺失信息和矛盾项。上下文字段不得出现在校时评分输入中；导出和报告不得包含密钥、环境变量值、本地路径或未脱敏的隐藏事实。
