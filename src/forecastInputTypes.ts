import type { BaziDerivedProfile, FixedPillars } from "./baziTypes.ts";
import type { RectificationResultV2 } from "./rectificationTypes.ts";

export type ForecastHorizon = "3_months" | "6_months" | "1_year" | "3_years" | "5_years" | "10_years";

export type ForecastDomain =
  | "education"
  | "career"
  | "wealth"
  | "relationship"
  | "health"
  | "migration"
  | "family"
  | "personality"
  | "general";

export interface ForecastSelectedChart {
  chart_id: string;
  chart_role: "default" | "candidate";
  fixed_pillars: FixedPillars;
  confidence: number;
  selection_source?: "default_chart" | "rectification_v2";
}

export interface ForecastContextFact {
  fact_id: string;
  category: string;
  field: string;
  value: unknown;
  source: string;
  confidence: number;
  fact_type: "direct_fact" | "inferred_fact" | "known_user_fact" | "unknown";
}

export interface ForecastKnownLifeEvent {
  event_id: string;
  year: number;
  event_type: string;
  description?: string;
  confidence?: number;
}

export interface ForecastInitialValue {
  context_facts: ForecastContextFact[];
  known_life_events: ForecastKnownLifeEvent[];
  current_state_summary?: string;
  resource_baseline: Record<string, unknown>;
  preference_profile: Record<string, unknown>;
  warnings: string[];
}

export interface ForecastDataProvenance {
  field_path: string;
  source:
    | "selected_chart"
    | "rectification_result"
    | "bazi_derived_profile"
    | "context_box"
    | "known_life_events"
    | "request"
    | "system_current_date";
  source_id?: string;
  confidence?: number;
  fact_type: "derived_chart_signal" | "initial_value" | "system_metadata" | "user_question" | "rectification_metadata";
}

export interface ForecastInputBoundaries {
  ai_used_to_build_forecast_input: false;
  ai_allowed_in_stage6_forecast: true;
  ranking_modified: false;
  rectification_modified: false;
  context_box_used_for_rectification: false;
  secrets_included: false;
}

export interface ForecastInput {
  forecast_input_id: string;
  schema_version: "stage5e.v1";
  current_date: string;
  timezone?: string;
  forecast_request: {
    user_question: string;
    forecast_horizon: ForecastHorizon;
    forecast_domains: ForecastDomain[];
  };
  selected_chart: ForecastSelectedChart & {
    selection_source: "default_chart" | "rectification_v2";
  };
  derivative_function: BaziDerivedProfile;
  initial_value: ForecastInitialValue;
  rectification_summary: {
    recommendation: string;
    confidence: number;
    selected_chart_id: string;
    default_chart_protected: boolean;
    context_box_used_for_rectification: false;
    ai_used_for_rectification: false;
  };
  data_provenance: ForecastDataProvenance[];
  boundaries: ForecastInputBoundaries;
  warnings: string[];
}

export interface ForecastInputBuildRequest {
  current_date?: string;
  timezone?: string;
  user_question?: string;
  forecast_horizon?: ForecastHorizon | string;
  forecast_domains?: Array<ForecastDomain | string>;
  selected_chart?: ForecastSelectedChart;
  rectification_result?: RectificationResultV2 | Record<string, unknown>;
  derivative_profile?: BaziDerivedProfile;
  context_box?: unknown[];
  known_life_events?: unknown[];
  current_state?: unknown;
  preferences?: unknown;
  options?: {
    include_raw_profile?: boolean;
    include_alternatives?: boolean;
    include_private_context?: boolean;
  };
}

export interface ForecastInputValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export interface ForecastHorizonsConfig {
  schema_version: "stage5e.v1";
  default_horizon: ForecastHorizon;
  allowed_horizons: Array<{
    id: ForecastHorizon;
    label: string;
    approx_days: number;
  }>;
}

export interface ForecastDomainMappingConfig {
  schema_version: "stage5e.v1";
  default_domains: ForecastDomain[];
  allowed_domains: ForecastDomain[];
  keyword_mapping: Record<string, string[]>;
}

export interface ForecastInputPolicyConfig {
  schema_version: "stage5e.v1";
  stage: "5E";
  ai_allowed_to_build_forecast_input: false;
  ai_allowed_in_stage6_forecast: true;
  context_box_allowed_in_initial_value: true;
  context_box_allowed_in_rectification: false;
  ranking_modification_allowed: false;
  rectification_modification_allowed: false;
  secret_redaction_required: true;
  production_date_policy: string;
}
