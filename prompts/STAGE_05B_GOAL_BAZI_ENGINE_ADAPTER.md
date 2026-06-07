$goal
现在进入 Stage 5B：BaziEngineAdapter Interface + Minimal Adapter Implementation。

核心口径：
- 导函数 = 八字八变量 + 八字派生运势结构。
- Stage 5B 的任务是建立“导函数 adapter 层”。
- Stage 5B 不做 rectification v2，不做 future forecast。

请先读取并遵守：
- AGENTS.md
- docs/GOAL.md
- docs/GAME_RULES.md
- docs/AI_POLICY.md
- docs/PROJECT_ROADMAP_V4_DERIVED_FUNCTION.md
- docs/STAGE_05_MASTER_PLAN_DERIVED_FUNCTION.md
- docs/STAGE_05B_ADAPTER_SPEC.md
- docs/STAGE_05B_ADAPTER_ROADMAP.md
- docs/STAGE_05B_BAZI_ENGINE_ADAPTER.md
- docs/STAGE_05B_PROFILE_SCHEMA.md
- docs/STAGE_05B_LUNAR_JAVASCRIPT_ADAPTER.md
- docs/STAGE_05B_TESTING.md
- docs/STAGE_05B_NON_GOALS.md
- configs/bazi_adapter_policy.stage5b.json
- configs/bazi_derived_profile.schema.stage5b.json
- pm_checklists/STAGE_05B_ACCEPTANCE.md

本阶段目标：
1. 新增 BaziEngineAdapter 类型和核心输入/输出类型。
2. 新增 BaziDerivedProfile schema。
3. 新增 StaticBaziAdapter，保证 fixed pillars 模式可测试。
4. 可尝试新增 LunarJavascriptAdapter，包装 6tail/lunar-javascript。
5. 如果 lunar-javascript 无法安装或导入，不要阻塞；保留 adapter boundary 和 StaticBaziAdapter。
6. 新增测试，证明 adapter 不影响 ranking、不读取 context_box、不调用 AI。

任务一：新增类型

建议新增文件：
- src/baziTypes.ts
- src/baziEngineAdapter.ts

至少定义：
- RecordedBirthTime
- FixedPillars
- CandidateChartV2
- BaziDerivedProfile
- BaziEngineAdapter
- BaziAdapterPolicy
- BaziCalculationMode

任务二：新增 StaticBaziAdapter

建议文件：
- src/staticBaziAdapter.ts

要求：
- 输入 FixedPillars；
- 输出 BaziDerivedProfile；
- day_master 取 day.stem；
- five_elements 可先返回占位统计或 null placeholders；
- ten_gods / hidden_stems / nayin / stars / shensha / relations 可先为空数组；
- 必须添加 warnings，说明 static adapter 无法计算完整大运流年；
- source_libraries = ["static-adapter"]。

任务三：可选 LunarJavascriptAdapter

建议文件：
- src/lunarJavascriptAdapter.ts

允许尝试安装：

npm install lunar-javascript

要求：
- 如果安装成功，新增 adapter wrapper；
- 如果安装失败，不要强行失败，不要破坏测试；
- adapter output 必须 normalize 成 BaziDerivedProfile；
- 不允许第三方库输出直接泄露到业务层，raw 只能放到 raw 字段。

任务四：adapter selection

建议文件：
- src/baziAdapterFactory.ts

要求：
- 默认优先使用可用的 lunar adapter；
- 不可用时 fallback 到 StaticBaziAdapter；
- 不得因为 adapter 不可用影响 Stage 0–4 的 ranking/prediction/report。

任务五：测试

新增测试，建议：
- tests/baziAdapter.test.ts

至少覆盖：
1. StaticBaziAdapter fixed pillars -> BaziDerivedProfile；
2. BaziDerivedProfile required fields 完整；
3. missing derived fields 以 empty arrays / warnings 表达，不 crash；
4. adapter output 不包含 context_box；
5. adapter 不调用 AI provider；
6. adapter 不读取 OPENAI_API_KEY；
7. /api/ranking 输出不因 adapter 模块存在而改变；
8. npm test 全部通过。

任务六：边界

禁止：
- 不要改 /api/ranking scoring；
- 不要让 context_box 影响 ranking；
- 不要让 AI 参与 chart derivation；
- 不要进入 Stage 5C/5D/5E；
- 不要做 future forecast；
- 不要创建真实 .env；
- 不要写 API key；
- 不要做登录、支付、数据库、用户系统；
- 不要引入 React/Next/Vite/Vue/Svelte。

任务七：运行测试

运行：

npm test

如果 PowerShell 下 node 路径有问题，使用：

$env:Path='C:\Program Files\nodejs;' + $env:Path; npm.cmd test

完成后用中文汇报：
1. 修改了哪些文件；
2. 是否安装 lunar-javascript；
3. 是否新增 StaticBaziAdapter；
4. 是否新增 LunarJavascriptAdapter；
5. BaziDerivedProfile 是否能从 fixed pillars 生成；
6. adapter 是否影响 /api/ranking；
7. context_box 是否仍不影响 ranking；
8. 是否没有 AI provider import/call；
9. 测试结果；
10. 是否满足 STAGE_05B_ACCEPTANCE.md。

不要 commit，先等我确认。
