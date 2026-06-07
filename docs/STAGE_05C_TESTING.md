# Stage 5C Testing Requirements

## Required tests

1. DefaultChart generation from exact recorded birth time.
2. DefaultChart prior score based on certainty.
3. Candidate generation for `within_1_hour`.
4. Candidate generation for `time_range`.
5. Candidate generation for `part_of_day`.
6. Candidate generation for `unknown_time`.
7. Boundary expansion for `near_zi_hour`.
8. Boundary expansion for `near_hour_boundary`.
9. Boundary warning for `near_solar_term`.
10. Adapter enrichment is attempted when adapter exists.
11. Adapter failure returns warnings, not a fatal error.
12. Candidate generation does not use context_box.
13. Candidate generation does not use AI.
14. `/api/ranking` remains unchanged and deterministic.
15. Stage 4 prediction/report tests still pass.

## No AI scan

Existing no-provider scans should continue to pass.
OpenAI provider is allowed only in Stage 4B prediction path, not Stage 5C chart generation.

## Test command

```powershell
$env:Path='C:\Program Files\nodejs;' + $env:Path; npm.cmd test
```
