$goal
现在不要修改代码，不要 commit，不要进入 Stage 5D。只做 Stage 5C 严格验收审计。

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

二、模块审计

请检查并汇报是否存在或等价实现：

1. BirthTimeCertainty；
2. BoundaryFlag；
3. RecordedBirthTime；
4. DefaultChart；
5. CandidateChartV2；
6. ChartGenerationPolicy；
7. createDefaultChart；
8. generateCandidateChartsV2；
9. ChartGenerationResult；
10. adapter enrichment hook。

三、DefaultChart 审计

请确认：
1. recorded birth time 可以生成 DefaultChart；
2. DefaultChart 有 chart_id；
3. DefaultChart 有 chart_role="default"；
4. DefaultChart 有 recorded_time_prior_score；
5. DefaultChart 可以包含 derived_profile；
6. adapter 失败不会导致流程 fatal；
7. adapter 失败时有 warnings；
8. 不使用 context_box；
9. 不使用 AI。

四、CandidateChartV2 审计

请确认：
1. exact_to_minute 行为正确；
2. within_1_hour 行为正确；
3. approximate_hour 行为正确；
4. time_range 行为正确；
5. part_of_day 行为正确；
6. unknown_time 行为正确；
7. near_zi_hour 扩展正确；
8. near_hour_boundary 扩展正确；
9. near_solar_term 有 warning/stub；
10. 每个 candidate 有 candidate_id；
11. 每个 candidate 有 generation_reasons；
12. 每个 candidate 有 source；
13. 每个 candidate 可尝试 derived_profile。

五、API / handler 审计

如果新增了 /api/default-chart 或 /api/candidate-charts-v2，请确认：
1. 不调用 /api/ranking；
2. 不调用 rankCandidates；
3. 不调用 /api/prediction；
4. 不调用 AI provider；
5. 不读取 context_box；
6. metadata 标明 ai_used=false；
7. metadata 标明 context_box_used=false；
8. metadata 标明 ranking_performed=false。

如果没有新增 API，请说明 internal module 如何被测试覆盖。

六、边界审计

请确认：
1. /api/ranking 未被改坏；
2. /api/ranking scoring 未被 Stage 5C 修改；
3. context_box 仍不影响 ranking；
4. context_box 仍不影响 chart generation；
5. Stage 4 prediction/report 测试仍通过；
6. 没有新增 AI provider；
7. 没有真实 .env；
8. 没有真实 API key；
9. 没有登录、支付、数据库、用户系统；
10. 没有紫微斗数、奇门、风水扩展。

七、对照 checklist

请读取：

pm_checklists/STAGE_05C_ACCEPTANCE.md

逐项输出：
- PASS
- FAIL
- PARTIAL

八、最终结论

最后输出：
1. Stage 5C 是否 PASS；
2. 是否可以 commit；
3. 如果 FAIL/PARTIAL，列出最小修复项；
4. 如果 PASS，建议 commit message；
5. 不要自动修改代码；
6. 不要自动 commit；
7. 不要进入 Stage 5D。
