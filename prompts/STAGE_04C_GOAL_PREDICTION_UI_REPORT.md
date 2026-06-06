$goal
Stage 4C：Prediction UI + Report Polish。

目标：
在 Stage 4A/4B 已完成的 prediction layer 基础上，完善预测结果展示、报告预览、JSON/Markdown 导出、隐私提示和 provider 状态展示。

请先读取并遵守：

- AGENTS.md
- docs/GOAL.md
- docs/GAME_RULES.md
- docs/AI_POLICY.md
- docs/STAGE_04_OVERVIEW.md
- docs/STAGE_04C_UI_REPORT_POLISH.md
- docs/STAGE_04C_REPORT_SCHEMA.md
- docs/STAGE_04C_EXPORTS.md
- docs/STAGE_04C_PRIVACY_COPY.md
- docs/STAGE_04C_PROVIDER_STATUS.md
- docs/STAGE_04C_TESTING.md
- docs/STAGE_04C_NON_GOALS.md
- configs/report_sections.stage4c.json
- configs/ui_copy.stage4c.json
- pm_checklists/STAGE_04C_ACCEPTANCE.md

核心边界：

1. 不修改 /api/ranking 的 scoring 逻辑。
2. 不让 AI / provider 参与 birth input、symbol scoring、candidate generation、event backtest、candidate ranking。
3. 不让 context_box 回流到 /api/ranking。
4. /api/prediction 可以使用 context_box，但不得修改 rankingSnapshot、candidate ids、scores、confidence。
5. Stage 4C 只做展示、报告和导出，不做新的预测算法。
6. 不创建真实 .env。
7. 不写入真实 API key。
8. 不把 OPENAI_API_KEY 暴露到 HTML / browser JS / export 报告。
9. 不做登录、支付、数据库、用户系统。
10. 不引入 React / Next / Vite / Vue / Svelte。
11. 不实现真实完整八字历法。
12. 测试不得发起真实 OpenAI 网络请求。

任务一：新增报告类型和 report builder

建议新增：

- src/reportTypes.ts
- src/reportBuilder.ts
- src/reportMarkdown.ts
- src/reportRedaction.ts

Report 必须包含：

- report_id
- generated_at
- version
- ranking_snapshot_summary
- selected_candidate_summary
- context_box_summary
- prediction_result
- policy
- privacy_notice
- export_metadata

Report 必须排除：

- API key
- raw provider request
- raw provider response
- internal env values
- hidden/private debug fields

任务二：新增 /api/report

新增：

POST /api/report

输入：

- rankingSnapshot
- contextBox
- predictionResult
- exportFormat: "json" | "markdown"

输出：

- json report object，或 markdown report string；
- policy 信息；
- privacy notice；
- export metadata。

要求：

- 缺少 rankingSnapshot 返回明确错误；
- 缺少 predictionResult 返回明确错误；
- 不重新调用 /api/ranking；
- 不重新调用 /api/prediction；
- 不修改 rankingSnapshot；
- 不调用 OpenAI provider；
- 不发真实网络请求。

任务三：完善 UI

在现有本地 vanilla HTML / JS UI 中增加：

1. prediction result 的结构化展示：
   - conclusion
   - known_facts
   - chart_signals
   - context_adjustments
   - prediction
   - confidence
   - uncertainty
   - next_questions
   - policy

2. provider status 展示：
   - provider: mock / openai / mock_fallback
   - output_schema_validated
   - ai_used_for_ranking=false
   - ranking_modified_by_ai=false
   - 不显示任何 API key 或 env value

3. report preview：
   - 显示 Markdown preview 或结构化 report preview；
   - 明确提示报告包含用户主动填写的信息；
   - 明确提示 context_box 不参与 ranking，只参与 prediction。

4. export buttons：
   - Export JSON
   - Export Markdown

导出可以通过浏览器 Blob/object URL 或 server 返回文本实现。
不要引入前端框架。
不要引入数据库。

任务四：隐私和边界提示

UI 和 report 中必须显示：

1. 定八字 / candidate ranking 是 deterministic；
2. AI/provider 不参与 ranking；
3. context_box 不参与 ranking；
4. context_box 只用于 prediction；
5. 用户导出的报告可能包含个人信息；
6. 不会导出 API key；
7. Stage 4C 不提供医疗、法律、金融确定性建议。

任务五：测试

新增或更新测试，至少覆盖：

1. report builder 输出完整 schema；
2. report builder 不包含 API key；
3. report builder 不包含 raw provider request/response；
4. markdown export 包含核心 section；
5. JSON export 可序列化；
6. /api/report 缺少 rankingSnapshot 时返回错误；
7. /api/report 缺少 predictionResult 时返回错误；
8. /api/report 不重新调用 ranking；
9. /api/report 不重新调用 prediction；
10. /api/report 不修改 rankingSnapshot；
11. provider status 不暴露 OPENAI_API_KEY；
12. UI HTML 包含 prediction 区域、report preview、export buttons、privacy notice；
13. /api/ranking 仍不使用 context_box；
14. /api/ranking 仍不使用 AI/provider；
15. /api/prediction 仍不修改 rankingSnapshot；
16. 没有真实 .env；
17. 没有真实 API key；
18. 没有 React / Next / Vite / Vue / Svelte；
19. 没有登录、支付、数据库、用户系统；
20. npm test 全部通过。

任务六：文档和 checklist

如果本轮实现与 repo 文件有差异，请同步更新：

- docs/STAGE_04C_UI_REPORT_POLISH.md
- docs/STAGE_04C_REPORT_SCHEMA.md
- docs/STAGE_04C_EXPORTS.md
- docs/STAGE_04C_PRIVACY_COPY.md
- docs/STAGE_04C_PROVIDER_STATUS.md
- docs/STAGE_04C_TESTING.md
- pm_checklists/STAGE_04C_ACCEPTANCE.md

任务七：运行测试

运行：

npm test

如果 PowerShell 下 node 路径有问题，使用：

$env:Path='C:\Program Files\nodejs;' + $env:Path; npm.cmd test

完成后用中文汇报：

1. 修改了哪些文件；
2. 新增了哪些 report/UI 模块；
3. /api/report 是否存在；
4. UI 是否有 prediction display / report preview / export buttons / privacy notice；
5. report 是否不会泄露 API key；
6. /api/ranking 是否仍然 deterministic 且不使用 context_box/AI；
7. /api/prediction 是否仍不修改 rankingSnapshot；
8. 测试结果：通过数量、失败数量、耗时；
9. 是否满足 pm_checklists/STAGE_04C_ACCEPTANCE.md。

不要 commit，先等我确认。
