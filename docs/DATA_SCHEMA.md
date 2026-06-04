# DATA_SCHEMA

Round 01 TypeScript types live in `src/types.ts`.

Required core types:

- `BirthInput`
- `SymbolAnswer`
- `LifeEvent`
- `ContextFact`
- `CandidateChart`
- `CandidateScore`
- `HourGroupPrior`

## Evidence Model

Every score should be explainable with evidence items that distinguish:

- known user fact;
- deterministic rule;
- missing information;
- contradiction.

No private user data or real user examples should be committed.
