# Stage 10 Public Interactive Demo Panel

## Goal

A visitor should be able to click a GitHub Pages link and try a guided, static demo without cloning the repo.

The demo must communicate:

```text
BaZi derived function
+ user-controlled context profile
+ future forecast
```

without exposing private scoring weights or internal prompt strategy.

## Demo constraints

- Static site only.
- No backend.
- No real API key.
- No real OpenAI call.
- No user login.
- No cloud database.
- No external tracker.
- No secret strategy language.

## Suggested structure

```text
site/
  index.html
  styles.css
  app.js
  data/demo-session.json
```

## UX model

Use a modern AI workspace pattern:

```text
Left side:
  guided input wizard
  - birth profile
  - context profile
  - forecast question

Right side:
  live result preview
  - derived-function card
  - initial-value card
  - forecast report
  - export buttons
```

## Required demo sections

1. Hero with one-sentence value proposition.
2. “Try the demo” panel.
3. Stepper:
   - Birth input
   - Context profile
   - Forecast question
   - Generated report
4. Explanation cards:
   - deterministic first
   - context-aware forecast
   - local-first privacy
   - evaluation harness
5. Export buttons:
   - copy report
   - download JSON
   - download Markdown
6. Privacy copy:
   - demo is local;
   - no real API key;
   - no data leaves browser in static demo.

## Public language

Use:

```text
user-controlled context profile
context-aware forecast
deterministic derived-function pipeline
holdout benchmark
```

Avoid:

```text
hidden trick
secret data collection
unfair advantage
we disguise the questionnaire
```
