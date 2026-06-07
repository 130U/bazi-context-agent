$goal
现在进入 Stage 7：Evaluation / Holdout Benchmark。

核心目标：
验证我们的核心产品 claim：

别人只有八字/导函数；
我们有导函数 + 问卷 initial value；
因此 full system 应该比只看八字、只看 context、默认盘 baseline 更好。

本阶段不是继续加预测能力，而是建立离线 evaluation harness。

请先读取并遵守：

- AGENTS.md
- docs/GOAL.md
- docs/GAME_RULES.md
- docs/AI_POLICY.md
- docs/STAGE_06_ROADMAP.md
- docs/STAGE_06_TO_STAGE_07_HANDOFF.md
- docs/STAGE_07_ROADMAP.md
- docs/STAGE_07_EVALUATION_FRAMEWORK.md
- docs/STAGE_07_HOLDOUT_BENCHMARK.md
- docs/STAGE_07_EVAL_CASE_SCHEMA.md
- docs/STAGE_07_MODES_A_B_C_D.md
- docs/STAGE_07_METRICS.md
- docs/STAGE_07_LEAKAGE_GUARD.md
- docs/STAGE_07_JUDGE_AND_SCORING.md
- docs/STAGE_07_TESTING.md
- docs/STAGE_07_NON_GOALS.md
- configs/evaluation_modes.stage7.json
- configs/evaluation_metrics.stage7.json
- configs/holdout_policy.stage7.json
- configs/eval_case_schema.stage7.json
- configs/judge_rubric.stage7.json
- configs/leakage_guard_policy.stage7.json
- pm_checklists/STAGE_07_ACCEPTANCE.md

本阶段只做：

1. EvalCase schema/types；
2. Holdout builder；
3. Leakage guard；
4. Mode input builder for A/B/C/D；
5. Deterministic/mock judge；
6. Benchmark runner；
7. BenchmarkResult output；
8. Tests；
9. Optional internal API, only if simple.

核心 benchmark modes：

A. derivative_only
   - 使用 BaziDerivedProfile
   - 不使用 context_box initial value

B. initial_value_only
   - 使用 context_box + known_life_events
   - 不使用 BaziDerivedProfile

C. default_chart_plus_initial_value
   - 使用 DefaultChart-derived profile + initial value

D. selected_chart_plus_initial_value_full_system
   - 使用 selected/rectified chart derivative + initial value

核心结论规则：
只有当 D 在足够多高质量 holdout cases 上稳定优于 A/B/C，才能支持产品 claim。
如果样本太少，必须输出 insufficient_data，不能夸大。

任务一：新增类型和模块

建议新增：

- src/evalTypes.ts
- src/evalCaseSchema.ts
- src/holdoutBuilder.ts
- src/leakageGuard.ts
- src/evaluationModes.ts
- src/forecastJudge.ts
- src/benchmarkRunner.ts

这些模块必须是 deterministic by default。
不要默认调用真实 AI。

任务二：EvalCase schema

实现或文档化以下核心结构：

- EvalCase
- HiddenTarget
- HoldoutSnapshot
- ModeInput
- ModeOutput
- ForecastEvalScore
- EvalCaseResult
- BenchmarkResult
- LeakageGuardResult

任务三：Holdout builder

实现 holdout builder：

1. 接收 EvalCase；
2. 读取 cutoff_date；
3. 删除 post-cutoff events；
4. 删除 hidden target fields；
5. 删除 redacted_terms；
6. 输出 allowed input snapshot；
7. 输出 redaction metadata。

如果发现 hidden target 仍然在 allowed input 中，必须标记 leakage violation。

任务四：Leakage guard

实现 leakage guard：

1. direct leakage detection；
2. simple term/synonym leakage detection via hidden target unacceptable_leakage_terms；
3. temporal leakage detection：post-cutoff event in input；
4. metadata leakage detection：hidden target accidentally copied into prompt/input。

输出：

- passed
- violations[]
- redacted_input

任务五：Mode builder

实现四种 mode input：

- A_derivative_only
- B_initial_value_only
- C_default_chart_plus_initial_value
- D_selected_chart_plus_initial_value_full_system

要求：

1. Mode A 不含 context_box；
2. Mode B 不含 derivative_profile；
3. Mode C 用 default chart；
4. Mode D 用 selected chart；
5. 所有模式不得包含 hidden target；
6. 所有模式必须带 mode metadata。

任务六：Deterministic judge

实现 deterministic judge：

1. 判断 domain_accuracy；
2. 判断 directional_correctness；
3. 判断 time_window_overlap；
4. 判断 evidence_separation；
5. 判断 leakage_penalty；
6. 计算 total_score；
7. 支持 pairwise comparison；
8. 样本不足时 conclusion = insufficient_data。

不要默认使用 LLM judge。
如果存在 LLM judge 类型，只能是 mock/disabled。

任务七：Benchmark runner

实现 benchmark runner：

Input:
- EvalCase[]
- mode outputs 或 mode runner callback

Output:
- BenchmarkResult

BenchmarkResult 必须包含：

- benchmark_id
- case_count
- mode_scores
- pairwise_win_rates
- leakage_summary
- conclusion
- warnings

任务八：可选 API

可选新增：

- POST /api/evaluate-forecast
- POST /api/benchmark

如果新增 API：
1. 不调用真实 AI；
2. 不修改 ranking；
3. 不修改 forecast input；
4. 不生成新的 forecast，除非传入 mock provider；
5. 不存储用户数据。

任务九：测试

新增测试至少覆盖：

1. eval case fixture loads；
2. holdout removes hidden target fields；
3. leakage guard catches direct leakage；
4. leakage guard catches post-cutoff temporal leakage；
5. mode builder creates A/B/C/D；
6. Mode A excludes context_box；
7. Mode B excludes derivative_profile；
8. deterministic judge scores exact target match；
9. deterministic judge penalizes leakage；
10. benchmark runner aggregates scores；
11. pairwise win rates computed；
12. insufficient_data returned for small sample；
13. Stage 7 does not call real AI provider by default；
14. Stage 7 does not modify ranking；
15. npm test passes。

禁止事项：

1. 不要修改 /api/ranking；
2. 不要修改 /api/rectification-v2；
3. 不要修改 /api/forecast-input；
4. 不要改变 selected_chart；
5. 不要改变 BaziDerivedProfile；
6. 不要创建真实 .env；
7. 不要写真实 API key；
8. 不要在测试中发真实 OpenAI 网络请求；
9. 不要做登录、支付、数据库、用户系统；
10. 不要进入 Stage 8。

运行测试：

npm test

如果 PowerShell 下 node 路径有问题，使用：

$env:Path='C:\Program Files\nodejs;' + $env:Path; npm.cmd test

完成后中文汇报：

1. 修改了哪些文件；
2. 新增了哪些 eval 模块；
3. 是否新增 API；
4. A/B/C/D 四种模式是否实现；
5. leakage guard 是否实现；
6. holdout builder 是否实现；
7. deterministic judge 是否实现；
8. benchmark runner 是否实现；
9. 是否仍然没有真实 AI provider 调用；
10. 是否没有真实 API key；
11. 是否没有修改 ranking；
12. 测试结果；
13. 是否满足 STAGE_07_ACCEPTANCE.md。

不要 commit，先等我确认。
