# Contributing / 贡献指南

## English

Thanks for your interest in contributing. This repository is a research prototype, so contributions should preserve the project boundaries:

- deterministic chart derivation, candidate generation, and rectification before AI;
- AI only after structured deterministic inputs exist;
- no real API keys, `.env` files, private user cases, or identifiable benchmark data;
- no medical, legal, financial, or safety-critical certainty claims;
- no login, payment, database, cloud sync, or user account system unless a future stage explicitly approves it.

Before opening a pull request, run:

```bash
npm test
```

Please keep pull requests focused. If a change touches ranking, rectification, forecast input, or privacy boundaries, describe that explicitly.

## 中文

感谢关注本项目。本仓库是研究型原型，贡献时请保持以下边界：

- AI 之前的排盘、候选盘生成和校盘必须是确定性逻辑；
- AI 只能在结构化确定性输入生成之后使用；
- 不提交真实 API key、`.env` 文件、私人命例或可识别身份的评估数据；
- 不做医疗、法律、金融或安全关键场景的确定性承诺；
- 除非未来阶段明确批准，不新增登录、支付、数据库、云同步或用户系统。

提交 PR 前请运行：

```bash
npm test
```

请保持 PR 聚焦。如果改动涉及 ranking、rectification、forecast input 或隐私边界，请在 PR 中明确说明。
