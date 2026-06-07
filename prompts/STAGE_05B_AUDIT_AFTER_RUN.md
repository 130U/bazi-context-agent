$goal
现在不要修改代码，不要 commit，不要进入 Stage 5C。只做 Stage 5B 严格验收审计。

请运行：

npm test

如果 PowerShell 下 node 路径有问题，使用：

$env:Path='C:\Program Files\nodejs;' + $env:Path; npm.cmd test

请检查：

1. 是否存在 BaziEngineAdapter 类型；
2. 是否存在 RecordedBirthTime / FixedPillars / CandidateChartV2 / BaziDerivedProfile；
3. 是否存在 StaticBaziAdapter；
4. StaticBaziAdapter 是否能从 FixedPillars 输出 BaziDerivedProfile；
5. BaziDerivedProfile 是否包含：
   - profile_id
   - source_chart_id
   - source_libraries
   - calculation_mode
   - pillars
   - day_master
   - five_elements
   - ten_gods
   - hidden_stems
   - nayin
   - stars
   - shensha
   - relations
   - assumptions
   - warnings
6. 如果实现了 LunarJavascriptAdapter，是否被 wrapper 隔离；
7. 如果没有实现 LunarJavascriptAdapter，是否有清楚 fallback 和文档说明；
8. adapter output 是否不包含 context_box facts；
9. adapter 是否没有调用 AI provider；
10. adapter 是否没有读取 OPENAI_API_KEY；
11. /api/ranking 是否仍然 deterministic；
12. /api/ranking 是否仍然不使用 context_box；
13. /api/ranking 是否没有被 adapter 影响；
14. /api/prediction/report 是否仍然通过既有测试；
15. 是否没有新增真实 .env；
16. 是否没有真实 API key；
17. 是否没有登录、支付、数据库、用户系统；
18. 是否没有 React/Next/Vite/Vue/Svelte；
19. 是否满足 pm_checklists/STAGE_05B_ACCEPTANCE.md。

最后输出：
- PASS / FAIL / PARTIAL
- 如果 FAIL/PARTIAL，列出最小修复项；
- 如果 PASS，说明是否可以 commit Stage 5B。

不要自动修改代码。
不要自动 commit。
