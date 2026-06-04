# ROUND 02 ACCEPTANCE

- [x] Questionnaire engine reads `configs/question_bank.v1.json`.
- [x] Four layers exist: `birth_input`, `symbol_prior`, `event_backtest`, `context_box`.
- [x] Answer validation rejects illegal choices.
- [x] Short text max length validation is covered.
- [x] Conditional question visibility is covered.
- [x] Symbol prior scoring is deterministic.
- [x] Symbol prior output sums to 1.
- [x] Fetal-order scoring maps by traditional chart sex.
- [x] Candidate generation handles recorded time.
- [x] Candidate generation handles Zi-hour boundary.
- [x] Candidate generation handles unknown time.
- [x] Event branch relation scoring is deterministic.
- [x] Ranking outputs Top 3.
- [x] Ranking uses weights from `configs/scoring_weights.v1.json`.
- [x] Tests confirm no AI provider import/call in candidate-ranking path.
- [x] Demo runs with `npm run demo`.
