$goal
现在进入 Stage 6：Future Forecast Engine。

核心口径：
- 导函数 = BaziDerivedProfile。
- initial value = context_box + known_life_events + current state + preferences。
- Stage 6 的任务是用 ForecastInput 生成 FutureForecastResult。
- Stage 6 可以使用 forecast provider，但不得回头修改定盘、校盘、ranking 或 ForecastInput。

请先读取并遵守：
- AGENTS.md
- docs/GOAL.md
- docs/GAME_RULES.md
- docs/AI_POLICY.md
- docs/STAGE_06_ROADMAP.md
- docs/STAGE_06_FUTURE_FORECAST_ENGINE.md
- docs/STAGE_06_FORECAST_OUTPUT_SCHEMA.md
- docs/STAGE_06_PROMPT_CONTRACT.md
- docs/STAGE_06_PROVIDER_POLICY.md
- docs/STAGE_06_DOMAIN_FORECASTS.md
- docs/STAGE_06_TIME_WINDOWS.md
- docs/STAGE_06_SAFETY_BOUNDARIES.md
- docs/STAGE_06_API_CONTRACT.md
- docs/STAGE_06_TESTING.md
- docs/STAGE_06_NON_GOALS.md
- configs/future_forecast_schema.stage6.json
- configs/forecast_prompt_policy.stage6.json
- configs/forecast_domain_policy.stage6.json
- configs/forecast_time_window_policy.stage6.json
- configs/forecast_safety_policy.stage6.json
- fixtures/stage6_forecast_input.json
- fixtures/stage6_future_forecast_result.mock.json
- pm_checklists/STAGE_06_ACCEPTANCE.md

本阶段目标：
实现 Future Forecast Engine，使系统可以消费 Stage 5E 的 ForecastInput，并返回结构化 FutureForecastResult。

任务一：新增类型

请新增或扩展：

- FutureForecastRequest
- FutureForecastResult
- DomainForecast
- ForecastTimelineWindow
- ForecastWindow
- RecommendedAction
- ForecastUncertainty
- KnownFactReference
- DerivativeSignalReference
- InitialValueAdjustment
- ForecastPolicyMetadata
- FutureForecastProvider

建议文件：
- src/futureForecastTypes.ts
- src/futureForecastSchema.ts
- src/futureForecastPromptBuilder.ts
- src/mockFutureForecastProvider.ts
- src/futureForecastPolicy.ts
- src/futureForecastEngine.ts

任务二：实现 Forecast prompt builder

输入：
- ForecastInput
- options

输出：
- provider-ready prompt/input object

必须分离：
- known facts
- derivative signals
- initial value adjustments
- actual forecast

不要把 known facts 伪装成 prediction。

任务三：实现 mock future forecast provider

本阶段必须至少实现 mock provider。
mock provider 应 deterministic，适合测试。

输出必须符合 configs/future_forecast_schema.stage6.json。

任务四：provider policy

如果已有 Stage 4B provider selection：
- 可以复用现有 provider config。
- 默认仍然必须是 mock。
- 测试中不得发真实网络请求。

如果 openai provider 已存在：
- Stage 6 可以设计 provider boundary，但不要强制要求真实 key。
- 不得创建真实 .env。
- 不得写真实 API key。
- OPENAI_API_KEY 不得进入浏览器端。

任务五：新增 /api/future-forecast

新增或等价实现：

POST /api/future-forecast

输入：
- forecast_input
- options

输出：
- FutureForecastResult

要求：
- 缺少 forecast_input 返回 MISSING_FORECAST_INPUT。
- 不调用 rankCandidates。
- 不调用 rectification v2 scoring。
- 不修改 selected_chart。
- 不修改 rectification_result。
- 不修改 BaziDerivedProfile。
- response.policy 必须证明这些边界。

任务六：schema validation

实现 forecast result schema validation：

- valid mock result passes；
- missing fields fail；
- policy violation fails；
- secrets included fail。

任务七：测试

新增测试，至少覆盖：

1. ForecastInput fixture loads；
2. mock provider returns full schema；
3. /api/future-forecast rejects missing ForecastInput；
4. /api/future-forecast does not call ranking；
5. /api/future-forecast does not call rectification；
6. output validates against schema；
7. known facts are separate from predictions；
8. derivative signals are separate from initial value adjustments；
9. policy fields are correct；
10. no secrets in result；
11. no real network calls in tests；
12. existing tests still pass。

任务八：禁止事项

不要：
- 修改 /api/ranking；
- 修改 /api/rectification-v2；
- 修改 /api/forecast-input；
- 修改 selected chart；
- 修改 BaziDerivedProfile；
- 接新 AI provider 架构；
- 创建真实 .env；
- 写真实 API key；
- 做登录、支付、数据库、用户系统；
- 做 Stage 7 evaluation。

任务九：运行测试

运行：

npm test

如果 PowerShell 下 node 路径有问题，使用：

$env:Path='C:\Program Files\nodejs;' + $env:Path; npm.cmd test

完成后中文汇报：
1. 修改了哪些文件；
2. 新增了哪些 Future Forecast 模块；
3. /api/future-forecast 是否存在；
4. provider 是否默认 mock；
5. 是否没有真实 API key；
6. 是否没有真实 .env；
7. 是否没有真实网络调用；
8. 是否不修改 ranking/rectification/ForecastInput；
9. 测试结果；
10. 是否满足 pm_checklists/STAGE_06_ACCEPTANCE.md。

不要 commit，先等我确认。
