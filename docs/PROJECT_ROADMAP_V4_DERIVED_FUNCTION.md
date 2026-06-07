# Project Roadmap V4: Derivative Function Line

## Current Position

```text
Stage 0   Project initialization / GitHub / AGENTS.md                 DONE
Stage 1   TypeScript scaffold + config loading + scoring stub         DONE
Stage 2   Questionnaire engine + symbol scoring + deterministic rank   DONE
Stage 2.5 Test hardening                                               DONE
Stage 3   Local UI flow                                                DONE
Stage 3.5 context_box not used for ranking boundary fix                DONE
Stage 4A  Mock Prediction Layer                                        DONE
Stage 4B  OpenAI Provider behind env flag                              DONE
Stage 4C  Prediction report UI + JSON/Markdown export                  DONE
Stage 5   BaZi Derived Function Engine                                 CURRENT
Stage 6   Future Forecast Engine                                       NEXT
Stage 7   Evaluation / holdout benchmark                               LATER
Stage 8   Privacy / storage / user control                             LATER
Stage 9   GitHub release polish                                        LATER
```

## Core Product Equation

```text
Derivative Function = BaZi + BaZi-derived timing structure
Initial Value       = Questionnaire-derived real-world context
Forecast            = AI reasoning over Derivative Function + Initial Value + current date
```

The project is not trying to prove that the questionnaire alone can magically determine a perfect BaZi chart. The questionnaire has two distinct purposes:

1. Rectification evidence: dated major events help test candidate charts.
2. Forecast context: family, education, siblings, preference, actual path and current anxiety become initial value for future prediction.

## Global Pipeline

```text
Birth Input
  -> DefaultChart from recorded birth time
  -> CandidateChart[] only if time is uncertain
  -> BaZi Engine Adapter
  -> BaziDerivedProfile = derivative function
  -> Rectification v2 only using dated events + weak symbols
  -> Context Box = initial value
  -> ForecastInput
  -> AI Future Forecast
  -> Report / export / evaluation
```

## Hard Boundary

```text
Deterministic layer:
- birth input
- chart generation
- derived BaZi profile
- candidate ranking
- rectification evidence scoring

AI-assisted layer:
- prediction explanation
- future forecast
- report wording

Never allow:
- AI to modify ranking
- context_box to modify ranking
- provider output to modify candidate scores
```

## Stage 5 Definition

Stage 5 is not “write a full BaZi calendar engine from scratch.”

Stage 5 is:

```text
BaZi Derived Function Engine
```

Its job is to take recorded/candidate birth data and produce a standard internal structure:

```text
BaziDerivedProfile
```

This profile should contain the eight characters and derived information such as five elements, ten gods, hidden stems, na yin, stars, shensha, relations, luck cycles and annual fortunes if available.

## Stage 6 Definition

Stage 6 is:

```text
Future Forecast Engine
```

Its job is to combine:

```text
BaziDerivedProfile + ContextBox + known life events + current date + user question
```

and produce a forward-looking forecast.

