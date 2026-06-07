$goal
现在不要修改代码，不要 commit，不要进入 Stage 8。只做 Stage 7 严格验收审计。

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

- EvalCase schema/types
- Holdout builder
- Leakage guard
- Evaluation mode builder A/B/C/D
- Deterministic judge
- Pairwise comparator
- Benchmark runner
- BenchmarkResult output
- Tests

三、Holdout 审计

请确认：

1. cutoff_date 被使用；
2. post-cutoff events 被移除；
3. hidden target fields 被移除；
4. redacted_terms 被移除；
5. hidden target 不进入 allowed input；
6. invalid case 被标记；
7. missing ground truth 被拒绝或标记 invalid。

四、Leakage guard 审计

请确认能检测：

1. direct leakage；
2. unacceptable leakage terms；
3. post-cutoff temporal leakage；
4. metadata leakage；
5. leakage penalty；
6. invalid case marking。

五、Mode A/B/C/D 审计

请确认：

1. Mode A derivative_only 不包含 context_box；
2. Mode B initial_value_only 不包含 derivative_profile；
3. Mode C default_chart_plus_initial_value 使用 default chart；
4. Mode D full_system 使用 selected/rectified chart + initial value；
5. 所有模式都不包含 hidden target；
6. 所有模式都有 mode metadata。

六、Judge / metrics 审计

请确认：

1. deterministic judge 可运行；
2. domain_accuracy 存在；
3. time_window_overlap 存在；
4. directional_correctness 存在；
5. specificity 存在或可计算；
6. calibration 存在或可计算；
7. evidence_separation 存在；
8. leakage_penalty 存在；
9. total_score 存在；
10. pairwise win rate 存在。

七、BenchmarkResult 审计

请确认输出包含：

- benchmark_id
- case_count
- mode_scores
- pairwise_win_rates
- leakage_summary
- conclusion
- warnings

并确认样本不足时 conclusion = insufficient_data。

八、边界审计

请确认 Stage 7 没有：

1. 修改 /api/ranking；
2. 修改 /api/rectification-v2；
3. 修改 /api/forecast-input；
4. 改变 selected_chart；
5. 改变 BaziDerivedProfile；
6. 发起真实 OpenAI 网络请求；
7. 创建真实 .env；
8. 写入真实 API key；
9. 增加登录、支付、数据库、用户系统；
10. 进入 Stage 8。

九、Checklist

请读取：

pm_checklists/STAGE_07_ACCEPTANCE.md

逐项输出：

- PASS
- FAIL
- PARTIAL

十、最终结论

最后输出：

1. Stage 7 是否 PASS；
2. 是否可以 commit；
3. 如果 FAIL/PARTIAL，列出最小修复项；
4. 如果 PASS，建议 commit message；
5. 不要自动修改代码；
6. 不要自动 commit。
