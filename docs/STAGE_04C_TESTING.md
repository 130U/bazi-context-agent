# Stage 4C Testing

Stage 4C must add tests for report generation and UI/export safety.

## Required Tests

- report builder returns full report object;
- report builder excludes API keys;
- report builder excludes raw provider request/response;
- markdown export includes required sections;
- JSON export is serializable;
- /api/report errors when rankingSnapshot is missing;
- /api/report errors when predictionResult is missing;
- /api/report does not call ranking;
- /api/report does not call prediction;
- /api/report does not modify rankingSnapshot;
- UI HTML contains prediction display section;
- UI HTML contains report preview section;
- UI HTML contains JSON/Markdown export buttons;
- UI HTML contains privacy notice;
- no OpenAI network call in tests;
- no real .env;
- no real API key;
- no UI framework dependency.

## Existing Boundary Tests Must Remain Passing

- /api/ranking does not use AI;
- /api/ranking does not use context_box;
- /api/prediction does not modify rankingSnapshot;
- provider selection remains Stage 4B-compliant.
