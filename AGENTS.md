# AGENTS.md

## Project Identity

This repository is a BaZi hour-rectification and context-augmented prediction MVP.

Core thesis:

```text
Use traditional hour-rectification symbols as weak priors,
use dated life events for deterministic backtesting,
use a context box to capture real-world initial conditions,
and only then use AI for context-aware prediction.
```

## Hard Rules

1. 定八字、定时辰、候选盘排序阶段禁止使用 AI / LLM 做最终判断。
2. 出生信息、传统 symbol、重大年份回测、Top 3 候选盘排序必须是 deterministic code。
3. AI 只能在候选盘排序完成后，用于信息框整理、预测、解释和报告生成。
4. 不得提交 API key、.env、真实用户数据、私人命例。
5. 所有 scoring weights 必须来自 configs/scoring_weights.v1.json。
6. 所有问卷问题必须来自 configs/question_bank.v1.json。
7. 每轮开发完成后必须运行测试，并报告测试结果。
8. 如果测试失败，必须先修测试，不要继续扩展新功能。
9. 不要把 MVP 做成大而全的玄学平台。
10. 当前 MVP 只做八字定时辰和信息框增强预测，不做紫微斗数、奇门遁甲、风水、付费系统、社交功能或移动 App。

## Required Files to Read Before Major Work

Read these before implementation:

```text
docs/GOAL.md
docs/MVP_SPEC.md
docs/GAME_RULES.md
docs/QUESTIONNAIRE_SPEC.md
docs/SCORING_SPEC.md
docs/DATA_SCHEMA.md
docs/AI_POLICY.md
configs/question_bank.v1.json
configs/scoring_weights.v1.json
```

## Preferred Stack

If the repo is empty, create a TypeScript project. Round 01 uses a minimal Node.js + TypeScript package with no AI provider integration.

## Implementation Style

- Keep modules small.
- Prefer pure functions for scoring.
- Write tests for scoring logic.
- Keep question definitions in JSON config.
- Keep all numeric scoring weights in `configs/scoring_weights.v1.json`.
- Do not hardcode question text in UI or scoring modules.
- Add comments only where they explain product logic.

## Completion Standard

Before stopping, report:

1. What files changed.
2. What behavior was implemented.
3. What tests or checks were run.
4. What remains incomplete.
5. Whether any rule in this file was not followed.
