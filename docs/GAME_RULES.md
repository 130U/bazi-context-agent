# GAME_RULES

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

AI can be added later to organize context, explain uncertainty, and draft prediction reports from an already-ranked deterministic result.
