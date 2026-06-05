$goal
现在进入 Stage 4A：Context Box + Mock Prediction Layer。

请先读取并遵守：
- AGENTS.md
- docs/GOAL.md
- docs/GAME_RULES.md
- docs/AI_POLICY.md
- docs/API_CONTRACT_ROUND_03.md
- docs/STATE_MANAGEMENT_ROUND_03.md
- docs/STAGE_04_OVERVIEW.md
- docs/STAGE_04A_DELIVERABLES.md
- docs/PREDICTION_LAYER_STAGE_04A.md
- docs/PREDICTION_OUTPUT_SCHEMA_STAGE_04A.md
- docs/PREDICTION_POLICY_STAGE_04A.md
- docs/STAGE_04_NON_GOALS.md
- docs/STAGE_04_TESTING.md
- configs/prediction_domains.v1.json
- configs/prediction_output_schema.v1.json
- configs/prediction_provider_policy.v1.json
- pm_checklists/STAGE_04A_ACCEPTANCE.md

本阶段目标：
在 /api/ranking 完成之后，新增 /api/prediction。prediction 可以读取 rankingSnapshot、contextBox、lifeEvents 和用户问题，生成结构化预测结果。

本阶段只允许 mock provider，不允许真实 OpenAI / Anthropic / LLM provider。

核心边界：
1. /api/ranking 不得使用 context_box。
2. /api/prediction 可以使用 context_box。
3. /api/prediction 不得重新计算 ranking。
4. /api/prediction 不得修改 rankingSnapshot。
5. /api/prediction 不得修改 candidate ids、scores、confidence。
6. AI/prediction 不得参与 birth input、symbol scoring、candidate generation、event backtest、ranking。
7. 本阶段 provider 必须固定为 mock。

任务一：新增类型和模块

建议新增：
- src/predictionTypes.ts
- src/predictionDomain.ts
- src/contextBox.ts
- src/predictionPromptBuilder.ts
- src/mockPredictionProvider.ts
- src/predictionPolicy.ts

类型至少包括：
- PredictionRequest
- PredictionResult
- PredictionDomain
- RankingSnapshot
- PredictionPolicy
- KnownFact
- ChartSignal
- ContextAdjustment
- PredictionProvider

任务二：实现 deterministic domain classifier

输入用户问题，输出 domain：
- education
- career
- wealth
- relationship
- health
- migration
- personality
- family
- general

从 configs/prediction_domains.v1.json 读取关键词规则。不要用 AI 分类。

任务三：实现 mock prediction provider

输出必须符合 configs/prediction_output_schema.v1.json。

PredictionResult 必须区分：
- known_facts
- chart_signals
- context_adjustments
- prediction
- confidence
- uncertainty
- next_questions
- policy

policy 必须包含：
- ai_used_for_ranking: false
- ranking_modified_by_ai: false
- provider: "mock"

任务四：新增 /api/prediction

POST /api/prediction

输入：
- question
- rankingSnapshot
- contextBox
- lifeEvents

要求：
- 没有 rankingSnapshot 时返回明确错误。
- 不允许 /api/prediction 重新调用 ranking。
- 不允许 /api/prediction 修改 rankingSnapshot。
- 可以读取 contextBox。
- provider 固定为 mock。

任务五：最小 UI 更新

在 ranking result 后增加预测区域：
- 问题输入框
- 生成预测按钮
- 展示 conclusion、known_facts、chart_signals、context_adjustments、prediction、confidence、uncertainty、next_questions、policy

继续使用现有本地 server / vanilla HTML / vanilla JS。不要引入 React/Next/Vite/Vue/Svelte。

任务六：测试

新增测试至少覆盖：
1. domain classifier；
2. mock provider 输出完整 schema；
3. /api/prediction 缺少 rankingSnapshot 时返回错误；
4. /api/prediction 不修改 rankingSnapshot；
5. contextBox 改变时 prediction 可以改变，但 ranking 不改变；
6. policy.ai_used_for_ranking === false；
7. policy.ranking_modified_by_ai === false；
8. provider === "mock"；
9. 没有真实 AI provider import/call；
10. npm test 全部通过。

运行：
npm test

如果 PowerShell 下 node 路径有问题，使用：
$env:Path='C:\Program Files\nodejs;' + $env:Path; npm.cmd test

完成后中文汇报：
1. 修改了哪些文件；
2. 新增了哪些 prediction 模块；
3. /api/prediction 是否存在；
4. UI 是否出现 prediction 区域；
5. provider 是否仍然是 mock；
6. 是否没有真实 AI provider；
7. ranking 是否仍然 deterministic；
8. context_box 是否只影响 prediction，不影响 ranking；
9. 测试结果：通过数量、失败数量、耗时；
10. 是否满足 pm_checklists/STAGE_04A_ACCEPTANCE.md。

不要 commit，先等我确认。
