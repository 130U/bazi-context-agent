$goal
现在进入 Stage 4C：Prediction UI + Report Polish。

前提：Stage 4A、Stage 4B 已经 PASS 并 commit。

请先读取并遵守：
- AGENTS.md
- docs/STAGE_04_OVERVIEW.md
- docs/STAGE_04C_UI_REPORT_POLISH.md
- docs/PREDICTION_OUTPUT_SCHEMA_STAGE_04A.md
- docs/PREDICTION_POLICY_STAGE_04A.md
- docs/STAGE_04_NON_GOALS.md
- docs/STAGE_04_TESTING.md
- pm_checklists/STAGE_04C_ACCEPTANCE.md

本阶段目标：
改善 prediction UI 和生成报告雏形，但不要改变 ranking 逻辑，不要新增数据库/登录/支付。

允许：
1. 在现有 vanilla HTML/JS UI 中优化 prediction 展示；
2. 增加 report preview；
3. 增加 export JSON / export Markdown；
4. 增加隐私提示；
5. 增加 provider 状态显示：mock/openai/config_error；
6. 增加错误处理和 loading state。

禁止：
1. 不要引入 React/Next/Vite/Vue/Svelte；
2. 不要让 AI 修改 ranking；
3. 不要让 context_box 回流到 /api/ranking；
4. 不要做 PDF；
5. 不要做登录、支付、数据库、用户系统；
6. 不要做完整八字历法；
7. 不要做紫微斗数、奇门、风水。

UI 输出需要显示：
- conclusion
- known_facts
- chart_signals
- context_adjustments
- prediction.answer
- prediction.confidence
- uncertainty
- next_questions
- policy provider
- ai_used_for_ranking=false
- ranking_modified_by_ai=false

Report preview 需要包含：
- ranking summary
- context box summary
- prediction result
- policy boundary notice
- generated timestamp

测试至少覆盖：
1. /api/prediction response 可以被 UI 渲染；
2. report markdown/export 包含 prediction sections；
3. report 包含 boundary notice；
4. UI 不暴露 API key；
5. ranking 不因 prediction 发生改变；
6. npm test 全部通过。

完成后中文汇报：
1. 修改了哪些文件；
2. UI 展示新增了什么；
3. report/export 新增了什么；
4. 测试结果；
5. 是否满足 pm_checklists/STAGE_04C_ACCEPTANCE.md。

不要 commit，先等我确认。
