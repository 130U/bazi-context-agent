# Questionnaire Specification / 问卷规格

All questionnaire content must come from `configs/question_bank.v1.json`.

## Stages

1. `birth_input`: birth date, place, recorded time, uncertainty, boundary flags, chart sex.
2. `symbol_prior`: traditional weak-prior symbols such as hair whorl, fetal order, siblings, little finger, face shape, sleeping posture, birth posture, and early family structure.
3. `event_backtest`: major life years used by deterministic backtesting; C9 preserves best/worst polarity.
4. `context_box`: real-world context facts used after candidate ranking for explanation and prediction.

## Runtime contract / 运行契约

- 浏览器表单必须从运行配置生成，不得复制问题文本或选项。
- 题目 ID 必须唯一；选项、条件、长度、数量限制和顺序必须通过启动校验。
- 出生时间允许明确选择“不确定 / 不知道”，并同步扩大候选范围。
- B/C 阶段按配置顺序自适应提问；达到稳定门或问题上限后才能锁定。
- D 阶段只在锁定后开始，其答案不得改变任何校时结果。
- 必填错误必须显示可读信息、设置 `aria-invalid` 并把焦点移到首个无效控件。
