# SCORING_SPEC

All scoring weights must come from `configs/scoring_weights.v1.json`.

## Candidate Score Formula

```text
total =
  symbol_prior_fit * candidate_score_weights.symbol_prior_fit
  + event_timing_fit * candidate_score_weights.event_timing_fit
  + early_life_and_family_fit * candidate_score_weights.early_life_and_family_fit
  + birth_record_plausibility * candidate_score_weights.birth_record_plausibility
  + domain_trajectory_fit * candidate_score_weights.domain_trajectory_fit
```

If contradiction penalties are enabled, deterministic contradictions may reduce score. Round 01 only reports contradiction fields and does not invent private user facts.

## Symbol Prior

Symbol answers create a weak prior over three hour groups:

- `G1_zi_wu_mao_you`: 子午卯酉
- `G2_yin_shen_si_hai`: 寅申巳亥
- `G3_chen_xu_chou_wei`: 辰戌丑未

The symbol prior is weak and cannot by itself finalize the birth hour.

## Event Backtest

Round 01 implements a deterministic interface stub. The full BaZi calendar and event-timing logic must replace the stub later behind the same interface.
