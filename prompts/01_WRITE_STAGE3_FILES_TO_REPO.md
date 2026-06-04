$goal
现在请把 Stage 03 的规格文件写入当前 repo。

规则：
1. 只创建或更新 Stage 03 文件。
2. 不要修改第一轮、第二轮、Round 02.5 已有代码。
3. 不要开发 UI，本任务只写规格文件。
4. 不要接 AI。
5. 如果文件已存在，请先比较内容；如果相同则跳过，如果不同则汇报后按本文内容更新。
6. 写完后运行 `git diff --stat`，不要 commit，先汇报。

请创建/更新以下文件：

## prompts/ROUND_03_GOAL_UI_FLOW.md

```md
$goal
现在进入第三轮开发：最小本地 UI Flow。

当前前置条件：
- Round 02.5 测试补强已经 PASS。
- npm test 当前应为 24 pass / 0 fail 或更多。
- 当前阶段仍然禁止 AI 参与定八字、定时辰、candidate ranking。

请先读取并遵守：
- AGENTS.md
- docs/GOAL.md
- docs/GAME_RULES.md
- docs/MVP_SPEC.md
- docs/QUESTIONNAIRE_SPEC.md
- docs/SCORING_SPEC.md
- docs/DATA_SCHEMA.md
- docs/AI_POLICY.md
- docs/NO_AI_BOUNDARY_ROUND_02.md
- docs/ROUND_03_DELIVERABLES.md
- docs/UI_FLOW_ROUND_03.md
- docs/LOCAL_WEB_SERVER_ROUND_03.md
- docs/API_CONTRACT_ROUND_03.md
- docs/STATE_MANAGEMENT_ROUND_03.md
- docs/UI_TESTING_ROUND_03.md
- docs/ROUND_03_NON_GOALS.md
- configs/question_bank.v1.json
- configs/scoring_weights.v1.json
- pm_checklists/ROUND_03_ACCEPTANCE.md

本轮目标：
实现一个最小本地网页 UI，让产品经理可以在浏览器里走完整 MVP 流程，但不要引入复杂前端框架。

推荐实现：
- 使用 Node.js 内置 `node:http` 做 local web server。
- 使用普通 HTML/CSS/vanilla JS 或 server-rendered HTML。
- 不使用 React / Next.js / Vue / Svelte / Vite。
- 不新增数据库。
- 不新增登录、支付、用户系统。
- 不接 OpenAI / Anthropic / LLM / model provider。

本轮必须交付：

1. 本地 Web Server
   - 增加一个可运行命令，例如：
     - `npm run ui`
     - 或 `npm run web`
   - 浏览器访问本地地址，例如 `http://127.0.0.1:3000`。
   - 如果 3000 被占用，可以支持 PORT 环境变量。
   - server 只用于本地 demo。

2. UI 页面流程
   页面至少包含 5 个步骤：
   - Step 1：出生基础信息 birth_input
   - Step 2：传统验时辰 symbol_prior
   - Step 3：重大年份回测 event_backtest
   - Step 4：信息框 context_box 预览
   - Step 5：候选盘 Top 3 ranking 结果

3. 问卷数据来源
   - UI 必须从 `configs/question_bank.v1.json` 或已有 questionnaire engine 读取问题。
   - 不要在 UI 里重新硬编码完整问卷。
   - 如需展示 label，可以基于 question bank 渲染。

4. API / handler 层
   必须提供最小接口或函数，使 UI 能调用已有确定性模块：
   - 获取问卷配置；
   - 提交 symbol answers 并返回 G1/G2/G3 weak prior；
   - 基于 BirthInput + HourGroupPrior 生成候选；
   - 提交 LifeEvent[] 并返回 Top 3 ranking；
   - 返回 evidence table、confidence、contradictions、missing_information。

5. 输出展示
   UI 必须展示：
   - G1/G2/G3 weak prior；
   - 2–6 个 candidate；
   - Top 3 candidate ranking；
   - confidence；
   - evidence table；
   - contradictions；
   - missing_information；
   - 明确提示：symbol prior 是弱先验，不能单独定盘。

