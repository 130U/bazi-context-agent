export const HOUR_GROUPS = [
  "G1_zi_wu_mao_you",
  "G2_yin_shen_si_hai",
  "G3_chen_xu_chou_wei"
] as const;

export type HourGroupId = (typeof HOUR_GROUPS)[number];

export type ChartSex = "male" | "female" | "prefer_not_to_say";

export type BoundaryFlag =
  | "near_midnight"
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
  uncertaintyRange: "adjacent_1_shichen" | "adjacent_2_shichen" | "full_day" | "auto";
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
    | "relocation"
    | "relationship"
    | "health_or_accident"
    | "family_change"
    | "career"
    | "childbearing"
    | "best"
    | "worst";
  description?: string;
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

export interface CandidateChart {
  id: string;
  hourBranch: string;
  hourGroup: HourGroupId;
  source: CandidateSource;
  birthRecordPlausibility: number;
  notes: string[];
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
  contradictions: EvidenceItem[];
  missing_information: string[];
}

export interface QuestionBank {
  version: string;
  stages: Array<{
    id: string;
    title: string;
    questions: Array<Record<string, unknown>>;
  }>;
}

export interface ScoringConfig {
  candidate_score_weights: CandidateScore["components"];
  contradiction_penalty_enabled: boolean;
  ai_allowed_before_candidate_ranking: boolean;
  symbol_prior_question_scores: Record<string, Record<string, Partial<Record<HourGroupId, number>>>>;
  fetal_order_rules: Record<"male" | "female", Partial<Record<HourGroupId, number[]>>>;
  birth_record_plausibility: Record<CandidateSource, number>;
}
