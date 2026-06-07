# Stage 5A Library Research Result

## Executive Summary

There is no perfect open-source BaZi birth-time rectification project that can be dropped into this MVP as-is.

The best Stage 5 strategy is:

- **Base adapter**: `6tail/lunar-javascript`
- **Enrichment adapter candidate**: `mystilight/mystilight-8char`
- **Architecture references only**: `VedAstro/VedAstro`, `naturalstupid/PyJHora`
- **Do not adopt as primary**: `afjoseph/sacredstar`, `tommitoan/bazica`

Stage 5 should build our own adapter boundary and rectification layer. External libraries can compute the BaZi derivative function, but they should not own product semantics, ranking policy, or the boundary between rectification evidence and context_box.

## Project Definitions

### Derived Function

In this project:

```text
derived function = BaZi chart + BaZi-derived luck/structure information
```

The derived function includes pillars, day master, five elements, ten gods, hidden stems, na yin, relations, luck cycles, and annual/current luck structures when available.

### Initial Value

```text
initial value = real-world initial state collected by questionnaire
```

The context_box is part of the initial value for forecast/prediction. It is not chart evidence.

### Questionnaire Dual Use

- `event_backtest` / major dated events are used for rectification evidence.
- `context_box` is used later for forecast initial value.
- `context_box` must not enter rectification ranking.

### Stage Boundary

- DefaultChart comes from the user recorded birth time.
- CandidateChart[] is generated only when birth time is uncertain.
- BaziDerivedProfile comes from the adapter layer.
- AI does not participate in chart selection or candidate ranking.
- Stage 5 does not produce final forecast.
- Stage 6 is the Future Forecast Engine.

## Candidate Comparison

| Project | Open Source | License | Activity / Reputation | Runtime | Node Fit | BaZi Pillars | Derived Structures | Luck / Current Year | Fixed Pillars | Rectification | Recommended Role |
|---|---:|---|---|---|---|---|---|---|---|---|---|
| `6tail/lunar-javascript` | Yes | MIT | Mature; GitHub shows about 1.5k stars, 268 forks, 54 releases, latest v1.7.7 on 2025-11-05 | JavaScript | Excellent | Yes, via birth datetime | Five elements, ten gods, na yin, stars, gan-zhi, calendar metadata | Partial; good calendar/time base, not full product rectification | Not primary API shape | No | **Base library** |
| `mystilight/mystilight-8char` | Yes | ISC | Newer; npm latest 1.0.0; ecosystem listing shows about 84 stars and 39 forks | JavaScript / TypeScript typings | Good but needs spike | Yes | Strong: hidden stems, five elements, ten gods, na yin, relations, dayun, liunian/currentYun | Yes, based on published typings | Yes, `fromBaZi(...)` appears available | No | **Enrichment candidate** |
| `VedAstro/VedAstro` | Yes | MIT | Mature Vedic project; public site reports 100% open source and GitHub topic page shows 500+ stars | C#/.NET, API, Python | Medium/High friction | No, Vedic not BaZi | Rich Vedic calculations and API architecture | Yes, Vedic | Not BaZi | Has Birth Time Finder concept | **Architecture reference only** |
| `naturalstupid/PyJHora` | Yes | See project LICENSE | Mature Vedic/Jyotish Python package; GitHub page shows 178 stars, 101 forks, 24 releases | Python | High friction | No, Vedic not BaZi | Very broad Jyotish features and many tests | Yes, Vedic dasha/annual systems | Not BaZi | Useful reference only | **Reference only** |
| `tommitoan/bazica` | Yes | MIT | Go module v0.1.9; Go docs show not stable v1 and no package docs | Go | High friction | Possible | Unknown / thin | Unknown | Unknown | No | **Not primary** |
| `afjoseph/sacredstar` | Not verified | Unknown | Authoritative repo/package could not be reliably found from web search | Unknown | Unknown | Unknown | Unknown | Unknown | Unknown | Unknown | **Not recommended** |
| `SylarLong/iztro` | Yes | Check before use | Active and popular, but Zi Wei Dou Shu | TypeScript | Good technically | No, Zi Wei not BaZi | Zi Wei-specific | Zi Wei-specific | No | No | Out of scope |

## Detailed Findings

### 1. 6tail/lunar-javascript

Recommended as the base engine.

Evidence:

