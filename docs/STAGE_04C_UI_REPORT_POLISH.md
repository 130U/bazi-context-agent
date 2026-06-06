# Stage 4C UI Report Polish

## Goal

Stage 4C improves the product surface after Stage 4A/4B prediction is working.

It turns the prediction output into a readable report-style experience:

1. structured prediction display;
2. provider status display;
3. report preview;
4. JSON / Markdown export;
5. privacy and boundary copy.

## Required UI Sections

The prediction result UI must show:

- Conclusion;
- Known facts;
- Chart signals;
- Context adjustments;
- Prediction answer;
- Confidence;
- Uncertainty;
- Next questions;
- Policy metadata.

## Required Report Area

After prediction result appears, the UI should show:

- report preview;
- export JSON button;
- export Markdown button;
- privacy notice;
- boundary notice.

## Boundary Copy

The UI must explicitly state:

- candidate ranking is deterministic;
- AI/provider does not participate in ranking;
- context_box does not participate in ranking;
- context_box only affects prediction;
- exported reports may contain user-provided personal information;
- API keys are never exported.

## Implementation Constraint

Use the existing local server and vanilla HTML/JS/CSS.

Do not add React, Next, Vite, Vue, Svelte, login, payment, database, or user system.
