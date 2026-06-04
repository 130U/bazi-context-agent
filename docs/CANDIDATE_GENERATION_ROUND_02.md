# CANDIDATE GENERATION ROUND 02

Candidate generation creates 2-6 candidate hour charts from:

- recorded birth time;
- uncertainty range;
- boundary flags;
- symbol prior.

It defines all 12 traditional hours and handles:

- recorded time;
- adjacent hour expansion;
- `near_midnight` / Zi-hour boundary;
- early/late Zi and date rollover flags;
- `near_solar_term` as a retained stub flag;
- date offset as a retained stub flag;
- unknown birth time by selecting candidates from strongest symbol-prior groups.

This module does not perform complete BaZi calendar calculation.
