# Game Rules / 运行规则

## Core Rule

Before candidate hour ranking is complete, the system must behave like a deterministic scoring engine, not like an AI fortune teller.

## Allowed Before Candidate Ranking

- structured birth input parsing;
- traditional symbol weak-prior scoring;
- candidate hour expansion around recorded time and boundary flags;
- deterministic event backtest interface;
- deterministic weighted ranking;
- evidence table generation;
- missing information and contradiction reporting.

## Not Allowed Before Candidate Ranking

- LLM or AI provider calls;
- prompt-based birth-hour decisions;
- narrative prediction;
- user-facing final claims about fate, personality, or outcomes.

## Allowed After Candidate Ranking

AI may organize context, explain uncertainty, and draft prediction reports only from an immutable deterministic result. The public browser forecast remains local and deterministic.

## Invariants

- All question definitions come from `configs/question_bank.v1.json`.
- All scoring weights come from `configs/scoring_weights.v1.json`.
- Unknown birth time produces a symmetric full-day candidate set.
- Context cannot change candidates, scores, ranking, or the selected chart.
- Missing derived data produces explicit warnings rather than invented values.
- No secret, real user case, or private identifying benchmark data may be committed.
