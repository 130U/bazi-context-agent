$goal
当前工作越界。请停止扩展功能，只保留 Stage 7 Evaluation / Holdout Benchmark 范围。

必须移除或停止：

1. 修改 /api/ranking；
2. 修改 /api/rectification-v2；
3. 修改 /api/forecast-input；
4. 新增真实 AI provider；
5. 测试中调用真实 OpenAI；
6. 创建真实 .env；
7. 写真实 API key；
8. 登录、支付、数据库、用户系统；
9. Stage 8 privacy/storage 功能；
10. 任何声称产品已经被证明更准的文案。

Stage 7 只允许：

- eval case schema
- holdout builder
- leakage guard
- A/B/C/D mode builder
- deterministic judge
- benchmark runner
- fixtures
- tests
- docs

请移除越界内容，重新运行 npm test，并中文汇报。
