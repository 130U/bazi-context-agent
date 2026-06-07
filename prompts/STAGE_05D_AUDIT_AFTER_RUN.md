$goal
现在不要修改代码，不要 commit，不要进入 Stage 5E。只做 Stage 5D 严格验收审计。

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

二、模块审计

请检查并汇报是否存在或等价实现：

1. rectificationTypes；
2. rectificationV2；
3. eventTimingFit；
4. defaultChartProtection；
5. rectificationEvidence；
6. rectificationConfig；
7. tests for rectification v2；
8. optional /api/rectification-v2。

三、评分公式审计

请确认：

1. 读取 configs/rectification_weights.stage5d.json；
2. 不硬编码权重；
3. components 包含：
   - recorded_time_prior
   - event_timing_fit
   - symbol_prior_fit
   - chart_profile_fit
   - contradiction_penalty
4. total_score 计算正确；
5. scores clamp 到 0–1；
6. 输出 confidence。

四、EventTimingFit 审计

请确认输出包含：

1. event_timing_fit；
2. per-event scores；
3. matched_rules；
4. contradictions；
5. missing_information；
6. warnings；
7. derived profile 缺字段时不 crash。

五、DefaultChart protection 审计

请确认：

1. DefaultChart 总是参与评分；
2. 事件少于 3 个时不允许推翻 DefaultChart；
3. alternative 领先 5% 以内时保护 DefaultChart；
4. alternative 领先 5–15% 时输出 default_protected_uncertain；
5. alternative 领先 15% 以上且至少 3 个高重要性事件匹配时可 candidate_preferred；
6. 输出 DefaultChartProtectionResult。

六、边界审计

请确认：

1. context_box 不参与 rectification；
2. 同样 default/candidates/events，不同 context_box，RectificationResultV2 不变；
3. AI 不参与 rectification；
4. OpenAI provider 不进入 rectification path；
5. /api/ranking 没有被修改或行为未变；
6. /api/prediction 没有被修改或行为未变；
7. 没有真实 .env；
8. 没有真实 API key；
9. 没有登录、支付、数据库、用户系统；
10. 没有紫微、奇门、风水扩展；
11. 没有 Stage 6 forecast。

七、API 审计

如果新增 /api/rectification-v2，请确认：

1. 缺少 default_chart 时返回明确错误；
2. 不调用 /api/prediction；
3. 不调用 rankCandidates；
4. 不读取 OPENAI_API_KEY；
5. response metadata 包含：
   - ai_used: false
   - context_box_used_for_rectification: false
   - ranking_modified_by_ai: false。

如果没有新增 API，也请确认核心模块可以被 Stage 5E 调用。

八、对照 checklist

请读取：

pm_checklists/STAGE_05D_ACCEPTANCE.md

逐项输出：

- PASS
- FAIL
- PARTIAL

九、最终结论

最后输出：

1. Stage 5D 是否 PASS；
2. 是否可以 commit；
3. 如果 FAIL/PARTIAL，列出最小修复项；
4. 如果 PASS，建议 commit message；
5. 不要自动修改代码；
6. 不要自动 commit；
7. 不要进入 Stage 5E。
