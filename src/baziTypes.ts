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

export type RecordedBirthCertainty = "exact" | "approximate" | "range" | "unknown_time" | "unknown_date";
export type RecordedBirthBoundaryFlag = "near_zi_hour" | "near_hour_boundary" | "near_jieqi" | "near_date_boundary";

export interface RecordedBirthTime {
  date: string;
  time?: string;
  timezone?: string;
  location?: {
    country?: string;
    region?: string;
    city?: string;
    latitude?: number;
    longitude?: number;
  };
  certainty: RecordedBirthCertainty;
  boundary_flags?: RecordedBirthBoundaryFlag[];
  assumptions?: string[];
}

export interface DefaultChart {
  chart_id: "default_chart";
  source: "recorded_birth_time";
  recorded_birth_time: RecordedBirthTime;
  fixed_pillars?: FixedPillars;
  derived_profile?: BaziDerivedProfile;
  protection_policy: {
    protected_as_default: true;
    can_be_overridden_only_by_strong_evidence: true;
  };
}

export interface CandidateChartV2 {
  candidate_id: string;
  source: "recorded_time_window" | "full_day_search" | "date_expansion" | "recorded_time" | "adjacent_hour";
  candidate_birth_time?: RecordedBirthTime;
  fixed_pillars?: FixedPillars;
  derived_profile?: BaziDerivedProfile;
  is_default_chart?: boolean;
  assumptions?: string[];
  boundary_flags?: string[];
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
