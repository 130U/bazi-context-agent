import { redactForExport, assertNoExportSecrets } from "./reportRedaction.ts";
import type { PredictionReport, BuildPredictionReportInput } from "./reportTypes.ts";

const REPORT_VERSION = "stage4c-v1";

export const STAGE4C_PRIVACY_NOTICE = [
  "This report may include personal information you entered. Review before sharing or exporting.",
  "Candidate ranking is deterministic. AI/provider output does not alter candidate IDs, scores, or confidence.",
  "Context box information is used for prediction personalization only. It is not used for ranking.",
  "API keys are never displayed or exported.",
  "This report is not medical, legal, or financial certainty advice."
];

function stableReportId(generatedAt: string, topCandidateId: string | null): string {
  return `report_${generatedAt.replace(/[^0-9]/g, "").slice(0, 14)}_${topCandidateId ?? "unknown"}`;
}

export function buildPredictionReport(input: BuildPredictionReportInput): PredictionReport {
  const generatedAt = input.generatedAt ?? new Date().toISOString();
  const top = input.rankingSnapshot.top_3[0];
  const report: PredictionReport = {
    report_id: input.reportId ?? stableReportId(generatedAt, input.rankingSnapshot.top_candidate_id),
    generated_at: generatedAt,
    version: REPORT_VERSION,
    ranking_snapshot_summary: {
      top_candidate_id: input.rankingSnapshot.top_candidate_id,
      top_candidate_ids: input.rankingSnapshot.top_3.map((item) => item.candidate.candidate_id),
      top_candidate_scores: input.rankingSnapshot.top_3.map((item) => ({
        candidate_id: item.candidate.candidate_id,
        totalScore: item.totalScore,
        confidence: item.confidence
      })),
      evidence_count: input.rankingSnapshot.evidence_table.length,
      contradiction_count: input.rankingSnapshot.contradictions.length,
      missing_information_count: input.rankingSnapshot.missing_information.length,
      ai_used_for_ranking: false
    },
    selected_candidate_summary: {
      candidate_id: top?.candidate.candidate_id ?? input.rankingSnapshot.top_candidate_id,
      hour_name: top?.candidate.hour_name_cn,
      branch: top?.candidate.branch,
      score: top?.totalScore,
      confidence: top?.confidence
    },
    context_box_summary: {
      fact_count: input.contextBox.length,
      facts: input.contextBox.map((fact) => ({
        id: fact.id,
        value: fact.value,
        source: fact.source,
        confidence: fact.confidence
      }))
    },
    prediction_result: input.predictionResult,
    policy: {
      ai_used_for_ranking: false,
      ranking_modified_by_ai: false,
      context_box_used_for_ranking: false,
      context_box_used_for_prediction: true,
      provider: input.predictionResult.policy.provider,
      output_schema_validated: input.predictionResult.policy.output_schema_validated,
      api_key_exported: false,
      raw_provider_payload_exported: false
    },
    privacy_notice: STAGE4C_PRIVACY_NOTICE,
    export_metadata: {
      format: input.exportFormat ?? "json",
      created_at: generatedAt,
      redacted: true,
      schema_version: REPORT_VERSION
    }
  };
  const redacted = redactForExport(report);
  assertNoExportSecrets(redacted);
  return redacted;
}
