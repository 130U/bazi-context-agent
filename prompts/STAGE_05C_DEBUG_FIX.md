$goal
请只修复 Stage 5C 审计中的 FAIL/PARTIAL 项，不要扩展新功能。

规则：
1. 不要进入 Stage 5D。
2. 不要做 Rectification v2 scoring。
3. 不要做 ForecastInput Builder。
4. 不要进入 Stage 6 forecast。
5. 不要修改 /api/ranking scoring。
6. 不要让 context_box 进入 chart generation。
7. 不要让 AI 参与 chart generation。
8. 不要接新 AI provider。
9. 不要创建真实 .env。
10. 不要写真实 API key。
11. 不要做 UI 大改。
12. 不要做登录、支付、数据库、用户系统。

请先复述审计中的 FAIL/PARTIAL 项，然后逐项最小修复。

允许修复：
- 类型缺失；
- DefaultChart generator bug；
- CandidateChartV2 generator bug；
- boundary expansion bug；
- adapter failure handling；
- metadata 缺失；
- 测试缺失；
- 文档/checklist 不一致。

修复后运行：

npm test

如果 PowerShell 下 node 路径有问题，使用：

$env:Path='C:\Program Files\nodejs;' + $env:Path; npm.cmd test

完成后中文汇报：
1. 修复了哪些问题；
2. 修改了哪些文件；
3. 新增/修改了哪些测试；
4. 测试结果；
5. Stage 5C 是否现在 PASS；
6. 是否可以 commit。

不要自动 commit。
