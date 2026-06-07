# Evaluation and Holdout Benchmark / 评估与留出基准

## Why evaluation matters

The project should not rely on subjective impressions of accuracy. Stage 7 creates a benchmark harness that can compare forecast modes.

## Modes

| Mode | Meaning |
|---|---|
| A | Derivative only |
| B | Initial value only |
| C | Default chart + initial value |
| D | Selected chart + initial value |

## Public claim discipline

The README should not claim guaranteed accuracy. It should say:

> The framework allows comparative evaluation under holdout conditions.

中文：

> 本项目提供留出条件下的对比评估框架，不宣称保证准确。