6. Context Box 预览
   - UI 可以收集 context_box 问题，但本轮不做 AI 预测。
   - 展示用户填写的 context facts 预览。
   - 标记这些信息目前只用于后续 Round 04 AI prediction，不参与 candidate ranking。

7. 测试
   必须补充测试，保持已有 24 个测试全部通过，并新增 UI/server 相关测试：
   - server module 可以启动和关闭；
   - `/` 或主页 handler 返回 HTML；
   - question API 返回四层问卷；
   - symbol API 返回 G1/G2/G3；
   - ranking API 返回 Top 3；
   - UI/server 代码没有 AI provider import/call；
   - 无 React/Next/Vite/Vue/Svelte 依赖。

8. 命令
   - `npm test` 必须通过。
   - demo/ui 命令必须可运行。
   - 如果 Windows PATH 中 node 有 Access denied，继续使用之前成功的 PowerShell PATH workaround。

9. Git 处理
   - 开始前先运行 `git status`。
   - 如果发现 Round 02.5 的测试补强改动尚未提交，请先运行 npm test。
   - 如果测试通过，请先单独提交 Round 02.5：
     `git commit -am "Round 02.5 test hardening"`
   - 然后再做 Round 03 UI。
   - Round 03 完成且测试通过后，再提交：
     `git commit -am "Round 03 local UI flow"`
   - 如果新增文件未被 `git commit -am` 包含，请使用 `git add` 后再 commit。
   - 测试失败时不要 commit。

禁止事项：
- 不要接 OpenAI API。
- 不要接 Anthropic。
- 不要引入任何 LLM provider。
- 不要让 AI 参与 candidate ranking。
- 不要改 scoring weights。
- 不要改 question_bank 的语义。
- 不要引入 React/Next/Vite/Vue/Svelte。
- 不要做登录、支付、用户系统。
- 不要做数据库。
- 不要做紫微斗数、奇门、风水。
- 不要实现真实完整八字历法；本轮只做 UI flow，对接现有 deterministic stub。

完成后请用中文汇报：
1. 是否先提交了 Round 02.5；
2. Round 03 改了哪些文件；
3. 新增了哪些 server/UI/API/test 模块；
4. UI 如何启动；
5. npm test 通过数量、失败数量、耗时；
6. 是否仍然没有 AI 参与定八字、定时辰、candidate ranking；
7. 是否满足 pm_checklists/ROUND_03_ACCEPTANCE.md；
8. Git commit hash；
9. 是否已经 push 到 GitHub。如果没有 push，请说明原因。
```

## prompts/ROUND_03_AUDIT_AFTER_RUN.md

```md
$goal
请不要继续开发新功能。现在只做 Round 03 完成后的验收审计。

请读取并对照：
- AGENTS.md
- docs/AI_POLICY.md
- docs/NO_AI_BOUNDARY_ROUND_02.md
- docs/ROUND_03_DELIVERABLES.md
- docs/UI_FLOW_ROUND_03.md
- docs/LOCAL_WEB_SERVER_ROUND_03.md
- docs/API_CONTRACT_ROUND_03.md
- docs/UI_TESTING_ROUND_03.md
- docs/ROUND_03_NON_GOALS.md
- pm_checklists/ROUND_03_ACCEPTANCE.md

请执行：
1. `git status`
2. `npm test`
3. 如果有 UI/demo 命令，检查 package.json scripts，并说明如何启动。
4. 如果有 server module，请用测试或最小方式确认它可以启动和关闭。

请逐项审计并用 PASS / FAIL / PARTIAL 标记：

