# AI Policy / AI 使用策略

## Boundary

AI is forbidden before deterministic candidate ranking and rectification are complete.

## Before Ranking

The following must be deterministic code:

- birth input parsing;
- symbol prior scoring;
- candidate generation;
- event backtest scoring;
- Top 3 ranking;
- working-chart selection and protection rules.

## After Ranking

After an immutable ranking/rectification snapshot exists, AI may be used to:

- organize user-provided context without changing upstream evidence;
- explain ranked evidence;
- generate a report draft;
- produce prediction language from already-ranked deterministic inputs.

The public GitHub Pages experience does not call AI. The local API defaults to a mock provider; a real provider requires a server-side environment flag, validated output, timeout, response-size limit, and redaction.

## Secrets

Do not commit API keys, `.env` files, private user data, or private BaZi examples.
