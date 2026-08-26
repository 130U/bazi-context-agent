import type { DefaultChartProtectionConfig, EventTypeScoringConfig, RectificationWeightsConfig } from "./rectificationTypes.ts";

export const HOUR_GROUPS = [
  "G1_zi_wu_mao_you",
  "G2_yin_shen_si_hai",
  "G3_chen_xu_chou_wei"
] as const;

export type HourGroupId = (typeof HOUR_GROUPS)[number];
export const EARTHLY_BRANCHES = [
  "Zi",
  "Chou",
  "Yin",
  "Mao",
  "Chen",
  "Si",
  "Wu",
  "Wei",
  "Shen",
  "You",
  "Xu",
  "Hai"
] as const;

export type EarthlyBranch = (typeof EARTHLY_BRANCHES)[number];

export type ChartSex = "male" | "female" | "prefer_not_to_say";
export type QuestionLayer = "birth_input" | "symbol_prior" | "event_backtest" | "context_box";
export type QuestionInputType =
  | "single_choice"
  | "multi_choice"
  | "short_text"
  | "date"
  | "time_or_range"
  | "year_event"
  | "year_event_list";

export type BoundaryFlag =
  | "near_midnight"
  | "near_zi_hour"
  | "near_solar_term"
  | "near_hour_boundary"
  | "date_may_shift"
  | "unknown";

export type CandidateSource =
  | "recorded"
  | "adjacent"
  | "boundary_expanded"
  | "symbol_prior_added";

export interface BirthInput {
  birthDate: string;
  birthplace: string;
  recordedTime?: string;
  uncertaintyRange: "recorded_only" | "adjacent_1_shichen" | "adjacent_2_shichen" | "full_day" | "auto";
  boundaryFlags: BoundaryFlag[];
  chartSex: ChartSex;
}

export interface SymbolAnswer {
  questionId: string;
  answerId: string;
}

export interface LifeEvent {
  year: number;
  type:
    | "major_turning"
    | "education"
    | "migration"
    | "relocation"
    | "relationship"
    | "health_accident"
    | "health_or_accident"
    | "family_change"
    | "career"
    | "career_transition"
    | "childbearing"
    | "best_year"
    | "best"
    | "worst_year"
    | "worst";
  description?: string;
  confidence?: number;
}

export interface ContextFact {
  id: string;
  value: string | string[];
  source: "user_answer" | "derived";
  confidence: number;
  factType: "known_user_fact" | "inferred_context";
}

export interface EvidenceItem {
  code: string;
  message: string;
  value?: number | string;
}

export interface HourGroupPrior {
  group: HourGroupId;
  label: string;
  prior: number;
  evidence: EvidenceItem[];
}

export type HourGroupPriorMap = Record<HourGroupId, number>;

export interface HourGroupPriorResult {
  prior: HourGroupPriorMap;
  raw_scores: HourGroupPriorMap;
  entries: HourGroupPrior[];
  evidence: EvidenceItem[];
  missing_information: string[];
  warning: string;
}

export interface SymbolPriorInput {
  answers: SymbolAnswer[] | Record<string, unknown>;
  chartSex: ChartSex;
  scoringConfig: ScoringConfig;
}

export interface HourDefinition {
  branch: EarthlyBranch;
  hourNameCn: string;
  hourNameEn: string;
  startHour: number;
  endHour: number;
  group: HourGroupId;
}

export interface CandidateChart {
  candidate_id: string;
  branch: EarthlyBranch;
  hour_name_cn: string;
  hour_group: HourGroupId;
  source_reasons: string[];
  symbol_prior_fit: number;
  birth_record_plausibility: number;
  boundary_flags: Record<string, boolean>;
  missing_information: string[];
  early_zi?: boolean;
  late_zi?: boolean;
  possible_date_offset?: boolean;
}

export type BranchRelation = "same_branch" | "clash" | "six_harmony" | "harm" | "triad_same_group";

export interface PerEventScore {
  event: LifeEvent;
  year_branch: EarthlyBranch;
  relations: BranchRelation[];
  score: number;
  rationale: string;
}

export interface EventBacktestResult {
  candidate_id: string;
  event_timing_fit: number;
  per_event_scores: PerEventScore[];
  matched_rules: string[];
  contradictions: string[];
  missing_information: string[];
  warning: string;
}

export interface CandidateScore {
  candidate: CandidateChart;
  totalScore: number;
  components: {
    symbol_prior_fit: number;
    event_timing_fit: number;
    early_life_and_family_fit: number;
    birth_record_plausibility: number;
    domain_trajectory_fit: number;
  };
  confidence: number;
  evidence: EvidenceItem[];
  evidence_table: EvidenceRow[];
  contradictions: string[];
  missing_information: string[];
}

export interface EvidenceRow {
  candidate_id: string;
  category:
    | "symbol"
    | "birth_record"
    | "event_backtest"
    | "early_life"
    | "domain_trajectory"
    | "contradiction"
    | "missing_information";
  label: string;
  value: string | number;
  weight?: number;
  impact?: "positive" | "negative" | "neutral";
}

