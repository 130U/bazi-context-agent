# Stage 5B: Lunar Javascript Adapter

## Candidate library

The primary base adapter candidate is `6tail/lunar-javascript`.

Why:

```text
- JavaScript ecosystem;
- MIT license according to project page;
- supports solar/lunar calendar, GanZhi, JieQi, NaYin, XingXiu, BaZi, WuXing, ShiShen, ChongSha and related calendar metadata;
- better fit for current Node/TypeScript code than Python/Go libraries.
```

## Stage 5B implementation level

Stage 5B does not need to exhaust every API. It should build a safe wrapper and a minimal useful profile.

Minimum required mapping:

```text
RecordedBirthTime -> FixedPillars -> BaziDerivedProfile
```

If `lunar-javascript` exposes five elements, ten gods, NaYin, XingXiu, ChongSha, hidden stems, luck cycles or annual fortunes, map them into the corresponding fields. If not available or unknown, use empty arrays / null-like placeholders and add warnings.

## Dependency policy

Codex may attempt to install:

```bash
npm install lunar-javascript
```

But if installation or import fails, Stage 5B must still pass by:

```text
- preserving adapter interface;
- using StaticBaziAdapter in tests;
- documenting LunarJavascriptAdapter as pending integration.
```

## Testing requirements

Tests must prove:

```text
- recorded birth time can be converted into a BaziDerivedProfile when adapter is available;
- fixed pillars can always be converted through StaticBaziAdapter;
- adapter output contains all required top-level fields;
- adapter does not affect /api/ranking;
- adapter does not read or use context_box;
- adapter does not call AI.
```
