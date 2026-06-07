$goal
你正在偏离 Stage 5C 范围。请停止扩展功能，只回到 DefaultChart + CandidateChart v2。

Stage 5C 只允许：
1. DefaultChart generation；
2. CandidateChartV2 generation；
3. uncertainty / boundary expansion policy；
4. adapter enrichment hook；
5. tests；
6. minimal optional API。

Stage 5C 禁止：
1. Rectification v2 scoring；
2. ForecastInput Builder；
3. Future Forecast Engine；
4. 修改 /api/ranking scoring；
5. context_box 影响 chart generation 或 ranking；
6. AI 参与 chart generation 或 ranking；
7. 新 AI provider；
8. 真实 .env 或 API key；
9. 登录、支付、数据库、用户系统；
10. 紫微、奇门、风水。

请移除越界内容，恢复最小实现，重新运行 npm test，并用中文汇报。
