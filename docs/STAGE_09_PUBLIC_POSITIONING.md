# Stage 09 Public Positioning

## Public thesis

中文：

本项目不是普通八字排盘器，也不是把八字直接丢给 AI 的 prompt wrapper。它把问题拆成三层：

1. deterministic BaZi pipeline;
2. structured context layer;
3. bounded forecast layer.

English:

This is not a generic BaZi calculator or a thin prompt wrapper. It separates the system into:

1. deterministic BaZi pipeline;
2. structured context layer;
3. bounded forecast layer.

## What to emphasize

- deterministic-first architecture;
- chart/context separation;
- AI boundary;
- local-first privacy;
- evaluation harness;
- stage-based engineering discipline;
- TypeScript + Node + JSON config architecture.

## What not to disclose

- private scoring weights beyond what is already in public configs;
- proprietary questionnaire-to-forecast feature mapping;
- exact prompt recipes;
- internal benchmark cases;
- personal examples from the project owner;
- claims of superior accuracy without Stage 7 benchmark evidence.

## Ethical disclosure requirement

Public README can avoid revealing implementation details, but the product must still tell users that questionnaire answers can be used for personalization, forecasting, and evaluation. Avoid deception. Preserve the competitive advantage by not revealing weight mappings and orchestration details, not by hiding data use from users.
