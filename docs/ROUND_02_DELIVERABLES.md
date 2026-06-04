# ROUND 02 DELIVERABLES

Round 02 turns the Round 01 scaffold into a testable deterministic MVP core.

Delivered modules:

- `src/questionnaire.ts`: config-driven questionnaire flow and validation.
- `src/symbolPrior.ts`: G1/G2/G3 weak prior scoring.
- `src/candidateGeneration.ts`: 2-6 candidate-hour generation.
- `src/branchRelations.ts`: deterministic branch relation helpers.
- `src/eventBacktest.ts`: v1 deterministic event-scoring stub.
- `src/ranking.ts`: config-weighted Top 3 ranking output.
- `src/demo.ts`: end-to-end non-UI demo.

Still out of scope:

- Web UI.
- AI provider integration.
- Full BaZi calendar calculation.
- Login, payment, user system, database persistence.
