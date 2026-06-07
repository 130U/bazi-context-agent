$goal
现在进入 Stage 5A：BaZi Derived Function Engine Research + Adapter Strategy。

核心口径：
- 导函数 = 八字 + 八字派生运势结构。
- initial value = 问卷得到的现实初始状态。
- 预测 = AI 使用导函数 + initial value + 当前日期来推未来。
- Stage 5 的任务是求导函数，不是重造完整八字历法引擎，也不是让 AI 定盘。

当前项目状态：
Stage 0–4C 已完成。
Stage 4C 已实现 prediction report UI/export。
现在不要进入 Stage 6，不要做 forecast。
先解决“如何稳定生成八字导函数”。

请先读取并遵守：
- AGENTS.md
- docs/GOAL.md
- docs/GAME_RULES.md
- docs/AI_POLICY.md
- docs/STAGE_04_OVERVIEW.md
- docs/STAGE_04_NON_GOALS.md
- pm_checklists/STAGE_04_FINAL_ACCEPTANCE.md
- docs/PROJECT_ROADMAP_V4_DERIVED_FUNCTION.md
- docs/STAGE_05_MASTER_PLAN_DERIVED_FUNCTION.md
- docs/STAGE_05A_LIBRARY_RESEARCH_SPEC.md
- docs/STAGE_05B_ADAPTER_SPEC.md
- docs/STAGE_05C_DEFAULT_AND_CANDIDATE_CHART_SPEC.md
- docs/STAGE_05D_RECTIFICATION_V2_SPEC.md
- docs/STAGE_05E_FORECAST_INPUT_BUILDER_SPEC.md
- pm_checklists/STAGE_05_MASTER_ACCEPTANCE.md

本阶段只做：
1. research；
2. adapter strategy；
3. 文档；
4. 可选最小 spike。

不要大规模改业务代码。
不要修改 /api/ranking。
不要让 context_box 影响 ranking。
不要让 AI 参与 ranking。
不要接新 AI provider。
不要创建真实 .env。
不要写真实 API key。
不要进入 Stage 6 forecast。

任务一：调研可嫁接项目

请比较：

1. 6tail/lunar-javascript
2. mystilight/mystilight-8char
3. VedAstro/VedAstro
4. afjoseph/sacredstar
5. naturalstupid/PyJHora
6. tommitoan/bazica
7. 其他你认为相关的 BaZi / birth-time rectification 项目

重点比较：

- 是否开源；
- license；
- stars/forks/release activity；
- runtime/language；
- TypeScript/Node 接入难度；
- 是否支持八字八变量；
- 是否支持从 birth datetime 输入；
- 是否支持从 fixed pillars 输入；
- 是否支持五行；
- 是否支持十神；
- 是否支持藏干；
- 是否支持纳音；
- 是否支持星宿；
- 是否支持神煞；
- 是否支持冲合刑害；
- 是否支持大运；
- 是否支持流年；
- 是否支持 current year / current luck；
- 是否支持 birth-time rectification；
- 是否能作为主库；
- 是否能作为 enrichment 库；
- 是否只适合作为参考；
- 集成风险。

任务二：输出结论

请明确回答：

1. 是否存在“完美可嫁接”的八字 birth-time rectification 开源项目；
2. 如果不存在，推荐我们自建哪一层；
3. 推荐主库；
4. 推荐 enrichment 库；
5. 推荐参考库；
6. 不推荐库及原因；
7. 是否采用双 adapter：
   - base adapter: 6tail/lunar-javascript
   - enrichment adapter: mystilight-8char
8. VedAstro 是否只作为 rectification architecture reference。

任务三：创建或更新 Stage 5 文档

请创建或更新：

- docs/STAGE_05A_LIBRARY_RESEARCH_RESULT.md
- docs/STAGE_05_ADAPTER_DECISION.md

文档必须写清楚：

1. 导函数定义；
2. initial value 定义；
3. 问卷的双用途：
   - major dated events 用于 rectification；
   - context_box 用于 forecast initial value；
4. DefaultChart 来自用户记录时间；
5. CandidateChart 只在时间不确定时生成；
6. BaziDerivedProfile 来自 adapter；
7. context_box 不进入 rectification ranking；
8. AI 不参与定盘；
9. Stage 5 不做 final forecast；
10. Stage 6 才做 Future Forecast Engine。

任务四：可选最小 spike

如果可以不安装依赖完成调研，就不要安装。
如果需要 spike，只允许做最小 spike，并满足：

1. 不影响 /api/ranking；
2. 不影响 /api/prediction；
3. 不影响 Stage 4 report；
4. 不让 context_box 回流 ranking；
5. 不接新 AI provider；
6. 有测试；
7. npm test 通过。

任务五：测试

如果只新增 docs，运行现有测试即可。
如果新增代码 spike，必须新增测试。

运行：

npm test

如果 PowerShell 下 node 路径有问题，使用：

$env:Path='C:\Program Files\nodejs;' + $env:Path; npm.cmd test

完成后中文汇报：

1. 是否存在完美可嫁接 rectification 项目；
2. 推荐主库；
3. 推荐 enrichment 库；
4. 推荐参考库；
5. 创建/修改了哪些文件；
6. 是否安装依赖；
7. 是否修改 src；
8. 是否影响 /api/ranking；
9. context_box 是否仍不影响 ranking；
10. 测试结果；
11. 是否可以进入 Stage 5B。

不要 commit，先等我确认。
