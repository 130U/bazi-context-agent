# Stage 09 Private Advantage Boundary

## Purpose

This file defines what can be public and what should remain implementation-private.

## Publicly safe

- The system separates BaZi-derived structure from structured context.
- Questionnaire answers help build context for personalization and evaluation.
- AI is used only after chart selection.
- The system supports A/B/C/D evaluation modes.
- The system is local-first and privacy-aware.

## Do not expose in README

- Exact question-to-forecast feature mapping.
- Detailed hidden scoring weights beyond public configs.
- Prompt orchestration details.
- Private benchmark cases.
- Proprietary calibration examples.
- Any wording that reveals the strategic role of specific questionnaire items in downstream prediction.

## Ethical line

Do not hide from users that their answers may be used for personalization and forecasting. The private advantage is in the implementation details, not in deceiving users.
