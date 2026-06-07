$goal
你正在偏离 Stage 5E 范围。请停止扩展功能，只保留 ForecastInput Builder。

Stage 5E 只允许：
1. ForecastInput types；
2. ForecastInput builder；
3. ForecastInput validator；
4. data provenance；
5. boundaries metadata；
6. 可选 /api/forecast-input；
7. tests。

请移除或回滚以下越界内容：
1. OpenAI 调用；
2. 新 AI provider；
3. Future Forecast 生成；
4. ranking 修改；
5. rectification scoring 修改；
6. context_box 参与 rectification；
7. selected chart mutation；
8. 真实 .env；
9. API key；
10. 登录、支付、数据库、用户系统；
11. 紫微、奇门、风水。

完成后运行 npm test，并用中文汇报修复内容。
