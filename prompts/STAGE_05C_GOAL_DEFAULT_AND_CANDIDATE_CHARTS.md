$goal
现在进入 Stage 5C：DefaultChart + CandidateChart v2。

核心定位：
Stage 5B 已经建立 BaziEngineAdapter / BaziDerivedProfile 的边界。
Stage 5C 要把用户记录出生时间转成 DefaultChart，并在时间不确定时生成 CandidateChartV2[]。

这一步是在求“导函数”的入口：

RecordedBirthTime
  ↓
DefaultChart
  ↓
CandidateChartV2[] if uncertain
  ↓
BaziEngineAdapter
  ↓
BaziDerivedProfile

本阶段不做 Rectification v2 scoring，不做 AI forecast。

请先读取并遵守：
- AGENTS.md
- docs/GOAL.md
- docs/GAME_RULES.md
- docs/AI_POLICY.md
- docs/STAGE_05_MASTER_PLAN_DERIVED_FUNCTION.md
- docs/STAGE_05B_ADAPTER_ROADMAP.md
- docs/STAGE_05B_BAZI_ENGINE_ADAPTER.md
- docs/STAGE_05B_PROFILE_SCHEMA.md
- docs/STAGE_05C_ROADMAP.md
- docs/STAGE_05C_DEFAULT_CHART.md
- docs/STAGE_05C_CANDIDATE_CHART_V2.md
- docs/STAGE_05C_BIRTH_TIME_WINDOW_POLICY.md
- docs/STAGE_05C_ADAPTER_INTEGRATION.md
- docs/STAGE_05C_API_CONTRACT.md
- docs/STAGE_05C_NON_GOALS.md
- configs/chart_generation_policy.stage5c.json
- configs/birth_time_certainty.stage5c.json
- configs/boundary_expansion_policy.stage5c.json
- pm_checklists/STAGE_05C_ACCEPTANCE.md

硬边界：
1. 不要修改 /api/ranking scoring。
2. 不要让 context_box 影响 DefaultChart 或 CandidateChartV2 generation。
3. 不要让 AI 参与 DefaultChart 或 CandidateChartV2 generation。
4. 不要进入 Stage 5D Rectification v2 scoring。
5. 不要进入 Stage 5E ForecastInput Builder。
6. 不要进入 Stage 6 forecast。
7. 不要接新 AI provider。
8. 不要创建真实 .env。
9. 不要写真实 API key。
10. 不要做登录、支付、数据库、用户系统。
11. 不要做大规模 UI 改动。

任务一：新增或完善类型

请基于 Stage 5B 已有类型，新增或完善：

- BirthTimeCertainty
- BoundaryFlag
- RecordedBirthTime
- DefaultChart
- CandidateChartV2
- ChartGenerationPolicy
- CandidateGenerationInput
- ChartGenerationResult

如果 Stage 5B 已有相关类型，请复用，不要重复定义冲突类型。

任务二：实现 DefaultChart generator

实现函数，例如：

createDefaultChart(recordedBirthTime, adapter, policy): DefaultChart

要求：
1. 输入合法 RecordedBirthTime。
2. 输出 DefaultChart。
3. 根据 certainty 计算 recorded_time_prior_score。
4. 调用 BaziEngineAdapter 生成 derived_profile。
5. adapter 失败时不要 fatal；返回 warnings。
6. 不使用 AI。
7. 不使用 context_box。

任务三：实现 CandidateChartV2 generator

实现函数，例如：

generateCandidateChartsV2(input): ChartGenerationResult

要求：
1. 总是包含 DefaultChart。
2. 只有用户时间不确定或存在 boundary_flags 时才生成额外 candidates。
3. 根据 certainty 和 boundary_flags 生成候选：
   - exact_to_minute：默认盘；若有 boundary flag，则加入相邻候选；
   - within_1_hour：默认盘 + 前后相邻时辰；
   - approximate_hour：默认盘 + 前后相邻时辰；
   - time_range：时间段覆盖的全部时辰 + 边界扩展；
   - part_of_day：上午/下午/晚上/夜间对应时辰集合；
   - unknown_time：当天 12 时辰；
   - unknown_date：日期 ±1 天候选，数量可 cap，并输出 warning。
4. near_zi_hour 必须扩展子时相关候选。
5. near_hour_boundary 必须加入相邻时辰。
6. near_solar_term 可以先生成 warning 或 stub，但接口必须存在。
7. 每个 candidate 应有 generation_reasons。
8. 每个 candidate 尽量通过 adapter 生成 derived_profile。
9. adapter 失败时保留 candidate 并写 warnings。
10. 不做 event-based rectification scoring。

任务四：可选 API / handler

如果项目现有 server 架构适合，请新增：

POST /api/default-chart
POST /api/candidate-charts-v2

要求：
- 只调用 Stage 5C generator；
- 不调用 /api/ranking；
- 不调用 /api/prediction；
- 不使用 context_box；
- 不使用 AI；
- response metadata 必须说明：
  - ai_used: false
  - context_box_used: false
  - ranking_performed: false
  - stage: "5C"

如果不适合加 API，可以只做 internal module，但必须有测试。

任务五：测试

新增或更新测试，至少覆盖：

1. exact_to_minute 生成 DefaultChart；
2. within_1_hour 生成默认盘 + 相邻候选；
3. time_range 生成范围内候选；
4. part_of_day 生成对应时辰候选；
5. unknown_time 生成 12 时辰或按 policy cap；
6. near_zi_hour 扩展子时候选；
7. near_hour_boundary 加入相邻候选；
8. near_solar_term 返回 warning/stub；
9. adapter 成功时 derived_profile 存在；
10. adapter 失败时 warning 存在且流程不 fatal；
11. generation 不读取 context_box；
12. generation 不调用 AI；
13. /api/ranking 现有测试仍通过；
14. Stage 4 prediction/report 测试仍通过。

任务六：运行测试

运行：

npm test

如果 PowerShell 下 node 路径有问题，使用：

$env:Path='C:\Program Files\nodejs;' + $env:Path; npm.cmd test

完成后中文汇报：
1. 修改/新增了哪些文件；
2. 是否新增 DefaultChart generator；
3. 是否新增 CandidateChartV2 generator；
4. 是否新增 API；
5. 是否调用 Stage 5B adapter；
6. adapter 失败时如何处理；
7. /api/ranking 是否未被修改；
8. context_box 是否仍不影响 chart generation；
9. 是否没有 AI 参与 chart generation；
10. 测试结果：通过数量、失败数量、耗时；
11. 是否满足 pm_checklists/STAGE_05C_ACCEPTANCE.md。

不要 commit，先等我确认。
