import type { BaziDerivedProfile, CandidateChartV2, DefaultChart } from "./baziTypes.ts";

export type RectificationRecommendation =
  | "use_default_chart"
  | "default_protected_uncertain"
  | "candidate_preferred"
  | "insufficient_evidence";

export type RectificationEvidenceType =
  | "recorded_time_prior"
  | "event_timing_fit"
  | "symbol_prior"
  | "chart_profile_fit"
  | "contradiction"
  | "missing_information"
  | "default_protection";

export type RectificationEvidenceSource = "birth_record" | "life_event" | "symbol_answer" | "derived_profile" | "policy";

export type RectificationEventImportance = "low" | "medium" | "high";

export interface RectificationLifeEvent {
  event_id?: string;
  year: number;
  month?: number;
  event_type?: string;
  type?: string;
  description?: string;
  importance?: RectificationEventImportance;
}

export interface RectificationWeightsConfig {
  version: string;
  candidate_rectification_score_weights: {
    recorded_time_prior: number;
    event_timing_fit: number;
    symbol_prior_fit: number;
    chart_profile_fit: number;
  };
  contradiction_penalty_enabled: boolean;
  clamp_scores_to: [number, number];
  context_box_allowed_for_rectification: false;
  ai_allowed_for_rectification: false;
  profile_scoring: {
    missing_profile: number;
    base: number;
    annual_fortunes: number;
    luck_cycles: number;
    relations: number;
    ten_gods: number;
    no_warnings: number;
  };
  fallback_scores: {
    default_recorded_time_prior: number;
    candidate_recorded_time_prior: number;
    symbol_prior: number;
    maximum_contradiction_penalty: number;
    profile_confidence: number;
    missing_profile_confidence: number;
    missing_evidence_confidence: number;
  };
  result_policy: {
    confidence_component_count: number;
    penalty_confidence_divisor: number;
    contradiction_evidence_weight: number;
    alternative_count: number;
    score_precision_digits: number;
  };
}

export interface EventTypeScoringConfig {
  version: string;
  event_score_components: Record<string, { max: number }>;
  parameters: Record<string, number>;
  event_types: Record<string, { domains: string[]; importance_default: RectificationEventImportance }>;
}

export interface DefaultChartProtectionConfig {
  version: string;
  minimum_major_events_to_override_default: number;
  lead_thresholds: {
    keep_default_if_lead_lte: number;
    uncertain_if_lead_lte: number;
    candidate_preferred_if_lead_gt: number;
  };
  minimum_high_importance_event_matches_for_override: number;
  recommendations: Record<RectificationRecommendation, string>;
}

export interface RectificationPolicyConfig {
  version: string;
  stage: "5D";
  purpose: string;
  allowed_inputs: string[];
  forbidden_inputs_for_scoring: string[];
  metadata_required: {
    ai_used: false;
    context_box_used_for_rectification: false;
    ranking_modified_by_ai: false;
  };
  non_goals: string[];
}

export interface RectificationEvidence {
  evidence_id: string;
  candidate_id: string;
  evidence_type: RectificationEvidenceType;
  event_id?: string;
  label: string;
  description: string;
  score_delta?: number;
  weight?: number;
  confidence: number;
  source: RectificationEvidenceSource;
}

export interface RectificationContradiction {
  candidate_id: string;
  event_id?: string;
  severity: "low" | "medium" | "high";
  description: string;
  penalty: number;
}

export interface EventTimingFitEventScore {
  event_id: string;
  year: number;
  event_type: string;
  fit_score: number;
  matched_rules: string[];
  missing_signals: string[];
  contradictions: string[];
  importance: RectificationEventImportance;
}

export interface EventTimingFitResult {
  candidate_id: string;
  event_scores: EventTimingFitEventScore[];
  event_timing_fit: number;
  matched_rules: string[];
  contradictions: RectificationContradiction[];
  missing_information: string[];
  warnings: string[];
  high_importance_matches: number;
  confidence: number;
}

export interface DefaultChartProtectionResult {
  default_chart_id: string;
  top_alternative_id?: string;
  default_score: number;
  top_alternative_score?: number;
  lead_over_default?: number;
  event_count: number;
  minimum_events_required: number;
  override_allowed: boolean;
  recommendation: RectificationRecommendation;
  reasons: string[];
}

export interface RectificationEvidenceTableRow {
  candidate_id: string;
  component: string;
  score: number;
  weight: number;
  weighted_score: number;
  evidence_summary: string[];
  contradictions: string[];
}

export interface CandidateRectificationScore {
  candidate_id: string;
  chart_role: "default" | "candidate";
  total_score: number;
  confidence: number;
  components: {
    recorded_time_prior: number;
    event_timing_fit: number;
    symbol_prior_fit: number;
    chart_profile_fit: number;
    contradiction_penalty: number;
  };
  weighted_components: {
    recorded_time_prior: number;
    event_timing_fit: number;
    symbol_prior_fit: number;
    chart_profile_fit: number;
  };
  evidence: RectificationEvidence[];
  contradictions: RectificationContradiction[];
  missing_information: string[];
  warnings: string[];
  high_importance_event_matches: number;
}

export interface RectificationV2Request {
  default_chart: DefaultChart;
  candidates: CandidateChartV2[];
  life_events: RectificationLifeEvent[];
  symbol_prior?: unknown;
  bazi_derived_profiles?: BaziDerivedProfile[];
  options?: {
    include_evidence_table?: boolean;
    include_alternatives?: boolean;
  };
  context_box?: unknown;
}

export interface RectificationResultV2 {
  selected_chart_id: string;
  selected_chart_role: "default" | "candidate";
  recommendation: RectificationRecommendation;
  scores: CandidateRectificationScore[];
  top_alternatives: CandidateRectificationScore[];
  evidence_table: RectificationEvidenceTableRow[];
  default_chart_protection: DefaultChartProtectionResult;
  warnings: string[];
  missing_information: string[];
  metadata: {
    stage: "5D";
    ai_used: false;
    context_box_used_for_rectification: false;
    ranking_modified_by_ai: false;
    weights_source: string;
  };
}
