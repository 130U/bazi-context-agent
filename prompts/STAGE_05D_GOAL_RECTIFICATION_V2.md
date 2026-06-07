$goal
现在进入 Stage 5D：Rectification v2 Scoring。

核心口径：
- 导函数 = 八字八变量 + 八字派生运势结构。
- initial value = 问卷得到的现实初始状态。
- Stage 5D 只做候选盘校正评分，不做未来预测。
- 重大事件年份用于 rectification。
- context_box 用于后续 forecast initial value，不得用于 rectification ranking。
- AI 不得参与 rectification。

请先读取并遵守：

- AGENTS.md
- docs/GOAL.md
- docs/GAME_RULES.md
- docs/AI_POLICY.md
- docs/PROJECT_ROADMAP_V4_DERIVED_FUNCTION.md
- docs/STAGE_05_MASTER_PLAN_DERIVED_FUNCTION.md
- docs/STAGE_05B_ADAPTER_SPEC.md
- docs/STAGE_05C_DEFAULT_AND_CANDIDATE_CHART_SPEC.md
- docs/STAGE_05D_ROADMAP.md
- docs/STAGE_05D_RECTIFICATION_V2_SCORING.md
- docs/STAGE_05D_EVENT_TIMING_FIT.md
- docs/STAGE_05D_DEFAULT_CHART_PROTECTION.md
- docs/STAGE_05D_EVIDENCE_MODEL.md
- docs/STAGE_05D_API_CONTRACT.md
- docs/STAGE_05D_TESTING.md
- docs/STAGE_05D_NON_GOALS.md
- configs/rectification_weights.stage5d.json
- configs/event_type_scoring.stage5d.json
- configs/default_chart_protection.stage5d.json
- configs/rectification_policy.stage5d.json
- pm_checklists/STAGE_05D_ACCEPTANCE.md

本阶段目标：
实现 deterministic Rectification v2 scoring。

输入：
- DefaultChart
- CandidateChartV2[]
- BaziDerivedProfile[]
- LifeEvent[]
- SymbolPrior
- RecordedTimePrior

输出：
- RectificationResultV2
- CandidateRectificationScore[]
- EvidenceTable
- DefaultChartProtectionResult
- warnings / missing_information

任务一：新增类型

请新增或扩展以下类型，建议文件：

- src/rectificationTypes.ts
- src/rectificationV2.ts
- src/eventTimingFit.ts
- src/defaultChartProtection.ts
- src/rectificationEvidence.ts
- src/rectificationConfig.ts

需要类型：

- RectificationV2Request
- RectificationResultV2
- CandidateRectificationScore
- RectificationEvidence
- RectificationContradiction
- EventTimingFitResult
- DefaultChartProtectionResult
- RectificationEvidenceTableRow

任务二：实现评分公式

必须从 configs/rectification_weights.stage5d.json 读取权重：

CandidateRectificationScore =
  0.35 * RecordedTimePrior
+ 0.45 * EventTimingFit
+ 0.10 * SymbolPriorFit
+ 0.10 * ChartProfileFit
- ContradictionPenalty

不要硬编码权重到业务逻辑中。

任务三：实现 EventTimingFit

输入：
- LifeEvent[]
- CandidateChartV2 或 DefaultChart
- BaziDerivedProfile

输出：
- event_timing_fit
- per-event scores
- matched_rules
- contradictions
- missing_information
- warnings

注意：
如果 derived profile 缺少 annual_fortunes / luck_cycles / relations 等字段，不要 crash。
应该记录 missing_information 和 warnings，并降低 confidence。

任务四：实现 DefaultChart protection

必须读取 configs/default_chart_protection.stage5d.json。

规则：
1. 重大事件少于 3 个，不允许推翻 DefaultChart。
2. alternative 领先 default 5% 以内，继续使用 DefaultChart。
3. alternative 领先 5–15%，标记 uncertain，但保护 DefaultChart。
4. alternative 领先 15% 以上，且至少 3 个高重要性事件匹配，才允许 candidate_preferred。
5. 输出 DefaultChartProtectionResult。

任务五：确保 context_box 不参与 rectification

即使 request 中传入 context_box，也必须忽略。

结果 metadata 必须包含：

- ai_used: false
- context_box_used_for_rectification: false
- ranking_modified_by_ai: false

并新增测试证明：
同样 default/candidates/events，不同 context_box，RectificationResultV2 完全一致。

任务六：可选新增 API

如果符合现有 server 结构，可以新增：

POST /api/rectification-v2

要求：
- 不调用 /api/prediction。
- 不调用 OpenAI provider。
- 不读取 OPENAI_API_KEY。
- 不修改 /api/ranking。
- 不修改 /api/prediction。
- 如果 default_chart 缺失，返回明确错误。
- 如果 candidate data 不完整，返回 warning，不 crash。

任务七：测试

新增测试，至少覆盖：

1. 读取 rectification_weights.stage5d.json。
2. DefaultChart 和 CandidateChartV2[] 都参与评分。
3. 输出 CandidateRectificationScore components。
4. 输出 RectificationResultV2。
5. 输出 evidence table。
6. 输出 default chart protection result。
7. 事件少于 3 个时保护 DefaultChart。
8. alternative 领先 5% 以内时保护 DefaultChart。
9. alternative 领先 5–15% 时输出 default_protected_uncertain。
10. alternative 领先 15% 以上且事件充分时允许 candidate_preferred。
11. context_box 不影响 rectification result。
12. AI/provider 不在 rectification path。
13. /api/ranking 仍然不变。
14. /api/prediction 仍然不变。
15. 没有真实 .env。
16. 没有真实 API key。
17. npm test 全部通过。

任务八：运行测试

运行：

npm test

如果 PowerShell 下 node 路径有问题，使用：

$env:Path='C:\Program Files\nodejs;' + $env:Path; npm.cmd test

完成后用中文汇报：

1. 修改了哪些文件；
2. 新增了哪些 rectification 模块；
3. 是否新增 /api/rectification-v2；
4. 是否读取 configs/rectification_weights.stage5d.json；
5. 是否实现 DefaultChart protection；
6. context_box 是否完全不影响 rectification；
7. AI/provider 是否完全不参与 rectification；
8. /api/ranking 是否仍然不变；
9. /api/prediction 是否仍然不变；
10. 测试结果：
   - 通过数量
   - 失败数量
   - 耗时
11. 是否满足 pm_checklists/STAGE_05D_ACCEPTANCE.md。

不要 commit，先等我确认。
