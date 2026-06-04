# Round 03 Acceptance Checklist

## Preflight

- [ ] Round 02.5 tests were committed or cleanly preserved before Round 03 work.
- [ ] `npm test` passed before starting Round 03.

## Local UI

- [ ] package.json has a local UI script, e.g. `npm run ui` or `npm run web`.
- [ ] local server can start and close.
- [ ] home page returns HTML.
- [ ] browser flow contains 5 steps: birth_input, symbol_prior, event_backtest, context_box, ranking_result.

## Data Source

- [ ] UI/questionnaire reads from `configs/question_bank.v1.json` or questionnaire engine.
- [ ] UI does not hardcode the complete question bank.
- [ ] scoring uses `configs/scoring_weights.v1.json`.

## API / Handler

- [ ] question handler returns four layers.
- [ ] symbol handler returns G1/G2/G3.
- [ ] candidate handler returns 2–6 candidates.
- [ ] ranking handler returns Top 3.
- [ ] ranking output includes confidence.
- [ ] ranking output includes evidence table.
- [ ] ranking output includes contradictions.
- [ ] ranking output includes missing_information.

## Product Copy

- [ ] UI says recorded birth time is prior, not truth.
- [ ] UI says symbol prior is weak and cannot determine the chart alone.
- [ ] UI says context_box is for later prediction, not Round 03 chart ranking.

## Tests

- [ ] Existing tests still pass.
- [ ] Server start/close test exists.
- [ ] Home HTML test exists.
- [ ] Questionnaire API/handler test exists.
- [ ] Symbol API/handler test exists.
- [ ] Candidate API/handler test exists.
- [ ] Ranking API/handler test exists.
- [ ] No AI boundary test still passes.
- [ ] No heavy UI framework test exists.

## Scope Guard

- [ ] No OpenAI / Anthropic / LLM provider.
- [ ] No AI before candidate ranking.
- [ ] No React / Next / Vite / Vue / Svelte.
- [ ] No login / payment / user system.
- [ ] No database.
- [ ] No Zi Wei Dou Shu / Qi Men / Feng Shui.

## Final

- [ ] `npm test` passes.
- [ ] Round 03 commit created only after tests pass.
- [ ] Chinese completion report provided.
