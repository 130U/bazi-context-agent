$goal
请不要开发新功能。现在只做 Stage 4B 验收审计。

请运行 npm test，并检查：

1. 默认 provider 是否为 mock；
2. PREDICTION_PROVIDER=openai 且缺少 OPENAI_API_KEY 时是否返回明确 provider_config_error；
3. OPENAI_API_KEY 是否只从环境变量读取；
4. 是否没有真实 API key 出现在代码、测试、docs、fixtures、examples 中；
5. 是否没有 .env 真实文件；
6. API key 是否不会进入 client-side HTML/JS；
7. OpenAI provider 是否只用于 /api/prediction；
8. OpenAI provider 是否没有被 /api/ranking / ranking.ts / candidate generation / symbol scoring / event backtest import；
9. /api/ranking 是否仍然 deterministic；
10. /api/prediction 是否仍然不能修改 rankingSnapshot；
11. schema validation 是否存在；
12. 是否没有真实 API 调用测试；
13. npm test 是否通过；
14. 是否满足 pm_checklists/STAGE_04B_ACCEPTANCE.md。

最后输出 PASS / FAIL。
如果 PASS，请说明是否可以 commit Stage 4B。
