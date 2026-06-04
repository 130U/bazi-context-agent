$goal
请不要继续开发新功能。现在只做 Round 03 完成后的验收审计。

请读取并对照：
- AGENTS.md
- docs/AI_POLICY.md
- docs/NO_AI_BOUNDARY_ROUND_02.md
- docs/ROUND_03_DELIVERABLES.md
- docs/UI_FLOW_ROUND_03.md
- docs/LOCAL_WEB_SERVER_ROUND_03.md
- docs/API_CONTRACT_ROUND_03.md
- docs/UI_TESTING_ROUND_03.md
- docs/ROUND_03_NON_GOALS.md
- pm_checklists/ROUND_03_ACCEPTANCE.md

请执行：
1. `git status`
2. `npm test`
3. 如果有 UI/demo 命令，检查 package.json scripts，并说明如何启动。
4. 如果有 server module，请用测试或最小方式确认它可以启动和关闭。

请逐项审计并用 PASS / FAIL / PARTIAL 标记：

1. 是否存在本地 UI server 命令，例如 `npm run ui` 或 `npm run web`。
2. 首页是否可返回 HTML。
3. UI 是否包含 5 步流程：birth_input、symbol_prior、event_backtest、context_box、ranking_result。
4. UI 是否从 question bank 或 questionnaire engine 读取问题，而不是在 UI 里硬编码完整问卷。
5. 是否存在获取问卷配置的 handler/API。
6. 是否存在 symbol scoring handler/API，并返回 G1/G2/G3。
7. 是否存在 candidate generation handler/API，并返回 2–6 个候选。
8. 是否存在 ranking handler/API，并返回 Top 3。
9. ranking 输出是否包含 confidence。
10. ranking 输出是否包含 evidence table。
11. ranking 输出是否包含 contradictions。
12. ranking 输出是否包含 missing_information。
13. context_box 是否只做预览，不参与 candidate ranking。
14. UI 是否明确提示 symbol prior 是弱先验。
15. 是否没有接 OpenAI / Anthropic / LLM / model provider。
16. candidate ranking 前是否没有 AI provider import/call。
17. 是否没有 React/Next/Vite/Vue/Svelte。
18. 是否没有登录、支付、用户系统。
19. 是否没有数据库。
20. npm test 是否通过。
21. 是否满足 pm_checklists/ROUND_03_ACCEPTANCE.md。

最后输出：
- Round 03 验收：PASS / FAIL / PARTIAL
- 测试数量、失败数量、耗时
- 如果 FAIL/PARTIAL，列出最小修复项
- 不要自动修复，先等我确认
