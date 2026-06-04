# AI_POLICY

## Boundary

AI is forbidden before deterministic candidate ranking is complete.

## Before Ranking

The following must be deterministic code:

- birth input parsing;
- symbol prior scoring;
- candidate generation;
- event backtest scoring;
- Top 3 ranking.

## After Ranking

AI may later be used to:

- organize the context box;
- explain ranked evidence;
- generate a report draft;
- produce prediction language from already-ranked deterministic inputs.

## Secrets

Do not commit API keys, `.env` files, private user data, or private BaZi examples.