1. 是否存在本地 UI server 命令，例如 `npm run ui` 或 `npm run web`。
2. 首页是否可返回 HTML。
3. UI 是否包含 5 步流程：birth_input、symbol_prior、event_backtest、context_box、ranking_result。
4. UI 是否从 question bank 或 questionnaire engine 读取问题，而不是在 UI 里硬编码完整问卷。
5. 是否存在获取问卷配置的 handler/API。
6. 是否存在 symbol scoring handler/API，并返回 G1/G2/G3。
7. 是否存在 candidate generation handler/API，并返回 2–6 个候选。
8. 是否存在 ranking handler/API，并返回 Top 3。
9. ranking 输出是否包含 confidence。
10. ranking 输出是否包含 evidence table。
11. ranking 输出是否包含 contradictions。
12. ranking 输出是否包含 missing_information。
13. context_box 是否只做预览，不参与 candidate ranking。
14. UI 是否明确提示 symbol prior 是弱先验。
15. 是否没有接 OpenAI / Anthropic / LLM / model provider。
16. candidate ranking 前是否没有 AI provider import/call。
17. 是否没有 React/Next/Vite/Vue/Svelte。
18. 是否没有登录、支付、用户系统。
19. 是否没有数据库。
20. npm test 是否通过。
21. 是否满足 pm_checklists/ROUND_03_ACCEPTANCE.md。

最后输出：
- Round 03 验收：PASS / FAIL / PARTIAL
- 测试数量、失败数量、耗时
- 如果 FAIL/PARTIAL，列出最小修复项
- 不要自动修复，先等我确认
```

## prompts/ROUND_03_DEBUG_FIX.md

```md
$goal
只修 Round 03 的测试或本地 UI 启动问题。不要开发新功能。

请先复现问题：
1. 运行 `npm test`。
2. 如有 UI 启动问题，运行 `npm run ui` 或 package.json 中对应命令。
3. 读取失败日志。

修复规则：
- 做最小修改。
- 不要改 scoring weights。
- 不要改 question bank 语义。
- 不要引入 React/Next/Vite/Vue/Svelte。
- 不要接 AI。
- 不要做登录、支付、用户系统。
- 不要添加数据库。
- 不要重写第一轮和第二轮的 deterministic scoring。

优先修复：
1. handler/API 输出字段缺失；
2. server start/close 不稳定；
3. Windows PATH 或端口占用问题；
4. tests 对字段命名和实际接口不一致；
5. UI 没有调用已有模块，而是硬编码结果。

完成后：
- 重新运行 npm test。
- 用中文汇报修改文件、失败原因、修复方式、测试结果。
- 测试通过前不要 commit。
```

## prompts/ROUND_03_SCOPE_GUARD_NO_AI_BEFORE_RANKING.md

```md
$goal
请停止扩展功能。现在只做 Round 03 越界纠偏。

如果你在 Round 03 中做了以下任何事情，请移除：
- 接 OpenAI / Anthropic / Gemini / LangChain / LlamaIndex / AI SDK；
- 在 candidate ranking 前调用任何 AI / LLM；
- 引入 React / Next.js / Vite / Vue / Svelte；
- 做登录、支付、用户系统；
- 添加数据库；
- 修改 scoring weights；
- 把完整问卷硬编码进 UI；
- 做紫微斗数、奇门、风水；
- 实现真实完整八字历法。

Round 03 只允许：
- 本地 Node HTTP server；
- 轻量 HTML/CSS/vanilla JS；
- 对接已有 deterministic questionnaire/scoring/ranking modules；
- 展示 Top 3 ranking 和 evidence；
- context_box 预览；
- 测试。

请移除越界内容后重新运行 npm test，并用中文汇报：
1. 移除了什么；
2. 保留了什么；
3. 测试是否通过；
4. 是否满足 Round 03 边界。
```

## docs/ROUND_03_DELIVERABLES.md

```md
# Round 03 Deliverables

Round 03 的目标是把 Round 01/02/02.5 已经完成的 deterministic core 包装成一个最小本地 UI flow，让产品经理可以在浏览器中走完端到端流程。

## 本轮交付

1. **Local Web Server**
   - 使用 Node.js 内置 HTTP server 或同等轻量实现。
   - 提供 `npm run ui` 或 `npm run web`。
   - 默认本地运行，不需要部署。

2. **最小 UI Flow**
   - Step 1: birth_input
   - Step 2: symbol_prior
   - Step 3: event_backtest
   - Step 4: context_box preview
   - Step 5: Top 3 ranking result

3. **Handler/API Layer**
   - 获取 question bank。
   - 提交 symbol answers，返回 G1/G2/G3 weak prior。
   - 生成 candidate charts。
   - 提交 life events，返回 Top 3 ranking。

