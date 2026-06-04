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
