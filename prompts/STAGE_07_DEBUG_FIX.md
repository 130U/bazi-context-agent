$goal
请只修复 Stage 7 审计中的 FAIL/PARTIAL 项，不要扩展新功能。

禁止：
- 不要进入 Stage 8
- 不要修改 /api/ranking
- 不要修改 /api/rectification-v2
- 不要修改 /api/forecast-input
- 不要调用真实 AI provider
- 不要创建真实 .env
- 不要写真实 API key
- 不要做登录、支付、数据库、用户系统

请先复述 FAIL/PARTIAL 项，然后逐项最小修复。

允许修复：
- eval case schema
- holdout builder
- leakage guard
- mode builder
- deterministic judge
- benchmark runner
- tests
- docs/checklist 不一致

修复后运行：

npm test

如果 PowerShell 下 node 路径有问题，使用：

$env:Path='C:\Program Files\nodejs;' + $env:Path; npm.cmd test

完成后中文汇报：
1. 修复了哪些问题；
2. 修改了哪些文件；
3. 新增/修改了哪些测试；
4. 测试结果；
5. Stage 7 是否 PASS；
6. 是否可以 commit。

不要自动 commit。
