$goal
请只修复 Stage 6 审计中的 FAIL/PARTIAL 项，不要扩展新功能。

规则：
1. 不要进入 Stage 7。
2. 不要修改 /api/ranking。
3. 不要修改 /api/rectification-v2。
4. 不要修改 /api/forecast-input。
5. 不要让 forecast 修改 selected_chart。
6. 不要让 forecast 修改 BaziDerivedProfile。
7. 不要创建真实 .env。
8. 不要写真实 API key。
9. 不要在测试中发真实网络请求。
10. 不要做登录、支付、数据库、用户系统。

请先复述 FAIL/PARTIAL 项，然后逐项最小修复。

修复后运行：

npm test

如果 PowerShell 下 node 路径有问题，使用：

$env:Path='C:\Program Files\nodejs;' + $env:Path; npm.cmd test

完成后中文汇报：
1. 修复了哪些问题；
2. 修改了哪些文件；
3. 新增/修改了哪些测试；
4. 测试结果；
5. Stage 6 是否现在 PASS；
6. 是否可以 commit。

不要自动 commit。
