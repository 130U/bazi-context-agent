# Stage 6 Prompt Contract

## Purpose

The forecast prompt must make the product logic explicit:

```text
Use derivative_function + initial_value.
Do not recalculate chart.
Do not modify rectification.
Do not present known facts as predictions.
```

## Provider input sections

The provider input should contain these sections:

```text
1. Task
2. Current date
3. Forecast horizon
4. Selected chart summary
5. BaziDerivedProfile / derivative function
6. Initial value / context box
7. Known life events
8. User question
9. Output schema
10. Policy constraints
```

## Required instructions

The prompt must instruct the model to:

```text
Separate known facts from predictions.
Separate chart signals from context adjustments.
Use cautious probabilistic language.
Avoid deterministic claims.
Avoid medical/legal/financial certainty.
Return structured JSON only when provider supports schema output.
```

## Do not include

```text
raw API keys
.env values
GitHub tokens
local filesystem paths
unredacted private debug dumps
```

## Chinese product tone

Default language should be Chinese unless request asks otherwise.

Preferred structure:

```text
结论
领域预测
时间窗口
机会窗口
风险窗口
行动建议
不确定性
已知事实引用
八字导函数信号
现实初始值修正
```
