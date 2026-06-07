export type HeavenlyStem = string;
export type EarthlyBranchName = string;

export interface Pillar {
  stem: HeavenlyStem;
  branch: EarthlyBranchName;
}

export interface FixedPillars {
  year: Pillar;
  month: Pillar;
  day: Pillar;
  hour: Pillar;
}

export type BirthTimeCertainty =
  | "exact_to_minute"
  | "within_1_hour"
  | "approximate_hour"
  | "time_range"
  | "part_of_day"
  | "unknown_time"
  | "unknown_date";

export type RecordedBirthCertainty = BirthTimeCertainty | "exact" | "approximate" | "range";

export type BoundaryFlag =
  | "near_zi_hour"
  | "near_zi_boundary"
  | "near_hour_boundary"
  | "near_solar_term"
  | "near_jieqi"
  | "near_date_boundary"
  | "possible_timezone_issue"
  | "possible_dst_issue"
  | "manual_expand"
  | "date_uncertain"
  | "timezone_uncertain"
  | "true_solar_time_requested";

export type RecordedBirthBoundaryFlag = BoundaryFlag;

export interface RecordedBirthTime {
  calendar_type?: "solar" | "lunar" | "unknown";
  birth_date?: string;
  birth_time?: string;
  date?: string;
  time?: string;
  timezone?: string;
  location?: {
    country?: string;
    region?: string;
    city?: string;
    latitude?: number;
    longitude?: number;
  };
  sex_for_traditional_chart?: "male" | "female" | "unspecified";
  certainty: RecordedBirthCertainty;
  boundary_flags?: BoundaryFlag[];
  time_range?: {
    start: string;
    end: string;
  };
  part_of_day?: "morning" | "afternoon" | "evening" | "night" | "unknown";
  fixed_pillars?: FixedPillars;
  assumptions?: string[];
}

export interface DefaultChart {
  chart_id: string;
  chart_role: "default";
  source: "recorded_birth_time";
  recorded_time_prior_score: number;
  birth_input: RecordedBirthTime;
  recorded_birth_time: RecordedBirthTime;
  fixed_pillars?: FixedPillars;
  derived_profile?: BaziDerivedProfile;
  boundary_flags: BoundaryFlag[];
  assumptions: string[];
  warnings: string[];
  protection_policy: {
    protected_as_default: true;
    can_be_overridden_only_by_strong_evidence: true;
  };
}

export interface CandidateChartV2 {
  candidate_id: string;
  chart_role: "candidate";
  source:
    | "recorded_time_window"
    | "full_day_search"
    | "date_expansion"
    | "recorded_time"
    | "adjacent_hour"
    | "uncertain_range"
    | "part_of_day"
    | "full_day"
    | "date_boundary"
    | "solar_term_boundary"
    | "manual_fixed_pillars";
  birth_input?: RecordedBirthTime;
  candidate_birth_time?: RecordedBirthTime;
  candidate_date?: string;
  hour_branch?: EarthlyBranchName;
  hour_branch_key?: string;
  fixed_pillars?: FixedPillars;
  derived_profile?: BaziDerivedProfile;
  is_default_chart?: boolean;
  recorded_time_prior_score: number;
  symbol_prior_score?: number;
  generation_reasons: string[];
  assumptions?: string[];
  boundary_flags: BoundaryFlag[];
  warnings: string[];
}

export interface ChartGenerationPolicy {
  version: string;
  default_candidate_limit: number;
  full_day_candidate_limit: number;
  unknown_date_day_span: number;
  recorded_time_prior_scores: Record<BirthTimeCertainty, number>;
  part_of_day_windows: Record<string, string[]>;
  metadata: {
    ai_allowed: false;
    context_box_allowed: false;
    ranking_allowed: false;
  };
}

export interface CandidateGenerationInput {
  recorded_birth_time: RecordedBirthTime;
  default_chart?: DefaultChart;
  symbol_prior?: unknown;
  generation_policy?: ChartGenerationPolicy;
  adapter?: BaziEngineAdapter;
}

export interface ChartGenerationResult {
  default_chart: DefaultChart;
  candidates: CandidateChartV2[];
  generation_summary: {
    candidate_count: number;
    uncertainty_level: BirthTimeCertainty;
    boundary_flags: BoundaryFlag[];
    warnings: string[];
  };
  metadata: {
    ai_used: false;
    context_box_used: false;
    ranking_performed: false;
    stage: "5C";
  };
}

export type BaziCalculationMode = "recorded_time" | "candidate_time" | "fixed_pillars" | "static_fallback";

export interface BaziRelations {
  clashes: unknown[];
  combinations: unknown[];
  punishments: unknown[];
  harms: unknown[];
}

export interface BaziDerivedProfile {
  profile_id: string;
  source_chart_id: string;
  source_libraries: string[];
  calculation_mode: BaziCalculationMode;
  pillars: FixedPillars;
  day_master: string;
  five_elements: Record<string, unknown>;
  ten_gods: unknown[];
  hidden_stems: unknown[];
  nayin: unknown[];
  stars: unknown[];
  shensha: unknown[];
  relations: BaziRelations;
  luck_cycles?: unknown[];
  annual_fortunes?: unknown[];
  assumptions: string[];
  warnings: string[];
  raw?: unknown;
}

export interface BaziDerivationOptions {
  sourceChartId?: string;
  profileId?: string;
  calculationMode?: BaziCalculationMode;
}

export interface BaziEngineAdapter {
  adapter_id: string;
  source_library: string;
  supports_recorded_birth_time: boolean;
  supports_birth_datetime: boolean;
  supports_fixed_pillars: boolean;
  supports_luck_cycles: boolean;
  supports_annual_fortunes: boolean;
  deriveFromRecordedBirthTime(input: RecordedBirthTime, options?: BaziDerivationOptions): Promise<BaziDerivedProfile> | BaziDerivedProfile;
  deriveFromFixedPillars(input: FixedPillars, options?: BaziDerivationOptions): Promise<BaziDerivedProfile> | BaziDerivedProfile;
}

export interface BaziAdapterPolicy {
  default_adapter_priority: string[];
  fallback_required: boolean;
  allow_external_dependency_install: boolean;
  allowed_external_dependencies: string[];
  forbidden_dependencies: string[];
  adapter_must_not: string[];
  required_output_shape: string;
}

export type BaziAdapterErrorCode =
  | "MISSING_BIRTH_TIME"
  | "MISSING_FIXED_PILLARS"
  | "UNSUPPORTED_FIXED_PILLARS"
  | "LIBRARY_UNAVAILABLE"
  | "LIBRARY_ERROR"
  | "INVALID_DERIVED_PROFILE";

export class BaziAdapterError extends Error {
  code: BaziAdapterErrorCode;
  source_library?: string;

  constructor(code: BaziAdapterErrorCode, message: string, sourceLibrary?: string) {
    super(message);
    this.name = "BaziAdapterError";
    this.code = code;
    this.source_library = sourceLibrary;
  }
}
