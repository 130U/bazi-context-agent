$goal
不要修改代码，不要 commit，不要进入 Stage 4C。只做 Stage 4B 严格验收审计。

请运行：

```powershell
$env:Path='C:\Program Files\nodejs;' + $env:Path; npm.cmd test
```

然后逐项检查并中文汇报：

## 1. 测试结果

- 测试命令
- 通过数量
- 失败数量
- 耗时

## 2. Provider selection

- 默认 provider 是否是 mock
- `PREDICTION_PROVIDER=mock` 是否使用 mock
- `PREDICTION_PROVIDER=openai` 是否尝试使用 OpenAI provider
- `PREDICTION_PROVIDER=openai` 但缺 `OPENAI_API_KEY` 时行为是否安全明确
- `OPENAI_MODEL` 是否只作为服务端 env 或集中配置读取
- provider selection 是否只影响 `/api/prediction`
- provider selection 是否完全不影响 `/api/ranking`

## 3. OpenAI provider 边界

- 是否存在 OpenAI provider 模块
- 是否只在 `/api/prediction` path 使用
- 是否没有在 ranking path import/call
- 是否没有在 browser HTML/JS 暴露 API key
- 是否没有真实 `.env`
- 是否没有真实 API key 字符串
- 是否没有在测试中发起真实 OpenAI 网络请求
- 测试是否使用 fake client / mock client 覆盖 OpenAI provider
- 是否没有引入 `langchain`、`llamaindex`、`@ai-sdk`

## 4. Schema validation

- mock provider 输出是否经过 schema validation
- OpenAI provider 输出是否经过 schema validation
- fake OpenAI valid response 是否通过
- fake OpenAI invalid response 是否被拒绝
- `PredictionResult` 是否仍包含：
  - domain
  - conclusion
  - known_facts
  - chart_signals
  - context_adjustments
  - prediction
  - confidence
  - uncertainty
  - next_questions
  - policy
- policy 是否包含：
  - provider
  - ai_used_for_ranking=false
  - ranking_modified_by_ai=false
  - output_schema_validated=true 或 equivalent

## 5. Ranking boundary

确认：

- `/api/ranking` 仍然 deterministic
- `/api/ranking` 不使用 context_box
- `/api/ranking` 不使用 prediction provider
- `/api/ranking` 不 import OpenAI provider
- `/api/ranking` 不读取 `OPENAI_API_KEY`
- `/api/prediction` 不修改 rankingSnapshot
- `/api/prediction` 不修改 candidate ids、scores、confidence

## 6. Scope

确认没有：

- 登录
- 支付
- 数据库
- 用户系统
- 紫微斗数
- 奇门
- 风水
- 真实完整八字历法
- React / Next / Vite / Vue / Svelte

## 7. Checklist

读取并逐项汇报：

- `pm_checklists/STAGE_04B_ACCEPTANCE.md`

输出：

- PASS
- FAIL
- PARTIAL

最后输出：

- Stage 4B 是否 PASS
- 是否可以 commit
- 如果 FAIL/PARTIAL，列出最小修复项
- 如果 PASS，建议 commit message

不要自动修改代码。
不要自动 commit。
