import { assertNoExportSecrets } from "./reportRedaction.ts";
import type { PredictionReport } from "./reportTypes.ts";

function bullet(items: string[]): string {
  return items.length === 0 ? "- None" : items.map((item) => `- ${item}`).join("\n");
}

export function reportToMarkdown(report: PredictionReport): string {
  const prediction = report.prediction_result;
  const markdown = [
    "# BaZi Context Prediction Report",
    "",
    `Generated at: ${report.generated_at}`,
    "",
    "## Ranking Summary",
    `Top candidates: ${report.ranking_snapshot_summary.top_candidate_ids.join(", ") || "None"}`,
    `AI used for ranking: ${report.ranking_snapshot_summary.ai_used_for_ranking}`,
    "",
    "## Context Box Summary",
    `Context facts: ${report.context_box_summary.fact_count}`,
    bullet(report.context_box_summary.facts.map((fact) => `${fact.id}: ${Array.isArray(fact.value) ? fact.value.join(", ") : fact.value}`)),
    "",
    "## Prediction Conclusion",
    prediction.conclusion,
    "",
    "## Known Facts",
    bullet(prediction.known_facts.map((fact) => fact.fact)),
    "",
    "## Chart Signals",
    bullet(prediction.chart_signals.map((signal) => signal.signal)),
    "",
    "## Context Adjustments",
    bullet(prediction.context_adjustments.map((item) => item.adjustment)),
    "",
    "## Prediction",
    prediction.prediction.answer,
    "",
    "## Confidence",
    String(prediction.confidence),
    "",
    "## Uncertainty",
    bullet(prediction.uncertainty),
    "",
    "## Next Questions",
    bullet(prediction.next_questions),
    "",
    "## Provider Status",
    `Provider: ${report.policy.provider}`,
    `Output schema validated: ${report.policy.output_schema_validated === true}`,
    `AI used for ranking: ${report.policy.ai_used_for_ranking}`,
    `Ranking modified by AI: ${report.policy.ranking_modified_by_ai}`,
    "",
    "## Privacy Notice",
    bullet(report.privacy_notice)
  ].join("\n");
  assertNoExportSecrets(markdown);
  return markdown;
}
