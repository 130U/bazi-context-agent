$goal
请不要开发新功能。现在只做 Stage 4A 验收审计。

请运行：
npm test

如果 PowerShell 下 node 路径有问题，使用：
$env:Path='C:\Program Files\nodejs;' + $env:Path; npm.cmd test

请检查并中文汇报：

1. 测试命令；
2. 通过数量；
3. 失败数量；
4. /api/ranking 是否仍然存在；
5. /api/ranking 是否仍然 deterministic；
6. /api/ranking 是否没有使用 context_box；
7. /api/prediction 是否存在；
8. /api/prediction 是否要求 rankingSnapshot；
9. /api/prediction 是否不重新计算 ranking；
10. /api/prediction 是否不修改 candidate scores；
11. /api/prediction 是否可以使用 context_box；
12. prediction result 是否包含 domain、conclusion、known_facts、chart_signals、context_adjustments、prediction、confidence、uncertainty、next_questions、policy；
13. policy 是否包含 ai_used_for_ranking=false、ranking_modified_by_ai=false、provider="mock"；
14. 是否没有 OpenAI / Anthropic / LLM / model provider import/call；
15. 是否没有真实 API key；
16. 是否没有 .env 真实文件；
17. 是否没有 React / Next / Vite / Vue / Svelte；
18. 是否没有登录、支付、数据库、用户系统；
19. 是否满足 pm_checklists/STAGE_04A_ACCEPTANCE.md。

最后输出：
PASS / FAIL

如果 FAIL，请列出最小修复项。
如果 PASS，请说明是否可以 commit Stage 4A。
