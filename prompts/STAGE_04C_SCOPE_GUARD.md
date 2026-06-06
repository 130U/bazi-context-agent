$goal
停止当前越界实现，只做 Stage 4C 范围内的 Prediction UI + Report Polish。

Stage 4C 允许：

- prediction result 展示；
- provider status 展示；
- report builder；
- JSON / Markdown export；
- privacy notice；
- tests；
- vanilla HTML/JS/CSS。

Stage 4C 禁止：

- 修改 /api/ranking scoring；
- 让 AI/provider/context_box 影响 ranking；
- 新增真实数据库；
- 登录、支付、用户系统；
- React / Next / Vite / Vue / Svelte；
- 创建真实 .env；
- 写入真实 API key；
- 在测试中发真实 OpenAI 网络请求；
- 实现真实完整八字历法；
- 紫微斗数、奇门、风水扩展。

请检查当前改动，移除所有越界内容，只保留 Stage 4C 所需最小实现。然后运行 npm test 并汇报。
