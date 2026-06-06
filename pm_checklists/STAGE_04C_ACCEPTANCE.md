# Stage 4C Acceptance Checklist

## Report Builder

- [ ] Report types exist.
- [ ] Report builder exists.
- [ ] Markdown report builder exists.
- [ ] Report contains report_id.
- [ ] Report contains generated_at.
- [ ] Report contains ranking_snapshot_summary.
- [ ] Report contains selected_candidate_summary.
- [ ] Report contains context_box_summary.
- [ ] Report contains prediction_result.
- [ ] Report contains policy.
- [ ] Report contains privacy_notice.
- [ ] Report contains export_metadata.

## Export Safety

- [ ] JSON export is serializable.
- [ ] Markdown export contains required sections.
- [ ] Report output does not include API keys.
- [ ] Report output does not include raw provider request.
- [ ] Report output does not include raw provider response.
- [ ] Report output does not include raw process.env.

## API

- [ ] POST /api/report exists.
- [ ] /api/report errors when rankingSnapshot is missing.
- [ ] /api/report errors when predictionResult is missing.
- [ ] /api/report supports JSON export.
- [ ] /api/report supports Markdown export.
- [ ] /api/report does not call ranking.
- [ ] /api/report does not call prediction.
- [ ] /api/report does not modify rankingSnapshot.

## UI

- [ ] UI shows structured prediction result.
- [ ] UI shows provider status.
- [ ] UI shows report preview.
- [ ] UI has Export JSON button.
- [ ] UI has Export Markdown button.
- [ ] UI shows privacy notice.
- [ ] UI states context_box is not used for ranking.
- [ ] UI states AI/provider is not used for ranking.

## Ranking / Prediction Boundary

- [ ] /api/ranking remains deterministic.
- [ ] /api/ranking does not use context_box.
- [ ] /api/ranking does not use prediction provider.
- [ ] /api/prediction does not modify rankingSnapshot.
- [ ] /api/report does not modify rankingSnapshot.

## Security / Scope

- [ ] No real .env file.
- [ ] No real API key.
- [ ] API key is not exposed to browser/export.
- [ ] Tests do not make real OpenAI network calls.
- [ ] No React / Next / Vite / Vue / Svelte.
- [ ] No login/payment/database/user system.
- [ ] No Zi Wei / Qi Men / Feng Shui expansion.

## Tests

- [ ] npm test passes.
- [ ] Stage 4C tests cover report builder.
- [ ] Stage 4C tests cover /api/report.
- [ ] Stage 4C tests cover export redaction.
- [ ] Existing Stage 0-4B tests remain passing.
