# RANKING OUTPUT ROUND 02

Ranking combines deterministic scoring layers into a Top 3 result.

Weights are always read from `configs/scoring_weights.v1.json`:

- `symbol_prior_fit`
- `event_timing_fit`
- `early_life_and_family_fit`
- `birth_record_plausibility`
- `domain_trajectory_fit`

The output includes:

- all ranked candidates;
- `top_3`;
- top candidate id;
- confidence values;
- evidence table;
- contradictions;
- missing information;
- warning when Top 1 and Top 2 are too close to force-lock a single hour.

Ranking must not call AI.
