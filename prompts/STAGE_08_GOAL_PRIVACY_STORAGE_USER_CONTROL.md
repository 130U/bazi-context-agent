$goal
现在进入 Stage 8：Privacy / Storage / User Control。

本阶段目标：
为当前本地产品增加 local-first session、用户数据控制、导出/导入、删除/隐藏、redaction 和 privacy notice。

Stage 8 不做新预测，不改八字，不改定盘，不改校盘，不改 AI 预测逻辑。

请先读取并遵守：
- AGENTS.md
- docs/GOAL.md
- docs/GAME_RULES.md
- docs/AI_POLICY.md
- docs/STAGE_08_ROADMAP.md
- docs/STAGE_08_PRIVACY_STORAGE_USER_CONTROL.md
- docs/STAGE_08_LOCAL_FIRST_SESSION_STORAGE.md
- docs/STAGE_08_SESSION_SCHEMA.md
- docs/STAGE_08_USER_CONTROLS_DELETE_HIDE.md
- docs/STAGE_08_EXPORT_IMPORT.md
- docs/STAGE_08_REDACTION_AND_SENSITIVE_FIELDS.md
- docs/STAGE_08_CONSENT_AND_PRIVACY_COPY.md
- docs/STAGE_08_API_CONTRACT.md
- docs/STAGE_08_TESTING.md
- docs/STAGE_08_NON_GOALS.md
- configs/privacy_policy.stage8.json
- configs/session_storage_policy.stage8.json
- configs/session_schema.stage8.json
- configs/sensitive_fields.stage8.json
- configs/user_controls.stage8.json
- configs/redaction_policy.stage8.json
- configs/export_import_policy.stage8.json
- configs/storage_retention_policy.stage8.json
- pm_checklists/STAGE_08_ACCEPTANCE.md

核心边界：
1. Stage 8 只做 local-first privacy / storage / user control。
2. 不要修改 /api/ranking。
3. 不要修改 /api/rectification-v2。
4. 不要修改 /api/forecast-input 的语义。
5. 不要修改 /api/future-forecast 的预测逻辑。
6. 不要改变 selected_chart、BaziDerivedProfile、RectificationResultV2、ForecastInput、FutureForecastResult。
7. 不要接新 AI provider。
8. 不要创建真实 .env。
9. 不要写真实 API key。
10. 不要做登录、支付、数据库、云同步、用户系统。
11. 不要做 Stage 9 release polish。

任务一：新增 Session 类型和 storage adapter

请新增或扩展：
- SessionState
- ContextFactControl
- UserControlState
- PrivacyMetadata
- SessionExport
- RedactionMetadata
- SessionStore
- MemorySessionStore
- BrowserLocalSessionStore 或等价 client-side storage wrapper

建议文件：
- src/sessionTypes.ts
- src/sessionStore.ts
- src/sessionExport.ts
- src/sessionImport.ts
- src/sessionRedaction.ts
- src/userControls.ts
- src/privacyNotice.ts

如果当前项目结构不适合这些文件名，可以使用等价文件名，但职责必须清晰。

任务二：实现 user controls

必须支持：
1. save session locally；
2. load session locally；
3. export session JSON；
4. import session JSON；
5. hide fact from forecast；
6. hide fact from export/report；
7. delete fact；
8. clear all local data。

规则：
- hide_from_forecast：保留 fact，但 ForecastInput builder 必须排除该 fact。
- hide_from_export：保留 fact，但 export/report 必须 redacted。
- delete_fact：必须移除 value，不得在 metadata 中保留旧值。
- clear_all：必须清空 local/session storage 和 in-memory state。

任务三：实现 redaction

必须 redacted：
- OPENAI_API_KEY；
- ANTHROPIC_API_KEY；
- GitHub token；
- .env 内容；
- API key-like strings；
- hidden-from-export facts；
- deleted fact values；
- local absolute paths, unless already test fixture safe。

Export metadata 必须包含：
- redaction_applied；
- redacted_fields_count；
- secrets_included=false；
- redaction_policy_version。

任务四：实现 export/import

Export：
- 生成 JSON；
- 包含 schema_version/exported_at/session/redaction_metadata；
- 不包含 secrets；
- 不包含 hidden-from-export values；
- 不包含 deleted values。

Import：
- validate schema；
- reject malformed JSON；
- reject secrets；
- reject unsupported schema or return clear warning；
- validation 通过后才替换当前 session；
- invalid import 不得破坏当前 session。

任务五：UI 更新

在当前 local UI 中增加最小用户控制区域：
- Save Session；
- Load Session；
- Export JSON；
- Import JSON；
- Clear All Local Data；
- Context fact controls：hide from forecast / hide from export / delete；
- Privacy notice；
- Boundary copy：context_box 不参与 ranking，AI 不参与 rectification。

不要引入 React / Next / Vite / Vue / Svelte。
继续使用当前 vanilla HTML/JS/local server。

任务六：测试

新增测试，至少覆盖：
1. SessionState fixture validates；
2. MemorySessionStore save/load/clear；
3. export redacts hidden facts；
4. export does not include API keys or .env content；
5. import rejects malformed JSON；
6. import rejects secrets；
7. delete fact removes value；
8. hide_from_forecast excludes fact from ForecastInput；
9. hide_from_export redacts fact from export；
10. clear_all removes stored session；
11. privacy notice is present；
12. /api/ranking semantics unchanged；
13. /api/rectification-v2 semantics unchanged；
14. /api/future-forecast semantics unchanged；
15. no login/payment/database/user system introduced；
16. no real .env or real API key introduced。

任务七：运行测试

运行：

npm test

如果 PowerShell 下 node 路径有问题，使用：

$env:Path='C:\Program Files\nodejs;' + $env:Path; npm.cmd test

完成后中文汇报：
1. 修改了哪些文件；
2. 新增了哪些 session/privacy/user-control 模块；
3. 是否新增 UI controls；
4. 是否新增 export/import；
5. 是否新增 redaction；
6. 是否没有数据库/登录/支付/云同步；
7. 是否没有真实 API key；
8. 是否没有真实 .env；
9. ranking/rectification/forecast 语义是否未被修改；
10. 测试结果；
11. 是否满足 pm_checklists/STAGE_08_ACCEPTANCE.md。

不要 commit，先等我确认。
