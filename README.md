# bazi-context-agent

BaZi hour-rectification and context-augmented prediction MVP.

Core boundary:

```text
Before candidate ranking: deterministic code only.
After candidate ranking: AI may later help with context reasoning and report generation.
```

Round 01 implements a minimal Node.js + TypeScript deterministic core. It does not call OpenAI or any AI provider.

## Run

```powershell
npm test
npm run demo
```

If a stale Windows terminal resolves `node` to a restricted WindowsApps shim, run the same test command with the installed Node path:

```powershell
& 'C:\Program Files\nodejs\node.exe' --test tests/*.test.ts
```

This project currently uses Node.js 24 native TypeScript execution and has no external runtime dependencies.

## Round 02 Status

Round 02 adds the deterministic questionnaire and scoring engine:

- config-driven questionnaire traversal and validation;
- G1/G2/G3 symbol-prior scoring with evidence and fetal-order rules;
- 12-hour candidate generation with adjacent-hour, Zi-boundary, unknown-time, solar-term, and date-boundary stubs;
- deterministic year-branch/hour-branch event backtest interface;
- config-weighted Top 3 ranking with evidence table, contradictions, missing information, confidence, and close-score warning.

No UI or AI provider is included in Round 02.

## Round 01 Modules

- `src/types.ts`: core data types.
- `src/config.ts`: JSON config loading.
- `src/questionnaire.ts`: config-driven questionnaire engine.
- `src/symbolPrior.ts`: deterministic weak-prior scoring.
- `src/candidateGeneration.ts`: deterministic candidate-hour stub.
- `src/branchRelations.ts`: deterministic year-branch/hour-branch relation helpers.
- `src/eventBacktest.ts`: deterministic event scoring stub.
- `src/ranking.ts`: weighted Top 3 ranking.
