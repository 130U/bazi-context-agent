import type { ContextFact } from "./types.ts";
import type { PredictionResult, RankingSnapshot } from "./predictionTypes.ts";

export type ReportExportFormat = "json" | "markdown";

export interface RankingSnapshotSummary {
  top_candidate_id: string | null;
  top_candidate_ids: string[];
  top_candidate_scores: Array<{ candidate_id: string; totalScore: number; confidence: number }>;
  evidence_count: number;
  contradiction_count: number;
  missing_information_count: number;
  ai_used_for_ranking: false;
}

export interface SelectedCandidateSummary {
  candidate_id: string | null;
  hour_name?: string;
  branch?: string;
  score?: number;
  confidence?: number;
}

export interface ContextBoxSummary {
  fact_count: number;
  facts: Array<{ id: string; value: string | string[]; source: string; confidence: number }>;
}

export interface ReportPolicy {
  ai_used_for_ranking: false;
  ranking_modified_by_ai: false;
  context_box_used_for_ranking: false;
  context_box_used_for_prediction: true;
  provider: PredictionResult["policy"]["provider"];
  output_schema_validated?: boolean;
  api_key_exported: false;
  raw_provider_payload_exported: false;
}

export interface ExportMetadata {
  format: ReportExportFormat;
  created_at: string;
  redacted: true;
  schema_version: string;
}

export interface PredictionReport {
  report_id: string;
  generated_at: string;
  version: string;
  ranking_snapshot_summary: RankingSnapshotSummary;
  selected_candidate_summary: SelectedCandidateSummary;
  context_box_summary: ContextBoxSummary;
  prediction_result: PredictionResult;
  policy: ReportPolicy;
  privacy_notice: string[];
  export_metadata: ExportMetadata;
}

export interface BuildPredictionReportInput {
  rankingSnapshot: RankingSnapshot;
  contextBox: ContextFact[];
  predictionResult: PredictionResult;
  exportFormat?: ReportExportFormat;
  generatedAt?: string;
  reportId?: string;
}
