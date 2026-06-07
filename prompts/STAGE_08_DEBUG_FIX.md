$goal
请只修复 Stage 8 审计中的 FAIL/PARTIAL 项，不要扩展新功能。

禁止：
1. 不要进入 Stage 9；
2. 不要改 ranking/rectification/forecast 语义；
3. 不要创建数据库；
4. 不要做登录、支付、用户系统；
5. 不要创建真实 .env；
6. 不要写真实 API key；
7. 不要接新 AI provider；
8. 不要迁移 React/Next/Vite/Vue/Svelte。

允许修复：
- session schema bug；
- storage adapter bug；
- export/import validation bug；
- redaction bug；
- user control bug；
- privacy notice missing；
- tests missing or failing。

请先复述 FAIL/PARTIAL 项，再最小修复。

修复后运行：

npm test

如果 PowerShell 下 node 路径有问题，使用：

$env:Path='C:\Program Files\nodejs;' + $env:Path; npm.cmd test

完成后中文汇报：
1. 修复了哪些问题；
2. 修改了哪些文件；
3. 新增/修改了哪些测试；
4. 测试结果；
5. Stage 8 是否现在 PASS；
6. 是否可以 commit。
不要自动 commit。
