# Stage 10 Roadmap: Public Demo + Repository Hygiene

## Position

Stage 10 happens after Stage 9 GitHub Release Polish.

At this point, the project has:

- deterministic chart and rectification pipeline;
- Bazi derived-function layer;
- context profile / initial-value layer;
- future forecast engine;
- evaluation harness;
- privacy / storage controls;
- bilingual README and public docs.

Stage 10 turns the repository into something a non-technical visitor can understand and try.

## Core goals

1. **Clean the repository root**
   - Move one-off PM startup files and old workflow files out of the root.
   - Keep root files conventional and credible.

2. **Make the project directly usable from GitHub**
   - Add a static public demo under `site/`.
   - Deploy via GitHub Pages.
   - Add a visible README CTA: “Try the interactive demo”.

3. **Improve public presentation without revealing internal strategy**
   - Public message: deterministic BaZi derived-function engine + user-controlled context profile + context-aware forecast.
   - Do not mention hidden tricks, secret questionnaire strategy, private weights, private prompts, or “unfair advantage”.

## High-level flow

```text
Repo hygiene
  ↓
Static demo site
  ↓
GitHub Pages deploy workflow
  ↓
README CTA + About metadata
  ↓
Audit
  ↓
Commit + push
```

## Non-goal

Stage 10 must not change prediction, rectification, ranking, forecast logic, or data model semantics.
