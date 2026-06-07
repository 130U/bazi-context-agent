$goal
停止当前越界开发。请把工作拉回 Stage 5B 范围。

Stage 5B 只允许做：
- BaziEngineAdapter interface；
- BaziDerivedProfile schema；
- StaticBaziAdapter；
- optional LunarJavascriptAdapter wrapper；
- adapter tests。

请移除或回滚以下越界内容：
- Rectification v2 scoring；
- DefaultChart/CandidateChart v2 ranking 重构；
- ForecastInput Builder；
- AI forecast；
- 新 AI provider；
- UI 改造；
- 登录/支付/数据库/用户系统；
- 真实 .env 或 API key。

保留现有 Stage 0–4 行为。
运行 npm test。
完成后中文汇报越界内容是否已经移除。