- GitHub repository: https://github.com/6tail/lunar-javascript
- README states npm usage through `lunar-javascript`.
- README describes support for solar/lunar calendar, gan-zhi, zodiac, jieqi, na yin, stars, BaZi, five elements, ten gods, daily auspicious/inauspicious metadata, directions, clash/sha and related calendar metadata.
- GitHub page lists MIT license, JavaScript, about 1.5k stars, 268 forks, 54 releases, and latest release v1.7.7 dated 2025-11-05.

Strengths:

- Best Node fit.
- Mature compared with alternatives.
- Good low-level deterministic calendar and BaZi foundation.
- MIT license.
- No need to introduce Python/Go/.NET bridge.

Weaknesses:

- Not a complete birth-time rectification product.
- Does not own our evidence model.
- Fixed-pillar input may need adapter-level handling or separate enrichment.
- Need spike in Stage 5C to confirm exact API coverage for hour pillar, jieqi boundary handling, da-yun needs, and current luck packaging.

Conclusion:

Use it as the base source of deterministic BaZi/calendar facts.

### 2. mystilight/mystilight-8char

Recommended as an enrichment adapter candidate, not as the first base dependency.

Evidence:

- Package: https://app.unpkg.com/mystilight-8char@1.0.0
- Package metadata says it is a JavaScript library for Chinese Eight Characters calculation and analysis.
- Package metadata lists license ISC, version 1.0.0, Node >=12, and repository `mystilight/mystilight-8char`.
- Type definitions expose `getCurrentEightCharJSON(...)`, `fromBaZi(...)`, pillars, hidden stems, five elements, ten gods, na yin, dayun arrays, liunian, currentYun, gan/zhi relations and analysis blocks.
- Ecosystem listing reports recent activity and about 84 stars / 39 forks.

Strengths:

- Stronger BaZi-derived data surface than 6tail for our Stage 5 target.
- Has TypeScript definitions.
- Appears to support both birth datetime input and fixed pillars via `fromBaZi(...)`.
- Includes current/luck structures that are useful for Stage 5E/Stage 6 input construction.

Weaknesses:

- Newer and less proven than 6tail.
- Large bundled JS output.
- API quality and calculation assumptions require spike tests.
- Should not be trusted as the only source until cross-checked against 6tail and expected known cases.

Conclusion:

Use as enrichment candidate behind an adapter. Do not let its output directly drive ranking without normalization and tests.

### 3. VedAstro/VedAstro

Recommended as rectification architecture reference only.

Evidence:

- GitHub repository: https://github.com/VedAstro/VedAstro
- Project site says it is open source, uses a MIT-licensed C# library, uses Swiss Ephemeris, and provides free APIs/libraries.
- GitHub README advertises a REST API, .NET library, Python library, Docker image, datasets, and a Birth Time Finder concept.
- GitHub topic page shows VedAstro as an active C# Vedic astrology project.

Strengths:

- Good architecture reference for event-based birth-time finder workflows.
- Strong developer surface: API, Docker, C# library, Python library.
- Useful inspiration for testable calculation modules and exposed APIs.

Weaknesses:

- Vedic/Jyotish, not BaZi.
- Different metaphysical primitives and derived structures.
- Node integration is possible but not the natural path.
- Should not decide BaZi chart ranking.

Conclusion:

Use only as architecture reference for rectification design, not as BaZi engine.

### 4. naturalstupid/PyJHora

Recommended as reference only.

Evidence:

- GitHub repository: https://github.com/naturalstupid/PyJHora
- README describes it as a Python package covering features from `Vedic Astrology - An Integrated Approach` and Jagannatha Hora.
- GitHub page reports about 178 stars, 101 forks, 24 releases, and latest release V4.8.5 on 2026-05-15.
- README mentions about 6800 tests and broad dhasa/divisional chart features.

Strengths:

- Rich, tested Vedic/Jyotish computational reference.
- Useful for thinking about test vectors, data-heavy calculation engines, and long-range ephemeris concerns.

Weaknesses:

- Vedic/Jyotish, not BaZi.
- Python integration adds runtime complexity.
- Large data/ephemeris footprint.
- Not suitable for TypeScript-first BaZi derived function.

Conclusion:

Reference only; do not integrate in Stage 5.

### 5. tommitoan/bazica

Not recommended as primary.

Evidence:

