# QUESTIONNAIRE_SPEC

All questionnaire content must come from `configs/question_bank.v1.json`.

## Stages

1. `birth_input`: birth date, place, recorded time, uncertainty, boundary flags, chart sex.
2. `symbol_prior`: traditional weak-prior symbols such as hair whorl, fetal order, siblings, little finger, face shape, sleeping posture, birth posture, and early family structure.
3. `event_backtest`: major life years used later by deterministic backtesting.
4. `context_box`: real-world context facts used after candidate ranking for explanation and prediction.

## Round 01

Round 01 only needs to load and validate that these stages exist. UI rendering is for a later round.