4. **Result Display**
   - HourGroupPrior。
   - Candidate list。
   - Top 3 ranking。
   - confidence。
   - evidence table。
   - contradictions。
   - missing_information。

5. **Testing**
   - server/handler tests。
   - API shape tests。
   - no AI boundary tests。
   - no heavy frontend framework tests。

## 本轮不交付

- AI prediction。
- OpenAI / Anthropic / LLM provider。
- React / Next.js / Vite / Vue / Svelte。
- 登录、支付、用户系统。
- 数据库。
- 真实完整八字历法。
- 紫微斗数、奇门、风水。
```

## docs/UI_FLOW_ROUND_03.md

```md
# UI Flow Round 03

Round 03 的 UI 是 MVP prototype，不是正式产品前端。目标是让 PM 可以在浏览器中验证产品流程是否顺。

## 页面流程

### Step 1: Birth Input

展示并收集：
- 出生日期。
- 出生地。
- 记录出生时间。
- 时间不确定范围。
- 是否接近午夜、节气、时辰边界。
- 传统排盘用性别。

UI 说明：记录时间只是 prior，不是最终定盘依据。

### Step 2: Symbol Prior

展示并收集：
- 发旋。
- 胎次。
- 兄弟姐妹。
- 小指长度。
- 脸型。
- 自然睡姿。
- 出生姿势，如果知道。
- 童年家庭结构。

输出：
- G1 = 子午卯酉。
- G2 = 寅申巳亥。
- G3 = 辰戌丑未。
- 每组 normalized prior。

UI 必须提示：symbol prior 是弱先验，不能单独定盘。

### Step 3: Event Backtest

展示并收集：
- 1–3 个重大转折年份。
- 学业 / 考试 / 留学年份。
- 迁移年份。
- 感情年份。
- 健康 / 意外 / 手术年份。
- 家庭变化年份。
- 事业年份，条件题。
- 子女 / 生育年份，条件题。
- 最好年份 / 最差年份。

输出：
- event_timing_fit。
- matched_rules。
- contradictions。
- missing_information。

### Step 4: Context Box Preview

展示并收集：
- 成长城市。
- 父母教育和职业。
- 家庭支持方式。
- 家庭价值观。
- 当前最高教育经历。
- 当前身份。
- 内心真正想做的方向。
- 实际走过的方向。
- 最看重的人生结果。
- 过去 3 年主要投入或焦虑。

本轮只做 preview，不做 AI prediction。

### Step 5: Ranking Result

展示：
- Top 3 candidates。
- total score。
- confidence。
- evidence table。
- contradictions。
- missing_information。

UI 文案必须区分：
- symbol prior。
- event backtest evidence。
- context facts。
- actual prediction。

Round 03 不做 actual prediction。
```

## docs/LOCAL_WEB_SERVER_ROUND_03.md

```md
# Local Web Server Round 03

## 推荐实现

使用 Node.js 内置 HTTP server。

要求：
- 不引入 Express，除非 Codex 发现当前项目已经使用 Express；默认不要新增依赖。
- 不引入 React / Next.js / Vite / Vue / Svelte。
- server 只服务本地 demo。

## Scripts

在 `package.json` 中增加一个脚本：

```json
{
  "scripts": {
    "ui": "node src/server.ts"
  }
}
```

如果项目已有 script 命名规范，可以使用 `web` 或 `demo:ui`，但必须在汇报中说明。

## Server Requirements

- 默认 host: `127.0.0.1`
- 默认 port: `3000`
- 支持 `PORT` 环境变量。
- server module 应该导出可测试的 createServer 或 handler。
- 测试必须能 start 和 close server，避免端口残留。

## Routes / Handlers

最低要求：
- `GET /` returns HTML。
- `GET /api/questionnaire` returns question bank or grouped questionnaire summary。
- `POST /api/symbol-prior` returns HourGroupPrior。
- `POST /api/candidates` returns candidate charts。
- `POST /api/ranking` returns Top 3 ranking。

如果实现为 internal handlers 而非真实 HTTP routes，也可以，但 UI 必须能调用。
```

## docs/API_CONTRACT_ROUND_03.md

```md
# API Contract Round 03

