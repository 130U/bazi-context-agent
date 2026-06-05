$goal
请不要开发新功能。现在只做 Stage 4C 验收审计。

请运行 npm test，并检查：

1. prediction UI 是否展示所有 PredictionResult section；
2. report preview 是否包含 ranking summary；
3. report preview 是否包含 context box summary；
4. report preview 是否包含 prediction result；
5. report preview 是否包含 policy boundary notice；
6. 是否支持 export JSON 或 Markdown；
7. UI 是否没有暴露 API key；
8. ranking 是否不因 prediction 发生改变；
9. 是否没有 React/Next/Vite/Vue/Svelte；
10. 是否没有登录、支付、数据库、用户系统；
11. npm test 是否通过；
12. 是否满足 pm_checklists/STAGE_04C_ACCEPTANCE.md。

最后输出 PASS / FAIL。
如果 PASS，请说明是否可以 commit Stage 4C。
