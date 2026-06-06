$goal
请只修复 Stage 4C 审计中的 FAIL/PARTIAL 项，不要扩展新功能。

规则：

1. 不要进入 Stage 5。
2. 不要修改 /api/ranking 边界。
3. 不要让 context_box 回流 ranking。
4. 不要让 prediction/report 修改 rankingSnapshot、candidate ids、scores、confidence。
5. 不要创建真实 .env。
6. 不要写入真实 API key。
7. 不要在测试中发真实 OpenAI 网络请求。
8. 不要把 API key 暴露到 browser HTML/JS/export report。
9. 不要引入 React / Next / Vite / Vue / Svelte。
10. 不要做登录、支付、数据库、用户系统。
11. 不要做紫微斗数、奇门、风水。
12. 不要实现真实完整八字历法。

请先复述审计中的 FAIL/PARTIAL 项，然后逐项最小修复。

允许修复：

- report schema 字段缺失；
- markdown/json export bug；
- privacy notice 缺失；
- provider status 泄露风险；
- /api/report 输入校验；
- report redaction；
- 缺少测试；
- UI 缺少 report preview/export button；
- 文档/checklist 不一致。

禁止修复：

- 接新 provider；
- 改 ranking scoring；
- 改 Stage 4B provider selection；
- 添加数据库；
- 添加前端框架。

修复后运行：

npm test

如果 PowerShell 下 node 路径有问题，使用：

$env:Path='C:\Program Files\nodejs;' + $env:Path; npm.cmd test

完成后中文汇报：

1. 修复了哪些问题；
2. 修改了哪些文件；
3. 新增/修改了哪些测试；
4. 测试结果；
5. Stage 4C 是否现在 PASS；
6. 是否可以 commit。

不要自动 commit。
