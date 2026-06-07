# Consent and Privacy Copy

## Required privacy notice

The UI should show a concise privacy notice:

```text
你的信息默认只保存在本机浏览器/本地会话中。
你可以导出、导入、隐藏、删除或清空数据。
隐藏的信息不会用于后续预测或导出。
删除的信息会从本地 session 中移除。
不要输入过度敏感的信息，例如完整身份证号、真实 API key、银行卡信息、详细医疗记录。
```

## Required boundary copy

The UI should clearly say:

```text
八字定盘 / 候选盘排序是 deterministic。
context_box 不参与定盘。
context_box 只用于未来预测的 initial value。
AI 不参与 ranking / rectification。
```

## Consent-like toggle

Stage 8 may include a non-legal consent toggle:

```text
我理解这些信息将用于本地会话恢复、报告导出和未来预测输入构建。
```

This is product copy, not a legal compliance implementation.

## No legal overclaim

Do not claim full GDPR/PDPA/HIPAA compliance.
Stage 8 implements privacy-oriented controls, not legal certification.
