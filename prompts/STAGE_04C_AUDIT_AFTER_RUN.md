$goal
请不要修改代码，不要 commit，不要进入 Stage 5。现在只做 Stage 4C 严格验收审计。

请运行：

npm test

如果 PowerShell 下 node 路径有问题，使用：

$env:Path='C:\Program Files\nodejs;' + $env:Path; npm.cmd test

一、测试结果

请汇报：

1. 测试命令；
2. 通过数量；
3. 失败数量；
4. 耗时。

二、Report builder 审计

请检查并汇报：

1. 是否存在 report types；
2. 是否存在 report builder；
3. 是否存在 Markdown report builder；
4. report 是否包含：
   - report_id
   - generated_at
   - version
   - ranking_snapshot_summary
   - selected_candidate_summary
   - context_box_summary
   - prediction_result
   - policy
   - privacy_notice
   - export_metadata
5. report 是否不包含：
   - API key
   - raw provider request
   - raw provider response
   - process.env
   - hidden debug fields

三、/api/report 审计

请检查并汇报：

1. /api/report 是否存在；
2. 是否只接受 POST；
3. 缺少 rankingSnapshot 是否返回明确错误；
4. 缺少 predictionResult 是否返回明确错误；
5. 是否支持 json export；
6. 是否支持 markdown export；
7. 是否不重新调用 /api/ranking；
8. 是否不重新调用 /api/prediction；
9. 是否不修改 rankingSnapshot；
10. 是否不调用 OpenAI provider；
11. 是否不发真实网络请求。

四、UI 审计

请检查并汇报 UI 是否包含：

1. prediction result 区域；
2. known_facts 展示；
3. chart_signals 展示；
4. context_adjustments 展示；
5. prediction 展示；
6. confidence 展示；
7. uncertainty 展示；
8. next_questions 展示；
9. provider status 展示；
10. report preview；
11. Export JSON button；
12. Export Markdown button；
13. privacy notice；
14. context_box 不参与 ranking 的边界提示；
15. AI 不参与 ranking 的边界提示。

五、Provider / key 安全审计

请检查并汇报：

1. UI 是否不暴露 OPENAI_API_KEY；
2. export report 是否不暴露 OPENAI_API_KEY；
3. provider status 是否只显示 provider 名称/状态，不显示 secret；
4. repo 是否没有真实 .env；
5. repo 是否没有真实 API key；
6. 测试是否没有真实 OpenAI 网络调用。

六、Ranking 边界审计

请确认：

1. /api/ranking 仍然 deterministic；
2. /api/ranking 不使用 context_box；
3. /api/ranking 不使用 prediction provider；
4. /api/ranking 不 import OpenAI provider；
5. /api/ranking 不读取 OPENAI_API_KEY；
6. /api/prediction 不修改 rankingSnapshot；
7. /api/report 不修改 rankingSnapshot。

七、Scope 审计

请确认没有：

1. React / Next / Vite / Vue / Svelte；
2. 登录；
3. 支付；
4. 数据库；
5. 用户系统；
6. 紫微斗数；
7. 奇门；
8. 风水；
9. 真实完整八字历法。

八、Checklist

请读取 pm_checklists/STAGE_04C_ACCEPTANCE.md，逐条输出：

- PASS
- FAIL
- PARTIAL

九、最终结论

最后输出：

1. Stage 4C 是否 PASS；
2. 是否可以 commit；
3. 如果 FAIL/PARTIAL，列出最小修复项；
4. 如果 PASS，建议 commit message；
5. 不要自动修改代码；
6. 不要自动 commit。
