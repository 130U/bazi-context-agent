$goal
停止当前方向，执行 Stage 4B scope guard。

如果你做了以下任意事情，请立即回滚或移除：

- 让 OpenAI provider 进入 `/api/ranking`
- 让 AI 参与定八字、定时辰、候选盘排序
- 让 context_box 回流 ranking
- 创建真实 `.env`
- 写入真实 API key
- 在浏览器 HTML/JS 中暴露 API key
- 在测试中发真实 OpenAI 网络请求
- 引入 `langchain`、`llamaindex`、`@ai-sdk`
- 做登录、支付、数据库、用户系统
- 做紫微斗数、奇门、风水
- 实现真实完整八字历法
- 进入 Stage 4C

Stage 4B 只允许做：

- provider selection
- OpenAI provider behind env flag
- schema validation
- fake-client tests
- privacy/key docs
- default mock provider

修复后运行测试并汇报。
不要 commit。
