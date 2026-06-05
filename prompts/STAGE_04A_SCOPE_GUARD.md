$goal
请停止扩展功能，先做 Stage 4 scope guard 修复。

你可能违反了 Stage 4 边界。请检查并修复：

1. /api/ranking 是否调用或 import 了 prediction provider；
2. ranking.ts 是否调用或 import 了 OpenAI / Anthropic / LLM；
3. context_box 是否回流影响 ranking；
4. prediction 是否修改 rankingSnapshot、candidate ids、scores、confidence；
5. 是否暴露 API key 到浏览器端；
6. 是否提交了 .env 或真实 key；
7. 是否引入 React/Next/Vite/Vue/Svelte；
8. 是否新增登录、支付、数据库、用户系统；
9. 是否扩展紫微斗数、奇门、风水。

请移除越界内容，保留 Stage 4 合法内容，然后运行 npm test 并中文汇报。
