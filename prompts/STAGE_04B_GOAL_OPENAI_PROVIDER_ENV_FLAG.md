$goal
进入 Stage 4B：Real OpenAI Provider Behind Env Flag。

目标：
在 Stage 4A 的 mock prediction layer 后面，新增真实 OpenAI provider。
默认 provider 必须仍然是 mock。只有环境变量明确启用时，才允许使用 OpenAI provider。

请读取并遵守：

- AGENTS.md
- docs/GOAL.md
- docs/GAME_RULES.md
- docs/AI_POLICY.md
- docs/STAGE_04_OVERVIEW.md
- docs/STAGE_04B_REAL_PROVIDER.md
- docs/OPENAI_PROVIDER_POLICY_STAGE_04B.md
- docs/STAGE_04B_PROVIDER_SELECTION.md
- docs/STAGE_04B_SCHEMA_VALIDATION.md
- docs/STAGE_04B_SECURITY_AND_KEYS.md
- docs/STAGE_04B_TESTING.md
- docs/STAGE_04_NON_GOALS.md
- configs/prediction_domains.v1.json
- configs/prediction_output_schema.v1.json
- configs/prediction_provider_policy.v1.json
- configs/prediction_provider_policy.stage4b.json
- pm_checklists/STAGE_04B_ACCEPTANCE.md

核心边界：

1. `/api/ranking` 仍然不得使用 AI。
2. `/api/ranking` 仍然不得使用 context_box。
3. `/api/ranking` 仍然不得调用 prediction provider。
4. `/api/prediction` 可以选择 provider。
5. 默认 provider 必须是 mock。
6. 只有 `PREDICTION_PROVIDER=openai` 时，才允许使用 OpenAI provider。
7. 如果 `PREDICTION_PROVIDER` 没设置，必须使用 mock。
8. 如果 `PREDICTION_PROVIDER=openai` 但没有 `OPENAI_API_KEY`，不得崩溃，不得真实调用。
9. API key 只能从服务端 `process.env.OPENAI_API_KEY` 读取。
10. 不得创建真实 `.env`。
11. 不得提交真实 API key。
12. 不得把 API key 暴露到浏览器端 HTML/JS。
13. 测试不得发起真实 OpenAI 网络请求。
14. 不得让 OpenAI provider 修改 `rankingSnapshot`、candidate ids、scores、confidence。
15. 不得做登录、支付、数据库、用户系统。
16. 不得做紫微斗数、奇门、风水。
17. 不得实现真实完整八字历法。
18. 不要进入 Stage 4C。

任务一：依赖策略

检查 `package.json`。

如果尚未安装 OpenAI SDK：
- 可以添加官方 `openai` npm package；
- 不要引入 `langchain`、`llamaindex`、`@ai-sdk` 或大型 agent framework；
- 如果无法安装依赖，则先实现 provider boundary 和 fake client 测试，保持默认 mock 可用。

任务二：provider selection

新增或更新：

- `src/predictionProviderConfig.ts`
- `src/predictionProvider.ts`
- `src/openaiPredictionProvider.ts`

要求：

- 默认 provider = mock
- `PREDICTION_PROVIDER=mock` -> mock
- `PREDICTION_PROVIDER=openai` + `OPENAI_API_KEY` -> openai
- `PREDICTION_PROVIDER=openai` + no key -> explicit config error or safe mock fallback
- provider selection 只影响 `/api/prediction`
- provider selection 不得进入 `/api/ranking`

任务三：OpenAI provider

OpenAI provider 必须：

- 接收 Stage 4A 的 `PredictionRequest`
- 返回 `PredictionResult`
- 不修改 ranking snapshot
- 不修改 candidate ids、scores、confidence
- 输出 known facts / chart signals / context adjustments / prediction 分离
- policy 必须保持：
  - `ai_used_for_ranking: false`
  - `ranking_modified_by_ai: false`

任务四：schema validation

实现 provider output validation：

- mock output 要 validate
- OpenAI output 要 validate
- invalid output 要拒绝
- 不允许 silently accept invalid provider output
- 可先手写轻量 validator，不强制引入 ajv

任务五：env example

只允许更新 example 文件：

- `examples/stage4b.env.example`
- 如项目已有 `examples/.env.stage4.example`，也可以只补空示例字段

示例内容只能是：

```text
PREDICTION_PROVIDER=mock
OPENAI_API_KEY=
OPENAI_MODEL=
```

不要创建真实 `.env`。
不要写真实 key。

任务六：更新 `/api/prediction`

- 默认 mock
- openai 只在 env flag 下启用
- 缺 rankingSnapshot 仍返回 `MISSING_RANKING_SNAPSHOT`
- 不重新调用 ranking
- 不修改 ranking snapshot
- response.policy 必须说明 provider、ranking boundary、schema validation 状态

任务七：测试

新增或更新测试，至少覆盖：

1. 默认 provider 是 mock；
2. `PREDICTION_PROVIDER=mock` 使用 mock；
3. `PREDICTION_PROVIDER=openai` 但缺 key 时安全处理；
4. OpenAI provider 使用 fake client 测试，不发真实网络；
5. fake OpenAI valid response 通过；
6. fake OpenAI invalid response 被拒绝；
7. `/api/prediction` 不修改 rankingSnapshot；
8. `/api/ranking` 没有 OpenAI provider import/call；
9. repo 没有真实 `.env` 或真实 API key；
10. 没有引入 `langchain`、`llamaindex`、`@ai-sdk`；
11. 所有测试通过。

运行：

```powershell
$env:Path='C:\Program Files\nodejs;' + $env:Path; npm.cmd test
```

完成后用中文汇报：
1. 修改了哪些文件；
2. 是否新增 OpenAI provider；
3. 是否安装新依赖；
4. provider selection 规则；
5. 默认 provider 是否仍是 mock；
6. 是否没有真实 API key；
7. 是否没有真实 `.env`；
8. 测试中是否没有真实网络调用；
9. `/api/ranking` 是否仍然完全不使用 AI；
10. `/api/prediction` 是否仍不修改 rankingSnapshot；
11. 测试结果；
12. 是否满足 `pm_checklists/STAGE_04B_ACCEPTANCE.md`。

不要 commit，先等我确认。
