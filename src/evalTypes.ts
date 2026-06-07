import type { BaziDerivedProfile } from "./baziTypes.ts";
import type { ForecastInitialValue, ForecastSelectedChart } from "./forecastInputTypes.ts";

export type EvalDomain =
  | "education"
  | "career"
  | "wealth"
  | "relationship"
  | "health"
  | "migration"
  | "family"
  | "personality"
  | "general";

export type EvaluationModeId =
  | "A_derivative_only"
  | "B_initial_value_only"
  | "C_default_chart_plus_initial_value"
  | "D_selected_chart_plus_initial_value_full_system";

export type LeakageViolationType = "direct" | "semantic" | "temporal" | "metadata";

export interface HiddenTarget {
  target_id: string;
  domain: EvalDomain;
  label: string;
  occurred: boolean;
  year?: number;
  confidence?: number;
  acceptable_answers: string[];
  unacceptable_leakage_terms: string[];
}

export interface EvalCase {
  case_id: string;
  schema_version: "stage7.v1";
  anonymized: boolean;
  cutoff_date: string;
  forecast_horizon: string;
  target_domains: EvalDomain[];
  hidden_targets: HiddenTarget[];
  allowed_inputs: Record<string, unknown>;
  redaction_policy: {
    redacted_fields: string[];
    redacted_terms: string[];
    post_cutoff_events_removed: boolean;
  };
  metadata?: {
    source?: string;
    quality?: "low" | "medium" | "high";
    notes?: string[];
  };
}

export interface HoldoutSnapshot {
  case_id: string;
  cutoff_date: string;
  forecast_horizon: string;
  target_domains: EvalDomain[];
  allowed_inputs: Record<string, unknown>;
  redaction_metadata: {
    removed_post_cutoff_events: number;
    redacted_terms: string[];
    redacted_fields: string[];
    hidden_targets_removed: boolean;
  };
  valid: boolean;
  warnings: string[];
}

export interface LeakageViolation {
  type: LeakageViolationType;
  field_path: string;
  term: string;
  message: string;
  penalty: number;
}

export interface LeakageGuardResult<T = unknown> {
  passed: boolean;
  violations: LeakageViolation[];
  redacted_input: T;
  total_penalty: number;
}

export interface ModeInput {
  mode: EvaluationModeId;
  case_id: string;
  forecast_horizon: string;
  target_domains: EvalDomain[];
  user_question?: string;
  derivative_profile?: BaziDerivedProfile | Record<string, unknown>;
  default_derivative_profile?: BaziDerivedProfile | Record<string, unknown>;
  selected_derivative_profile?: BaziDerivedProfile | Record<string, unknown>;
  initial_value?: ForecastInitialValue | Record<string, unknown>;
  default_chart?: ForecastSelectedChart | Record<string, unknown>;
  selected_chart?: ForecastSelectedChart | Record<string, unknown>;
  known_life_events?: unknown[];
  metadata: {
    uses_derivative_function: boolean;
    uses_initial_value: boolean;
    uses_default_chart: boolean;
    uses_selected_chart: boolean;
    hidden_target_included: false;
  };
}

export interface ModeOutput {
  mode: EvaluationModeId;
  case_id: string;
  domain_forecasts: Array<{
    domain: EvalDomain;
    prediction: string;
    confidence: number;
    year?: number;
    occurred?: boolean;
  }>;
  known_facts_used?: string[];
  derivative_signals_used?: string[];
  initial_value_adjustments?: string[];
  policy: {
    provider: "deterministic_mock" | "mock" | "disabled_llm";
    ai_used_for_ranking: false;
    ai_used_for_rectification: false;
    real_network_used: false;
  };
}

export interface ForecastEvalScore {
  mode: EvaluationModeId;
  total_score: number;
  domain_accuracy: number;
  time_window_overlap: number;
  directional_correctness: number;
  specificity: number;
  calibration: number;
  evidence_separation: number;
  actionability: number;
  leakage_penalty: number;
  notes: string[];
}

export interface EvalCaseResult {
  case_id: string;
  scores: ForecastEvalScore[];
  pairwise_results: PairwiseResult[];
  mode_input_leakage_results: Record<EvaluationModeId, LeakageGuardResult>;
  leakage_results: Record<EvaluationModeId, LeakageGuardResult>;
  valid: boolean;
  warnings: string[];
}

export interface PairwiseResult {
  pair: [EvaluationModeId, EvaluationModeId];
  winner: EvaluationModeId | "tie";
  score_delta: number;
  reason: string;
}

export interface BenchmarkResult {
  benchmark_id: string;
  schema_version: "stage7.v1";
  case_count: number;
  mode_scores: Record<EvaluationModeId, { average_total_score: number; case_count: number }>;
  pairwise_win_rates: Record<string, number>;
  leakage_summary: {
    violations: number;
    invalid_cases: number;
  };
  conclusion: "insufficient_data" | "full_system_supported" | "full_system_not_supported" | "mixed";
  case_results: EvalCaseResult[];
  warnings: string[];
}

export interface BenchmarkRunnerInput {
  cases: EvalCase[];
  mode_outputs?: Record<string, Partial<Record<EvaluationModeId, ModeOutput>>>;
  mode_runner?: (input: ModeInput, evalCase: EvalCase) => ModeOutput;
}

export interface EvaluationModesConfig {
  schema_version: "stage7.v1";
  modes: Array<{
    mode: EvaluationModeId;
    label: string;
    uses_derivative_function: boolean;
    uses_initial_value: boolean;
    uses_default_chart: boolean;
    uses_selected_chart: boolean;
    description: string;
  }>;
  full_system_mode: EvaluationModeId;
}

export interface EvaluationMetricsConfig {
  schema_version: "stage7.v1";
  metrics: Record<string, { weight: number; range: [number, number] }>;
  minimum_cases_for_claim: number;
  minimum_high_quality_cases_for_claim: number;
  default_conclusion_if_underpowered: "insufficient_data";
}

export interface LeakageGuardPolicyConfig {
  schema_version: "stage7.v1";
  scan_fields: string[];
  violation_types: LeakageViolationType[];
  direct_match_case_insensitive: boolean;
  year_after_cutoff_is_temporal_leakage: boolean;
  penalty: Record<LeakageViolationType, number>;
  allowed_occurrences: string[];
}
