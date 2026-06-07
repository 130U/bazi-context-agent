$goal
现在不要修改代码，不要 commit，不要进入 Stage 9。只做 Stage 8 严格验收审计。

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

二、Session / Storage 审计
请检查：
1. 是否存在 SessionState 类型；
2. 是否存在 MemorySessionStore 或等价测试 store；
3. 是否存在 local/session storage wrapper 或等价 client store；
4. 是否支持 save/load/clear；
5. 默认是否 local-first；
6. persistent localStorage 是否需要用户动作；
7. 是否没有数据库；
8. 是否没有云同步；
9. 是否没有用户系统。

三、User Controls 审计
请检查是否支持：
1. hide_from_forecast；
2. hide_from_export；
3. delete_fact；
4. clear_all_local_data；
5. export_session；
6. import_session。

请确认：
- hide_from_forecast 会从 ForecastInput 排除 fact；
- hide_from_export 会从 export/report redacted；
- delete_fact 不保留 value；
- clear_all 会清空本地存储。

四、Export / Import 审计
请检查：
1. JSON export 是否有 schema_version/exported_at/redaction_metadata；
2. export 是否不包含 API key；
3. export 是否不包含 .env 内容；
4. export 是否不包含 hidden-from-export values；
5. import 是否验证 schema；
6. import 是否拒绝 malformed JSON；
7. import 是否拒绝 secret；
8. invalid import 是否不破坏当前 session。

五、Redaction 审计
请确认 redaction 能处理：
1. OPENAI_API_KEY；
2. ANTHROPIC_API_KEY；
3. GitHub token；
4. .env content；
5. api-key-like string；
6. hidden context fact；
7. deleted fact；
8. local absolute path。

六、UI 审计
请检查 UI 是否有：
1. Save Session；
2. Load Session；
3. Export JSON；
4. Import JSON；
5. Clear All Local Data；
6. fact-level hide/delete controls；
7. privacy notice；
8. boundary copy。

七、Boundary 审计
请确认 Stage 8 没有修改：
1. /api/ranking semantics；
2. /api/rectification-v2 semantics；
3. /api/forecast-input semantics；
4. /api/future-forecast semantics；
5. selected_chart；
6. BaziDerivedProfile；
7. RectificationResultV2；
8. ForecastInput；
9. FutureForecastResult。

八、Scope 审计
请确认没有：
1. login；
2. payment；
3. database；
4. cloud sync；
5. user system；
6. analytics tracking；
7. real .env；
8. real API key；
9. new AI provider；
10. React/Next/Vite/Vue/Svelte migration。

九、Checklist
请读取 pm_checklists/STAGE_08_ACCEPTANCE.md，逐条输出 PASS / FAIL / PARTIAL。

十、最终结论
输出：
1. Stage 8 是否 PASS；
2. 是否可以 commit；
3. 如果 FAIL/PARTIAL，列出最小修复项；
4. 如果 PASS，建议 commit message；
5. 不要自动修改代码；
6. 不要自动 commit。
