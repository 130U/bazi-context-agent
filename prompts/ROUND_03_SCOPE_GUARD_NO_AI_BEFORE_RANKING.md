$goal
请停止扩展功能。现在只做 Round 03 越界纠偏。

如果你在 Round 03 中做了以下任何事情，请移除：
- 接 OpenAI / Anthropic / Gemini / LangChain / LlamaIndex / AI SDK；
- 在 candidate ranking 前调用任何 AI / LLM；
- 引入 React / Next.js / Vite / Vue / Svelte；
- 做登录、支付、用户系统；
- 添加数据库；
- 修改 scoring weights；
- 把完整问卷硬编码进 UI；
- 做紫微斗数、奇门、风水；
- 实现真实完整八字历法。

Round 03 只允许：
- 本地 Node HTTP server；
- 轻量 HTML/CSS/vanilla JS；
- 对接已有 deterministic questionnaire/scoring/ranking modules；
- 展示 Top 3 ranking 和 evidence；
- context_box 预览；
- 测试。

请移除越界内容后重新运行 npm test，并用中文汇报：
1. 移除了什么；
2. 保留了什么；
3. 测试是否通过；
4. 是否满足 Round 03 边界。
