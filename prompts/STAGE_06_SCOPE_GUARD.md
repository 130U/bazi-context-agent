$goal
停止当前越界工作，回到 Stage 6 边界。

Stage 6 只允许：
- consume ForecastInput
- build forecast prompt/input
- call mock/openai forecast provider through existing policy
- return FutureForecastResult
- validate schema
- test boundaries

Stage 6 禁止：
- 修改 /api/ranking
- 修改 /api/rectification-v2
- 修改 /api/forecast-input
- 让 AI 参与定盘或校盘
- 创建真实 .env
- 写真实 API key
- 做登录、支付、数据库、用户系统
- 做 Stage 7 evaluation
- 做 release polish

请移除越界改动，恢复到 Stage 6 合法范围，运行 npm test，并用中文汇报。