Round 03 的 API/handler 是 UI 和 deterministic core 之间的薄层。它不能重新实现 scoring，也不能调用 AI。

## GET /api/questionnaire

Response:

```json
{
  "layers": ["birth_input", "symbol_prior", "event_backtest", "context_box"],
  "questions": {}
}
```

必须从 `configs/question_bank.v1.json` 或现有 questionnaire engine 读取。

## POST /api/symbol-prior

Request:

```json
{
  "answers": []
}
```

Response:

```json
{
  "G1": { "label": "子午卯酉", "score": 0.33 },
  "G2": { "label": "寅申巳亥", "score": 0.33 },
  "G3": { "label": "辰戌丑未", "score": 0.34 },
  "evidence": []
}
```

## POST /api/candidates

Request:

```json
{
  "birth_input": {},
  "hour_group_prior": {}
}
```

Response:

```json
{
  "candidates": []
}
```

Candidate count should normally be 2–6.

## POST /api/ranking

Request:

```json
{
  "birth_input": {},
  "symbol_answers": [],
  "life_events": [],
  "context_facts": []
}
```

Response:

```json
{
  "top_candidates": [],
  "evidence_table": [],
  "contradictions": [],
  "missing_information": []
}
```

Every top candidate must include:
- candidate_id。
- score。
- confidence。
- evidence。

## Error Shape

Errors should be structured:

```json
{
  "error": {
    "code": "INVALID_INPUT",
    "message": "..."
  }
}
```
```

## docs/STATE_MANAGEMENT_ROUND_03.md

```md
# State Management Round 03

Round 03 不做数据库和持久化用户系统。

## State Strategy

使用浏览器端 session object 或 server 内存中的临时对象即可。

推荐最简单结构：

```ts
type UiSession = {
  birthInput?: BirthInput;
  symbolAnswers?: SymbolAnswer[];
  hourGroupPrior?: HourGroupPrior;
  candidates?: CandidateChart[];
  lifeEvents?: LifeEvent[];
  contextFacts?: ContextFact[];
  ranking?: CandidateScore[];
};
```

## Privacy

- 不写入真实用户数据到 repo。
- 不把 demo 输入持久化到数据库。
- 不生成包含真实私人命例的 fixture。
- fixture 只能使用虚构样例。

## Ranking Boundary

Context facts 可以展示在 Step 4，但 Round 03 不应让 context_box 影响 candidate ranking，除非现有 deterministic ranking 已明确支持该字段。

必须在 UI 中说明：context_box 用于 Round 04 之后的 AI prediction，不是 Round 03 的定盘依据。
```

## docs/UI_TESTING_ROUND_03.md

```md
# UI Testing Round 03

Round 03 必须保持已有测试通过，并新增最小 UI/server 测试。

## Required Tests

1. **Server Start/Close**
   - server 可以创建。
   - server 可以监听随机端口。
   - server 可以关闭。

2. **Home HTML**
   - `GET /` 或 equivalent handler 返回 HTML。
   - HTML 中包含产品名或关键步骤。

3. **Questionnaire API**
   - 返回四层问卷：birth_input, symbol_prior, event_backtest, context_box。

4. **Symbol API**
   - 返回 G1/G2/G3。
   - 包含中文 label：子午卯酉、寅申巳亥、辰戌丑未。

5. **Candidate API**
   - 返回 2–6 candidates。

6. **Ranking API**
   - 返回 Top 3。
   - 每个 candidate 有 confidence。
   - 返回 evidence table。
   - 返回 contradictions。
   - 返回 missing_information。

7. **No AI Boundary**
   - src 下无 AI provider import/call。
   - candidate ranking 前无 AI。

8. **No Heavy UI Framework**
   - package.json 不包含 React, Next, Vite, Vue, Svelte。
   - src 不包含 TSX/JSX。

## Test Command

使用现有测试方式：

```powershell
$env:Path='C:\Program Files\nodejs;' + $env:Path; npm test
```

或普通：

```bash
npm test
```
```

## docs/ROUND_03_NON_GOALS.md

```md
# Round 03 Non-Goals

