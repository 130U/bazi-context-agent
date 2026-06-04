$goal
现在开始执行 Stage 03 / Round 03 开发。

如果 Stage 03 repo 文件尚未写入，请先停止，并要求我先执行 `direct_to_codex/01_WRITE_STAGE3_FILES_TO_REPO.md`。

请读取并执行 repo 文件：
- prompts/ROUND_03_GOAL_UI_FLOW.md

如果你不能直接读取该文件，请按下面同等目标执行：

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
