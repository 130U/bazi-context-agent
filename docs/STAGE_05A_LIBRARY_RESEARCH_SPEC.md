# Stage 5A Library Research Spec

## Goal

Find the best way to generate the BaZi derivative function without rebuilding the full BaZi engine from scratch.

## Candidate Categories

### Base BaZi Engine

Purpose:

```text
Recorded birth time -> BaZi pillars + basic derived information
```

Primary candidate:

- 6tail/lunar-javascript

Why:

- JavaScript / Node-compatible.
- Supports solar/lunar calendar, gan-zhi, jieqi, na yin, stars, BaZi, five elements, ten gods and related calendar metadata.
- MIT license.
- Mature enough to be a foundation candidate.

### Enrichment Engine

Purpose:

```text
BaZi pillars or birth time -> higher-level BaZi interpretation structures
```

Primary candidate:

- mystilight/mystilight-8char

Why:

- Appears to expose BaZi charting, da-yun/liu-nian, ten gods, five-element strength and shensha features.
- But reputation is lower than 6tail, so it should be experimental until tested.

### Rectification Architecture Reference

Purpose:

```text
Learn event-based birth-time rectification architecture
```

Primary reference:

- VedAstro/VedAstro

Why:

- Has Birth Time Finder concept.
- Open-source and architecture-rich.
- But Vedic, not BaZi; should not decide BaZi.

## Research Questions

For each candidate, Codex should evaluate:

- license;
- stars/forks/release activity;
- runtime;
- TypeScript/Node fit;
- ability to compute BaZi pillars;
- ability to compute five elements;
- ability to compute ten gods;
- hidden stems;
- na yin;
- stars;
- shensha;
- clashes/combinations/punishments/harms;
- da yun;
- liu nian;
- current year/luck;
- fixed pillars input support;
- birth datetime input support;
- test coverage;
- API stability;
- integration risk.

## Expected Conclusion Format

```markdown
## Recommended Base Library
...

## Recommended Enrichment Library
...

## Reference-Only Projects
...

## Not Recommended
...

## Adapter Strategy
...

## Risks
...
```

## Non-Goals

- Do not implement forecast.
- Do not rewrite ranking.
- Do not use context_box for rectification.
- Do not add AI provider.
- Do not install dependency unless a minimal spike is explicitly justified.

