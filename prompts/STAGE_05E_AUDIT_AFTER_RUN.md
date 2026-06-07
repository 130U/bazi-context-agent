$goal
请不要修改代码，不要 commit，不要进入 Stage 6。现在只做 Stage 5E 严格验收审计。

请先读取：
- docs/STAGE_05E_ROADMAP.md
- docs/STAGE_05E_FORECAST_INPUT_BUILDER.md
- docs/STAGE_05E_FORECAST_INPUT_SCHEMA.md
- docs/STAGE_05E_BOUNDARIES.md
- docs/STAGE_05E_API_CONTRACT.md
- docs/STAGE_05E_TESTING.md
- pm_checklists/STAGE_05E_ACCEPTANCE.md

一、运行测试

运行：

npm test

如果 PowerShell 下 node 路径有问题，使用：

$env:Path='C:\Program Files\nodejs;' + $env:Path; npm.cmd test

汇报：
1. 测试命令；
2. 通过数量；
3. 失败数量；
4. 耗时。

二、模块审计

请检查是否存在或等价实现：

1. ForecastInput 类型；
2. ForecastInput builder；
3. ForecastInput validator；
4. data provenance；
5. boundaries metadata；
6. initial value normalization；
7. optional /api/forecast-input；
8. tests。

三、ForecastInput schema 审计

请确认 ForecastInput 包含：

- forecast_input_id
- schema_version
- current_date
- forecast_request
- selected_chart
- derivative_function
- initial_value
- rectification_summary
- data_provenance
- boundaries
- warnings

请确认：
1. derivative_function = BaziDerivedProfile；
2. initial_value 包含 context_box；
3. initial_value 包含 known_life_events；
4. known facts 没有伪装成 prediction；
5. ForecastInput 没有 actual forecast result。

四、边界审计

请确认：

1. Stage 5E 没有调用 OpenAI；
2. Stage 5E 没有调用任何 AI provider；
3. Stage 5E 没有生成未来预测；
4. Stage 5E 没有修改 /api/ranking；
5. Stage 5E 没有修改 /api/rectification-v2；
6. Stage 5E 没有改变 selected chart；
7. Stage 5E 没有重新打分候选盘；
8. context_box 没有参与 rectification；
9. context_box 只进入 initial_value；
10. 没有真实 .env；
11. 没有真实 API key；
12. 没有登录、支付、数据库、用户系统。

五、API 审计

如果存在 /api/forecast-input，请检查：

1. 缺 selected_chart 返回明确错误；
2. 缺 derivative_profile 返回明确错误；
3. 缺 user_question 返回明确错误；
4. valid request 返回 ForecastInput；
5. response metadata.stage = "5E"；
6. response metadata.ai_used = false；
7. response metadata.ready_for_stage6 = true；
8. endpoint 不调用 ranking；
9. endpoint 不调用 rectification scoring；
10. endpoint 不调用 prediction/OpenAI。

如果没有 /api/forecast-input，请确认内部 builder 测试覆盖同等合同。

六、测试覆盖审计

请确认测试覆盖：

1. valid request；
2. missing selected_chart；
3. missing derivative_profile；
4. missing user_question；
5. invalid horizon；
6. invalid domain；
7. derivative_function / initial_value separation；
8. context_box only in initial_value；
9. known_life_events in initial_value；
10. data_provenance；
11. boundaries；
12. selected_chart unchanged；
13. rectification_result unchanged；
14. no secrets；
15. no AI call。

七、对照 checklist

读取：

pm_checklists/STAGE_05E_ACCEPTANCE.md

逐条输出：
- PASS
- FAIL
- PARTIAL

八、最终结论

输出：
1. Stage 5E 是否 PASS；
2. 是否可以 commit；
3. 如果 FAIL/PARTIAL，列出最小修复项；
4. 如果 PASS，建议 commit message；
5. 不要自动修改代码；
6. 不要自动 commit。