export interface CandidateRankingInput {
  candidates: CandidateChart[];
  symbol_prior_result: HourGroupPriorResult;
  event_backtest_results: EventBacktestResult[];
  contextFacts?: ContextFact[];
  scoringConfig: ScoringConfig;
}

export interface CandidateRankingResult {
  top_candidate_id: string | null;
  candidates: CandidateScore[];
  top_3: CandidateScore[];
  should_not_force_single_hour: boolean;
  evidence_table: EvidenceRow[];
  contradictions: string[];
  missing_information: string[];
  warning: string;
  weights_used: CandidateScore["components"];
}

export interface QuestionBank {
  version: string;
  adaptive_policy?: AdaptiveQuestionPolicy;
  context_policy?: ContextQuestionPolicy;
  stages: QuestionStage[];
}

export interface AdaptiveQuestionPolicy {
  stage_id: string;
  eligible_stages: Array<Extract<QuestionLayer, "symbol_prior" | "event_backtest">>;
  minimum_questions: number;
  maximum_questions: number;
  question_order: string[];
  stable_when: string;
  allow_provisional_lock_at_max: boolean;
}

export interface ContextQuestionPolicy {
  stage_id: "context_box";
  starts_after_lock: boolean;
  may_change_rectification_scores: false;
  question_order: string[];
}

export interface QuestionStage {
    id: QuestionLayer;
    title: string;
    questions: Question[];
}

export interface Question {
  id: string;
  title: string;
  inputType: QuestionInputType;
  required?: boolean;
  options?: Array<string | { id: string; label?: string }>;
  eventTypeOptions?: Array<{ id: LifeEvent["type"]; label: string }>;
  maxLength?: number;
  maxItems?: number;
  maxSelections?: number;
  eventType?: LifeEvent["type"];
  conditional?: string;
  specialScoring?: string;
}

export type AnswerMap = Record<string, unknown>;

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  normalized?: unknown;
  skipped?: boolean;
}

export interface QuestionnaireSession {
  bank: QuestionBank;
  answers: AnswerMap;
  layerOrder?: QuestionLayer[];
}

export interface ScoringConfig {
  candidate_score_weights: CandidateScore["components"];
  contradiction_penalty_enabled: boolean;
  ai_allowed_before_candidate_ranking: boolean;
  symbol_prior_question_scores: Record<string, Record<string, Partial<Record<HourGroupId, number>>>>;
  fetal_order_rules: Record<"male" | "female", Partial<Record<HourGroupId, number[]>>>;
  birth_record_plausibility: Record<CandidateSource, number>;
  legacy_event_backtest: {
    neutral_score: number;
    childbearing_score: number;
    fallback_relation_score: number;
    default_event_confidence: number;
    contradiction_threshold: number;
    score_precision_digits: number;
    event_type_profiles: Record<string, string>;
    relation_scores: Record<string, Record<BranchRelation | "none", number>>;
  };
  symbol_prior_policy: {
    fetal_order_match_score: number;
    normalization_precision_digits: number;
  };
  legacy_ranking: {
    neutral_component_score: number;
    uniform_group_prior: number;
    contradiction_penalty_per_item: number;
    maximum_contradiction_penalty: number;
    single_hour_score_margin: number;
    single_hour_confidence_margin: number;
    score_precision_digits: number;
    confidence_precision_digits: number;
  };
  rectification_v2: {
    weights: RectificationWeightsConfig;
    event_scoring: EventTypeScoringConfig;
    default_chart_protection: DefaultChartProtectionConfig;
  };
  chart_generation: {
    recorded_time_prior_scores: Record<string, number>;
    expanded_candidate_prior_penalty: number;
    minimum_candidate_prior: number;
  };
  legacy_candidate_generation: {
    maximum_candidates: number;
    minimum_candidates: number;
    adjacent_1_shichen_radius: number;
    adjacent_2_shichen_radius: number;
  };
  browser_rectification?: BrowserRectificationScoringConfig;
}

export interface BrowserRectificationScoringConfig {
  candidate_component_weights: {
    birth_record: number;
    symbol_prior: number;
    event_backtest: number;
  };
  birth_record_scores: Record<"recorded" | "adjacent" | "uncertain_range" | "boundary_expanded" | "unknown_symmetric", number>;
  neutral_component_scores: {
    symbol_prior: number;
    event_backtest: number;
  };
  event_relation_scores: Record<string, Record<string, number>>;
  event_type_relation_profiles: Record<string, string>;
  event_importance_multipliers: Record<string, number>;
  symbol_signal: {
    baseline: number;
    unit_scale: number;
    no_match: number;
    fetal_order_match: number;
    minimum: number;
    maximum: number;
  };
  stability: {
    minimum_score_margin: number;
    minimum_event_answers: number;
    minimum_informative_answers: number;
  };
  selection: {
    unknown_candidate_count: number;
    adjacent_branch_radius: number;
    locked_alternative_count: number;
    score_precision_digits: number;
  };
  forecast: {
    default_horizon_months: number;
    minimum_horizon_months: number;
    maximum_horizon_months: number;
  };
  policy: {
    ai_used_for_ranking: false;
    ai_used_for_forecast: false;
    context_may_change_rectification_scores: false;
  };
}
