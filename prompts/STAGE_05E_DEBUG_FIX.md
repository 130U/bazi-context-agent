$goal
请只修复 Stage 5E 审计中的 FAIL/PARTIAL 项，不要扩展新功能。

规则：
1. 不要进入 Stage 6。
2. 不要调用 OpenAI。
3. 不要调用任何 AI provider。
4. 不要生成未来预测。
5. 不要修改 /api/ranking。
6. 不要修改 /api/rectification-v2。
7. 不要让 context_box 参与 rectification。
8. 不要改变 selected chart。
9. 不要创建真实 .env。
10. 不要写 API key。
11. 不要做登录、支付、数据库、用户系统。

请先复述审计中的 FAIL/PARTIAL 项，然后最小修复。

允许修复：
- ForecastInput schema 字段缺失；
- builder input validation；
- data provenance；
- boundaries metadata；
- initial_value normalization；
- no-secrets validator；
- /api/forecast-input 合同；
- tests。

修复后运行：

npm test

如果 PowerShell 下 node 路径有问题，使用：

$env:Path='C:\Program Files\nodejs;' + $env:Path; npm.cmd test

完成后中文汇报：
1. 修复了哪些问题；
2. 修改了哪些文件；
3. 新增/修改了哪些测试；
4. 测试结果；
5. Stage 5E 是否现在 PASS；
6. 是否可以 commit。

不要自动 commit。
