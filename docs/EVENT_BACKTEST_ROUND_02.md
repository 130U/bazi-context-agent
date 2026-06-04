# EVENT BACKTEST ROUND 02

Round 02 event backtest scoring is a deterministic v1 stub.

It exposes:

- `getYearBranch(year)`;
- `getBranchRelations(a, b)`;
- `scoreEventBacktest(candidates, events)`.

Temporary relation rules:

- year branch index: `(year - 4) mod 12`;
- clash;
- six harmony;
- harm;
- triad same group;
- same branch.

The output includes per-candidate:

- `event_timing_fit`;
- `per_event_scores`;
- `matched_rules`;
- `contradictions`;
- `missing_information`;
- warning that this is not full BaZi calendar scoring.
