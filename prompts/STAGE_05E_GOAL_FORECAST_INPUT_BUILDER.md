$goal
现在进入 Stage 5E：ForecastInput Builder。

当前状态：
- Stage 5B 已建立 BaziEngineAdapter / BaziDerivedProfile。
- Stage 5C 已建立 DefaultChart + CandidateChartV2。
- Stage 5D 已建立 RectificationResultV2。
- Stage 5E 的任务是把「导函数 + initial value」打包成 Stage 6 AI forecast 可消费的 ForecastInput。

核心口径：
- 导函数 = BaziDerivedProfile。
- initial value = context_box + known_life_events + current_state + preferences。
- ForecastInput = 导函数 + initial value + selected chart + rectification summary + current_date + forecast_horizon + user_question。
- Stage 5E 不做预测。
- Stage 6 才做 Future Forecast。

请先读取并遵守：
- AGENTS.md
- docs/GOAL.md
- docs/GAME_RULES.md
- docs/AI_POLICY.md
- docs/STAGE_05E_ROADMAP.md
- docs/STAGE_05E_FORECAST_INPUT_BUILDER.md
- docs/STAGE_05E_DERIVATIVE_PLUS_INITIAL_VALUE.md
- docs/STAGE_05E_FORECAST_INPUT_SCHEMA.md
- docs/STAGE_05E_BOUNDARIES.md
- docs/STAGE_05E_API_CONTRACT.md
- docs/STAGE_05E_TESTING.md
- docs/STAGE_05E_NON_GOALS.md
- docs/STAGE_05E_TO_STAGE_06_HANDOFF.md
- configs/forecast_horizons.stage5e.json
- configs/forecast_domain_mapping.stage5e.json
- configs/forecast_input_policy.stage5e.json
- configs/forecast_input_schema.stage5e.json
- pm_checklists/STAGE_05E_ACCEPTANCE.md

本阶段只允许做：
1. ForecastInput 类型；
2. ForecastInput builder；
3. ForecastInput validator；
4. data provenance；
5. initial value normalization；
6. 可选 /api/forecast-input；
7. tests；
8. Stage 5E docs/checklist 小幅同步。

禁止：
1. 不要调用 OpenAI；
2. 不要调用任何 AI provider；
3. 不要生成未来预测；
4. 不要修改 /api/ranking；
5. 不要修改 /api/rectification-v2；
6. 不要改变 selected chart；
7. 不要重新打分候选盘；
8. 不要让 context_box 参与 rectification；
9. 不要创建真实 .env；
10. 不要写 API key；
11. 不要做登录、支付、数据库、用户系统；
12. 不要做紫微、奇门、风水。

任务一：新增 Stage 5E 类型

建议新增：

- src/forecastInputTypes.ts

至少包含：
- ForecastInputBuildRequest
- ForecastInput
- ForecastHorizon
- ForecastDomain
- ForecastInitialValue
- ForecastDataProvenance
- ForecastInputBoundaries
- ForecastInputValidationResult

任务二：新增 ForecastInput builder

建议新增：

- src/forecastInputBuilder.ts

实现：

buildForecastInput(request: ForecastInputBuildRequest): ForecastInput

要求：
1. 需要 selected_chart；
2. 需要 derivative_profile；
3. 需要 user_question；
4. current_date 必须来自 request 或系统当前日期，不要在生产逻辑硬编码；
5. forecast_horizon 必须来自 configs/forecast_horizons.stage5e.json；
6. forecast_domains 必须根据 configs/forecast_domain_mapping.stage5e.json 或 request 生成；
7. derivative_function 放入 BaziDerivedProfile；
8. initial_value 放入 context_box + known_life_events；
9. known facts 不得伪装成 prediction；
10. 输出 data_provenance；
11. 输出 boundaries；
12. 输出 warnings；
13. 不调用 AI。

任务三：新增 validator

建议新增：

- src/forecastInputValidator.ts

要求：
1. 校验 ForecastInput 必填字段；
2. 校验 horizon/domain；
3. 校验 boundaries 必须包含：
   - ai_used_to_build_forecast_input: false
   - ai_allowed_in_stage6_forecast: true
   - ranking_modified: false
   - rectification_modified: false
   - context_box_used_for_rectification: false
   - secrets_included: false
4. 校验 ForecastInput 不包含 secrets：
   - OPENAI_API_KEY
   - ANTHROPIC_API_KEY
   - GitHub token
   - .env 内容
5. 可以用轻量手写 validator，不强制引入新依赖。

任务四：可选新增 /api/forecast-input

如果 server 结构适合，请新增：

POST /api/forecast-input

输入：
- selected_chart
- rectification_result
- derivative_profile
- context_box
- known_life_events
- user_question
- current_date
- forecast_horizon
- forecast_domains

输出：
- forecast_input
- metadata.stage = "5E"
- metadata.ai_used = false
- metadata.ready_for_stage6 = true

要求：
1. 不调用 /api/ranking；
2. 不调用 /api/rectification-v2；
3. 不调用 /api/prediction；
4. 不调用 OpenAI；
5. 不修改 selected_chart；
6. 不修改 rectification_result；
7. 不包含 secrets。

任务五：测试

新增测试，至少覆盖：

1. valid request builds ForecastInput；
2. missing selected_chart returns error；
3. missing derivative_profile returns error；
4. missing user_question returns error；
5. invalid forecast_horizon rejected；
6. invalid forecast_domain rejected；
7. derivative_function and initial_value are separated；
8. context_box appears only in initial_value；
9. known_life_events appears in initial_value；
10. data_provenance emitted；
11. boundaries emitted；
12. selected_chart unchanged；
13. rectification_result unchanged；
14. no AI provider called；
15. no ranking called；
16. no rectification scoring called；
17. no secrets included；
18. if /api/forecast-input exists, endpoint returns ForecastInput；
19. existing tests continue to pass。

任务六：运行测试

运行：

npm test

如果 PowerShell 下 node 路径有问题，使用：

$env:Path='C:\Program Files\nodejs;' + $env:Path; npm.cmd test

完成后中文汇报：
1. 修改了哪些文件；
2. 新增了哪些 ForecastInput 模块；
3. 是否新增 /api/forecast-input；
4. ForecastInput 是否包含 derivative_function；
5. ForecastInput 是否包含 initial_value；
6. context_box 是否只进入 initial_value；
7. 是否没有生成未来预测；
8. 是否没有调用 AI；
9. 是否没有修改 ranking/rectification；
10. 测试结果；
11. 是否满足 pm_checklists/STAGE_05E_ACCEPTANCE.md。

不要 commit，先等我确认。
