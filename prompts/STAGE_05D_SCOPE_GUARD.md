$goal
你正在偏离 Stage 5D 范围。请停止扩展功能并回到 Rectification v2 Scoring。

Stage 5D 只允许做：

1. CandidateRectificationScore；
2. EventTimingFit；
3. DefaultChart protection；
4. RectificationEvidence；
5. RectificationResultV2；
6. optional /api/rectification-v2；
7. tests。

禁止：

1. Stage 5E ForecastInput Builder；
2. Stage 6 Future Forecast；
3. 新 AI provider；
4. OpenAI 调用；
5. 修改 /api/ranking；
6. 修改 /api/prediction；
7. context_box 参与 rectification；
8. UI 框架；
9. 登录、支付、数据库、用户系统；
10. 紫微、奇门、风水；
11. 真实 .env 或 API key。

请移除越界代码，恢复 deterministic rectification scope，运行 npm test，并用中文汇报。
