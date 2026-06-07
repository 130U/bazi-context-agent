$goal
现在不要修改代码，不要 commit，不要进入 Stage 7。只做 Stage 6 严格验收审计。

请运行：

npm test

如果 PowerShell 下 node 路径有问题，使用：

$env:Path='C:\Program Files\nodejs;' + $env:Path; npm.cmd test

一、测试结果

请汇报：
1. 测试命令；
2. 通过数量；
3. 失败数量；
4. 耗时。

二、模块检查

请检查并说明这些模块是否存在或有等价实现：

- future forecast types
- forecast prompt builder
- mock future forecast provider
- forecast schema validator
- forecast policy guard
- future forecast engine
- /api/future-forecast

三、API 合同检查

请检查 /api/future-forecast：

1. 是否只接受 forecast_input；
2. 缺少 forecast_input 是否返回 MISSING_FORECAST_INPUT；
3. 是否不调用 rankCandidates；
4. 是否不调用 rectification v2 scoring；
5. 是否不修改 selected_chart；
6. 是否不修改 rectification_result；
7. 是否不修改 BaziDerivedProfile；
8. 是否不修改 ForecastInput；
9. 是否返回 FutureForecastResult；
10. 是否返回 policy metadata。

四、输出 schema 检查

请确认 FutureForecastResult 包含：

- forecast_result_id
- schema_version
- generated_at
- current_date
- forecast_horizon
- executive_summary
- domain_forecasts
- timeline_windows
- opportunity_windows
- risk_windows
- recommended_actions
- uncertainty
- known_facts_used
- derivative_signals_used
- initial_value_adjustments
- policy

五、边界检查

请确认：

1. AI/provider 不参与 ranking；
2. AI/provider 不参与 rectification；
3. context_box 只作为 initial value；
4. known facts 不被伪装成 prediction；
5. derivative signals 和 initial value adjustments 分开；
6. no real API key；
7. no real .env；
8. tests do not make real network calls；
9. no login/payment/database/user system。

六、对照 checklist

请读取：

pm_checklists/STAGE_06_ACCEPTANCE.md

逐条输出：
- PASS
- FAIL
- PARTIAL

七、最终结论

输出：
1. Stage 6 是否 PASS；
2. 是否可以 commit；
3. 如果 FAIL/PARTIAL，列出最小修复项；
4. 如果 PASS，建议 commit message；
5. 不要自动修改代码；
6. 不要自动 commit。
