# Stage 5B Testing Plan

## Required tests

Stage 5B must add tests for:

1. `StaticBaziAdapter` converts fixed pillars into a `BaziDerivedProfile`.
2. `BaziDerivedProfile` contains every required top-level field.
3. Missing optional derived fields are represented as empty arrays / placeholders plus warnings, not crashes.
4. Adapter output does not contain context_box facts.
5. Adapter does not call AI provider.
6. Adapter does not read `OPENAI_API_KEY` or other secrets.
7. Adapter does not modify `/api/ranking` output.
8. Existing Stage 0–4 tests still pass.

## Optional tests if lunar-javascript is installed

1. `LunarJavascriptAdapter` can derive a profile from a recorded birth time.
2. The profile includes non-empty four pillars.
3. The adapter records `source_libraries` containing `6tail/lunar-javascript`.
4. If library output lacks certain fields, warnings are populated.

## No-network rule

Tests must not call external network services.

Installing npm dependencies is allowed only as part of local package management. Runtime tests must be local and deterministic.