Round 03 的重点是 UI flow，不是产品全面扩展。

## 禁止范围

- AI prediction。
- OpenAI / Anthropic / Gemini / LLM provider。
- React / Next.js / Vite / Vue / Svelte。
- 登录。
- 支付。
- 用户系统。
- 数据库。
- 部署。
- 真实完整八字历法。
- 紫微斗数。
- 奇门遁甲。
- 风水。
- 真人命理师 marketplace。
- 手机 App。

## 不要做的错事

1. 不要为了 UI 漂亮而引入大型前端框架。
2. 不要在 UI 层重新写 scoring。
3. 不要让 context_box 直接改变 candidate ranking，除非 deterministic core 已支持且有测试。
4. 不要把已知事实包装成预测。
5. 不要把 demo fixture 写成真实用户案例。
```

## pm_checklists/ROUND_03_ACCEPTANCE.md

```md
# Round 03 Acceptance Checklist

## Preflight

- [ ] Round 02.5 tests were committed or cleanly preserved before Round 03 work.
- [ ] `npm test` passed before starting Round 03.

## Local UI

- [ ] package.json has a local UI script, e.g. `npm run ui` or `npm run web`.
- [ ] local server can start and close.
- [ ] home page returns HTML.
- [ ] browser flow contains 5 steps: birth_input, symbol_prior, event_backtest, context_box, ranking_result.

## Data Source

- [ ] UI/questionnaire reads from `configs/question_bank.v1.json` or questionnaire engine.
- [ ] UI does not hardcode the complete question bank.
- [ ] scoring uses `configs/scoring_weights.v1.json`.

## API / Handler

- [ ] question handler returns four layers.
- [ ] symbol handler returns G1/G2/G3.
- [ ] candidate handler returns 2–6 candidates.
- [ ] ranking handler returns Top 3.
- [ ] ranking output includes confidence.
- [ ] ranking output includes evidence table.
- [ ] ranking output includes contradictions.
- [ ] ranking output includes missing_information.

## Product Copy

- [ ] UI says recorded birth time is prior, not truth.
- [ ] UI says symbol prior is weak and cannot determine the chart alone.
- [ ] UI says context_box is for later prediction, not Round 03 chart ranking.

## Tests

- [ ] Existing tests still pass.
- [ ] Server start/close test exists.
- [ ] Home HTML test exists.
- [ ] Questionnaire API/handler test exists.
- [ ] Symbol API/handler test exists.
- [ ] Candidate API/handler test exists.
- [ ] Ranking API/handler test exists.
- [ ] No AI boundary test still passes.
- [ ] No heavy UI framework test exists.

## Scope Guard

- [ ] No OpenAI / Anthropic / LLM provider.
- [ ] No AI before candidate ranking.
- [ ] No React / Next / Vite / Vue / Svelte.
- [ ] No login / payment / user system.
- [ ] No database.
- [ ] No Zi Wei Dou Shu / Qi Men / Feng Shui.

## Final

- [ ] `npm test` passes.
- [ ] Round 03 commit created only after tests pass.
- [ ] Chinese completion report provided.
```

## fixtures/round3_sample_session.json

```json
{
  "birth_input": {
    "birth_date": "1998-05-10",
    "birth_place": "Shanghai, China",
    "recorded_time": "22:50",
    "uncertainty_range": "auto",
    "boundary_flags": [
      "near_hour_boundary",
      "near_zi_hour"
    ],
    "chart_sex": "female"
  },
  "symbol_answers": [
    {
      "question_id": "hair_whorl",
      "value": "center_single"
    },
    {
      "question_id": "little_finger",
      "value": "same_level"
    },
    {
      "question_id": "sleep_posture",
      "value": "side"
    }
  ],
  "life_events": [
    {
      "year": 2018,
      "event_type": "education",
      "description": "fictional overseas study event"
    },
    {
      "year": 2021,
      "event_type": "career",
      "description": "fictional direction change"
    }
  ],
  "context_facts": [
    {
      "category": "preference",
      "field": "desired_direction",
      "value": "fictional creative technology direction",
      "source": "demo",
      "confidence": 0.5
    }
  ]
}
```
