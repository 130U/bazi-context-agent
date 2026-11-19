# Scoring Specification / 评分规格

All scoring weights must come from `configs/scoring_weights.json`.

## Candidate Score Formula

The public engine (`site/core/rectification.js`) scores each candidate hour with
`browser_rectification.candidate_component_weights`:

```text
total =
  event_backtest * candidate_component_weights.event_backtest    (0.55)
  + symbol_prior * candidate_component_weights.symbol_prior      (0.25)
  + birth_record * candidate_component_weights.birth_record      (0.20)
```

A selection is stable when at least 15 questions have been asked, the leading margin is at least
`stability.minimum_score_margin` (0.035), at least five event questions carry dated events and at least eight answers
carry content. A lock that does not clear the gate by question 17 is provisional.

The research API's TypeScript ranking (`src/ranking.ts`) uses `candidate_score_weights`:

```text
total =
  symbol_prior_fit * candidate_score_weights.symbol_prior_fit
  + event_timing_fit * candidate_score_weights.event_timing_fit
  + early_life_and_family_fit * candidate_score_weights.early_life_and_family_fit
  + birth_record_plausibility * candidate_score_weights.birth_record_plausibility
  + domain_trajectory_fit * candidate_score_weights.domain_trajectory_fit
```

If contradiction penalties are enabled, deterministic contradictions reduce the score within configured caps. Business logic must fail closed when a required weight is missing; it must not invent a fallback scoring value.

## Symbol Prior

Symbol answers create a weak prior over three hour groups:

- `G1_zi_wu_mao_you`: 子午卯酉
- `G2_yin_shen_si_hai`: 寅申巳亥
- `G3_chen_xu_chou_wei`: 辰戌丑未

The symbol prior is weak and cannot by itself finalize the birth hour.

## Scoring surfaces / 评分面

- `candidate_score_weights`, `candidate_generation`, `event_backtest` and `ranking`: the research API's TypeScript ranking.
- `rectification`: DefaultChart、候选盘、事件时序、默认盘保护与证据表。
- `chart_generation`: 记录时间先验、扩展候选惩罚与候选下限。
- `browser_rectification`: 公开体验的出生记录、弱先验、事件关系、稳定门与不确定性策略。

## Event backtest / 事件回测

事件类型先映射到配置中的关系 profile，再使用年份地支与候选时支的确定性关系评分。`best_year` 与 `worst_year` 必须保持不同极性。缺少完整派生结构时，系统输出 `missing_information`、warning 和较低置信度，而不是伪造精确度。