- Go package page: https://pkg.go.dev/github.com/tommitoan/bazica/app
- Go module v0.1.9, published 2024-04-08, MIT license.
- Go docs state the package is not stable v1 and has no package documentation.

Strengths:

- Name and source files indicate BaZi calculation focus.
- MIT license.

Weaknesses:

- Go runtime does not fit current TypeScript/Node project.
- No visible docs on pkg.go.dev.
- Not stable v1.
- Unclear derived feature surface.

Conclusion:

Do not use unless Stage 5C/5D later discovers a specific gap not covered by the JS libraries.

### 6. afjoseph/sacredstar

Not recommended.

Evidence:

- Web search did not locate a reliable authoritative repository or package for `afjoseph/sacredstar`.

Conclusion:

Treat as unavailable until the user provides a concrete URL or package reference.

### 7. Other Related Projects

Projects such as `SylarLong/iztro` are active and TypeScript-friendly, but they are Zi Wei Dou Shu. They are explicitly out of scope for this MVP and should not be integrated.

Western/Vedic horoscope libraries can inform UI/API patterns but do not solve BaZi derived function generation.

## Answer to Required Questions

### Is there a perfect drop-in open-source BaZi birth-time rectification project?

No.

There are useful BaZi calculation libraries and useful rectification architecture references, but no project found that provides:

- TypeScript-first BaZi chart generation;
- rich derived BaZi structure;
- event-based birth-time rectification;
- deterministic candidate ranking;
- context_box separation;
- production-ready adapter shape;
- and direct fit with this MVP.

### What layer should we build ourselves?

Build these layers ourselves:

1. `BaziEngineAdapter` boundary.
2. `BaziDerivedProfile` normalized schema.
3. DefaultChart and CandidateChartV2 normalization.
4. Rectification v2 evidence/ranking policy.
5. ForecastInput builder that combines derived function + initial value without feeding context_box back into ranking.

Do not rebuild full calendar/BaZi low-level math unless the selected libraries fail spike tests.

### Recommended base library

`6tail/lunar-javascript`

### Recommended enrichment library

`mystilight/mystilight-8char`, behind an experimental enrichment adapter.

### Recommended reference libraries

- `VedAstro/VedAstro`
- `naturalstupid/PyJHora`

### Not recommended

- `afjoseph/sacredstar`: source not verified.
- `tommitoan/bazica`: Go runtime, no package docs, pre-v1.
- Zi Wei / Qi Men / Feng Shui libraries: out of MVP scope.

### Should we use dual adapters?

Yes, tentatively:

```text
base adapter: 6tail/lunar-javascript
enrichment adapter: mystilight-8char
```

But Stage 5B should define the adapter interface first, and Stage 5C should spike each library behind that interface.

### Should VedAstro be architecture reference only?

Yes.

VedAstro has useful birth-time finder and API architecture ideas, but it is Vedic, not BaZi. It should not decide BaZi candidate ranking.

## Integration Risks

1. **Boundary risk**: enrichment output may accidentally become ranking evidence without explicit policy.
2. **Calendar assumption risk**: day boundary, zi hour, timezone, jieqi and sect assumptions must be captured.
3. **API stability risk**: mystilight is newer and must be guarded by tests.
4. **License/runtime risk**: non-JS or non-permissive libraries should not enter production path.
5. **False certainty risk**: Stage 5 derived function must carry assumptions and warnings rather than pretending final certainty.

## Stage 5A Recommendation

Proceed to Stage 5B.

Stage 5B should not install libraries yet. It should define:

- `RecordedBirthTime`
- `DefaultChart`
- `CandidateChartV2`
- `FixedPillars`
- `BaziDerivedProfile`
- `BaziEngineAdapter`
- explicit adapter errors
- assumptions/warnings fields

Only after that should Stage 5C install/spike `6tail/lunar-javascript` and optionally `mystilight-8char`.

## Sources Checked

- 6tail/lunar-javascript: https://github.com/6tail/lunar-javascript
- mystilight-8char package: https://app.unpkg.com/mystilight-8char@1.0.0
- mystilight-8char typings: https://app.unpkg.com/mystilight-8char@1.0.0/files/index.d.ts
- VedAstro repository: https://github.com/VedAstro/VedAstro
- VedAstro open-source page: https://vedastro.org/OpenSource.html
- PyJHora repository: https://github.com/naturalstupid/PyJHora
- bazica Go package: https://pkg.go.dev/github.com/tommitoan/bazica/app
