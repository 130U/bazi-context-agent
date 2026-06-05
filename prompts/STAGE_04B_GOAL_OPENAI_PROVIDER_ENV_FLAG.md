$goal
现在进入 Stage 4B：Real OpenAI Prediction Provider behind env flag。

前提：Stage 4A 已经 PASS 并 commit。

请先读取并遵守：
- AGENTS.md
- docs/GAME_RULES.md
- docs/AI_POLICY.md
- docs/STAGE_04_OVERVIEW.md
- docs/STAGE_04B_REAL_PROVIDER.md
- docs/OPENAI_PROVIDER_POLICY_STAGE_04B.md
- docs/PREDICTION_OUTPUT_SCHEMA_STAGE_04A.md
- docs/PREDICTION_POLICY_STAGE_04A.md
- docs/STAGE_04_PRIVACY_AND_KEYS.md
- configs/prediction_provider_policy.v1.json
- configs/prediction_output_schema.v1.json
- pm_checklists/STAGE_04B_ACCEPTANCE.md

本阶段目标：
新增真实 OpenAI provider，但只能用于 /api/prediction，且只能在 Top 3 ranking 完成后使用。

核心边界：
1. 默认 provider 仍然是 mock。
2. 只有 PREDICTION_PROVIDER=openai 时才允许使用 real provider。
3. OPENAI_API_KEY 只能从环境变量读取。
4. 不得提交真实 API key。
5. 不得创建 .env 真实文件。
6. 不得在浏览器端暴露 API key。
7. real provider 不得被 /api/ranking、ranking.ts、candidate generation、symbol scoring、event backtest import 或调用。
8. 如果 PREDICTION_PROVIDER=openai 但缺少 OPENAI_API_KEY，应返回明确 provider_config_error；不要静默成功。
9. AI 输出必须经过 schema validation。
10. AI 不得修改 rankingSnapshot、candidate ids、scores、confidence。

任务一：Provider abstraction

如果 Stage 4A 还没有清晰 provider interface，请整理成：
- PredictionProvider interface
- MockPredictionProvider
- OpenAIPredictionProvider
- getPredictionProvider(policy/env)

任务二：OpenAI provider

建议新增：
- src/openaiPredictionProvider.ts 或 src/providers/openaiPredictionProvider.ts
- src/predictionProviderFactory.ts
- src/predictionSchemaValidation.ts

要求：
- 使用服务端代码读取 process.env.OPENAI_API_KEY。
- 使用 process.env.OPENAI_MODEL 指定模型；如果未设置，返回配置错误或使用安全默认占位，不要硬编码不可验证模型。
- API 响应必须转换成 PredictionResult。
- 必须验证输出符合 configs/prediction_output_schema.v1.json。
- 网络/API 错误必须返回明确错误，不得影响 /api/ranking。

任务三：环境示例

创建或更新：
- examples/.env.stage4.example
- 如果已有 .env.example，可只追加占位符，不要写真实 key。

包含：
OPENAI_API_KEY=
PREDICTION_PROVIDER=mock
OPENAI_MODEL=

任务四：测试

新增测试至少覆盖：
1. 默认 provider 是 mock；
2. PREDICTION_PROVIDER=openai 且无 OPENAI_API_KEY 时返回 provider_config_error；
3. OpenAI provider 不会被 ranking 模块 import；
4. /api/ranking 不受 provider env 影响；
5. /api/prediction provider=mock 时仍通过；
6. schema validation 能拒绝缺字段输出；
7. 不存在真实 API key；
8. 不存在 .env 真实文件；
9. API key 不进入 client-side HTML/JS。

重要：不要在测试里真实调用 OpenAI API。使用 mock fetch 或 provider mock。

运行 npm test。

完成后中文汇报：
1. 修改了哪些文件；
2. provider 是否默认 mock；
3. openai provider 是否只在 prediction path；
4. 是否更新了 .env example；
5. 是否没有真实 key；
6. 是否没有真实 API 调用测试；
7. npm test 结果；
8. 是否满足 pm_checklists/STAGE_04B_ACCEPTANCE.md。

不要 commit，先等我确认。
