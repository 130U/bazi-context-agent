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
