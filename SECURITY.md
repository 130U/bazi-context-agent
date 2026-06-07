# Security Policy / 安全政策

## Reporting Vulnerabilities / 漏洞报告

Please do not disclose security vulnerabilities publicly before maintainers have had a chance to review them.

在维护者有机会审查之前，请不要公开披露安全漏洞。

## Secrets / 密钥

Never commit:

- `.env`
- real API keys
- OpenAI API keys
- Anthropic API keys
- GitHub tokens
- private user data
- real evaluation cases with identifying information

永远不要提交：

- `.env`
- 真实 API key
- OpenAI API key
- Anthropic API key
- GitHub token
- 私人用户数据
- 带身份信息的真实评估案例

## AI and Data Boundary / AI 与数据边界

AI must not participate in chart ranking or rectification. User-provided context may personalize forecasts only after deterministic chart work is complete.

AI 不得参与候选盘排序或校盘。用户提供的上下文只能在确定性排盘和校盘完成之后用于个性化预测。

## Supported Versions / 支持版本

This is a research prototype. This security policy applies to the current `master` branch unless stated otherwise.

本项目是研究型原型。除非另有说明，本安全政策适用于当前 `master` 分支。
