import type { ForecastInput } from "./forecastInputTypes.ts";

export type Stage6ForecastHorizon = "3_months" | "6_months" | "1_year" | "3_years" | "10_years";

export type Stage6ForecastDomain =
  | "career"
  | "wealth"
  | "relationship"
  | "education"
  | "migration"
  | "health"
  | "family"
  | "personal_growth"
  | "general";

export type FutureForecastProviderId = "mock" | "openai" | "mock_fallback";

export interface FutureForecastRequest {
  forecast_input: ForecastInput;
  options?: {
    provider?: FutureForecastProviderId;
    language?: "zh-CN" | "en";
    include_action_plan?: boolean;
    include_timeline?: boolean;
    include_risk_windows?: boolean;
  };
}

export interface DomainForecast {
  domain: Stage6ForecastDomain;
  conclusion: string;
  forecast: string;
  confidence: number;
  derivative_basis: string[];
  initial_value_basis: string[];
  time_windows: string[];
  caveats: string[];
}

export interface ForecastTimelineWindow {
  label: string;
  start?: string;
  end?: string;
  theme: string;
  domains: Stage6ForecastDomain[];
  description: string;
}

export interface ForecastWindow {
  label: string;
  domains: Stage6ForecastDomain[];
  description: string;
  confidence: number;
}

export interface RecommendedAction {
  action: string;
  priority: "low" | "medium" | "high";
  timeframe: string;
  rationale?: string;
}

export interface ForecastUncertainty {
  factor: string;
  description: string;
  impact: "low" | "medium" | "high";
}

export interface KnownFactReference {
  fact: string;
  source: "context_box" | "known_life_events" | "forecast_input";
  source_id?: string;
  confidence?: number;
}

export interface DerivativeSignalReference {
  signal: string;
  source: "BaziDerivedProfile";
  source_id?: string;
  confidence?: number;
}

export interface InitialValueAdjustment {
  adjustment: string;
  basis: string[];
  confidence?: number;
}

export interface ForecastPolicyMetadata {
  provider: FutureForecastProviderId;
  ai_used_for_forecast: boolean;
  ai_used_for_ranking: false;
  ai_used_for_rectification: false;
  ranking_modified: false;
  rectification_modified: false;
  selected_chart_modified: false;
  output_schema_validated: boolean;
  secrets_included: false;
}

export interface FutureForecastResult {
  forecast_result_id: string;
  schema_version: "stage6.v1";
  generated_at: string;
  current_date: string;
  forecast_horizon: Stage6ForecastHorizon;
  executive_summary: string;
  domain_forecasts: DomainForecast[];
  timeline_windows: ForecastTimelineWindow[];
  opportunity_windows: ForecastWindow[];
  risk_windows: ForecastWindow[];
  recommended_actions: RecommendedAction[];
  uncertainty: ForecastUncertainty[];
  known_facts_used: KnownFactReference[];
  derivative_signals_used: DerivativeSignalReference[];
  initial_value_adjustments: InitialValueAdjustment[];
  policy: ForecastPolicyMetadata;
}

export interface FutureForecastPromptInput {
  task: string;
  current_date: string;
  forecast_horizon: Stage6ForecastHorizon;
  selected_chart_summary: Record<string, unknown>;
  derivative_signals: DerivativeSignalReference[];
  initial_value_facts: KnownFactReference[];
  initial_value_adjustments: InitialValueAdjustment[];
  user_question: string;
  output_schema: string;
  policy_constraints: string[];
}

export interface FutureForecastProvider {
  provider_id: FutureForecastProviderId;
  forecast(request: FutureForecastRequest, prompt: FutureForecastPromptInput): Promise<FutureForecastResult> | FutureForecastResult;
}

export interface FutureForecastValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export interface FutureForecastSchemaConfig {
  title: string;
  required: string[];
  properties: Record<string, unknown>;
}

export interface FutureForecastDomainPolicyConfig {
  schema_version: string;
  domains: Stage6ForecastDomain[];
  default_domains: Stage6ForecastDomain[];
  health_guard: string;
  wealth_guard: string;
  relationship_guard: string;
}

export interface FutureForecastPromptPolicyConfig {
  schema_version: string;
  required_sections: string[];
  must_separate: string[];
  forbidden_claims: string[];
  default_language: string;
  style: {
    tone: string;
    format: string;
  };
}

export interface FutureForecastSafetyPolicyConfig {
  schema_version: string;
  must_not_include: string[];
  medical: Record<string, boolean>;
  financial: Record<string, boolean>;
  legal: Record<string, boolean>;
  must_include_policy_metadata: boolean;
}

export interface FutureForecastTimeWindowPolicyConfig {
  schema_version: string;
  allowed_horizons: Stage6ForecastHorizon[];
  default_horizon: Stage6ForecastHorizon;
  precision_policy: {
    exact_dates_allowed: boolean;
    broad_windows_preferred: boolean;
    use_forecast_input_current_date: boolean;
  };
}
