import type { CandidateRankingResult, CandidateScore, ContextFact, LifeEvent } from "./types.ts";

export const PREDICTION_DOMAINS = [
  "education",
  "career",
  "wealth",
  "relationship",
  "health",
  "migration",
  "personality",
  "family",
  "general"
] as const;

export type PredictionDomain = (typeof PREDICTION_DOMAINS)[number];
export type PredictionProviderId = "mock";

export interface RankingSnapshot {
  top_candidate_id: CandidateRankingResult["top_candidate_id"];
  top_3: CandidateScore[];
  evidence_table: CandidateRankingResult["evidence_table"];
  contradictions: string[];
  missing_information: string[];
  should_not_force_single_hour?: boolean;
  warning?: string;
  weights_used?: CandidateRankingResult["weights_used"];
}

export interface PredictionRequest {
  question: string;
  domain?: PredictionDomain;
  rankingSnapshot: RankingSnapshot;
  contextBox: ContextFact[];
  lifeEvents: LifeEvent[];
}

export interface KnownFact {
  fact: string;
  source: string;
  confidence?: number;
}

export interface ChartSignal {
  signal: string;
  source_candidate_id: string;
  confidence: number;
}

export interface ContextAdjustment {
  adjustment: string;
  basis: string[];
}

export interface PredictionPolicy {
  ai_used_for_ranking: false;
  ranking_modified_by_ai: false;
  provider: PredictionProviderId;
  schema_version?: string;
}

export interface PredictionResult {
  domain: PredictionDomain;
  conclusion: string;
  known_facts: KnownFact[];
  chart_signals: ChartSignal[];
  context_adjustments: ContextAdjustment[];
  prediction: {
    answer: string;
    confidence: number;
    timeframe?: string;
  };
  confidence: number;
  uncertainty: string[];
  next_questions: string[];
  policy: PredictionPolicy;
}

export interface PredictionProvider {
  id: PredictionProviderId;
  predict(request: PredictionRequest): PredictionResult;
}

export interface PredictionDomainsConfig {
  version: string;
  default_domain: PredictionDomain;
  domains: Array<{ id: PredictionDomain; zh_label?: string; keywords: string[] }>;
}

export interface PredictionOutputSchemaConfig {
  title?: string;
  required?: string[];
  properties?: Record<string, unknown>;
}

export interface PredictionProviderPolicyConfig {
  version: string;
  default_provider: PredictionProviderId;
  prediction_may_use_context_box: boolean;
  ranking_may_use_context_box: boolean;
  prediction_may_mutate_ranking_snapshot: boolean;
  schema_path: string;
}

export interface PredictionProviderInput {
  request: PredictionRequest;
  topCandidateId: string | null;
  knownFacts: KnownFact[];
  chartSignals: ChartSignal[];
  contextAdjustments: ContextAdjustment[];
}
