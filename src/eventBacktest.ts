import { getBranchRelations, getYearBranch } from "./branchRelations.ts";
import { loadScoringConfig } from "./config.ts";
import type { BranchRelation, CandidateChart, EventBacktestResult, LifeEvent, PerEventScore, ScoringConfig } from "./types.ts";

const WARNING = "Event scoring is a deterministic year-branch and hour-branch approximation, not a full calendar calculation.";

function normalizedEventType(type: LifeEvent["type"]): string {
  if (type === "relocation") return "migration";
  if (type === "health_or_accident") return "health_accident";
  if (type === "best") return "best_year";
  if (type === "worst") return "worst_year";
  return type;
}

function relationProfile(event: LifeEvent, config: ScoringConfig): string {
  const type = normalizedEventType(event.type);
  if (type === "career" && /转|创|失业|变动|change|startup|transition/i.test(event.description ?? "")) return "change";
  return config.legacy_event_backtest.event_type_profiles[type] ?? "neutral";
}

function bestRelationScore(event: LifeEvent, relations: BranchRelation[], config: ScoringConfig): { score: number; rationale: string } {
  const policy = config.legacy_event_backtest;
  const profile = relationProfile(event, config);
  if (profile === "childbearing") {
    return { score: policy.childbearing_score, rationale: "childbearing kept neutral because a full chart is required" };
  }
  const relationSet: Array<BranchRelation | "none"> = relations.length > 0 ? relations : ["none"];
  const table = policy.relation_scores[profile] ?? policy.relation_scores.neutral;
  const score = Math.max(...relationSet.map((relation) => table[relation] ?? policy.fallback_relation_score));
  return { score, rationale: `matched ${relationSet.join(", ")} using ${profile} event scoring` };
}

function scoreCandidate(candidate: CandidateChart, events: LifeEvent[], config: ScoringConfig): EventBacktestResult {
  const policy = config.legacy_event_backtest;
  if (events.length === 0) {
    return {
      candidate_id: candidate.candidate_id,
      event_timing_fit: policy.neutral_score,
      per_event_scores: [],
      matched_rules: ["No dated life events were provided; the configured neutral score was used."],
      contradictions: [],
      missing_information: ["No dated life events provided"],
      warning: WARNING
    };
  }

  const per_event_scores: PerEventScore[] = events.map((event) => {
    const year_branch = getYearBranch(event.year);
    const relations = getBranchRelations(candidate.branch, year_branch);
    const { score, rationale } = bestRelationScore(event, relations, config);
    return { event, year_branch, relations, score, rationale };
  });
  const eventWeight = (event: LifeEvent) => event.confidence ?? policy.default_event_confidence;
  const weightedTotal = per_event_scores.reduce((sum, item) => sum + item.score * eventWeight(item.event), 0);
  const weight = per_event_scores.reduce((sum, item) => sum + eventWeight(item.event), 0);
  const contradictions = per_event_scores
    .filter((item) => item.score <= policy.contradiction_threshold)
    .map((item) => `${item.event.year} ${item.event.type} has weak branch relation fit`);

  return {
    candidate_id: candidate.candidate_id,
    event_timing_fit: Number((weightedTotal / weight).toFixed(policy.score_precision_digits)),
    per_event_scores,
    matched_rules: per_event_scores.map((item) => `${item.event.year}: ${item.rationale}`),
    contradictions,
    missing_information: [],
    warning: WARNING
  };
}

export function scoreEventBacktest(candidates: CandidateChart[], events: LifeEvent[], config?: ScoringConfig): EventBacktestResult[];
export function scoreEventBacktest(candidate: CandidateChart, events: LifeEvent[], config?: ScoringConfig): EventBacktestResult;
export function scoreEventBacktest(
  candidates: CandidateChart[] | CandidateChart,
  events: LifeEvent[],
  config = loadScoringConfig()
): EventBacktestResult[] | EventBacktestResult {
  if (Array.isArray(candidates)) return candidates.map((candidate) => scoreCandidate(candidate, events, config));
  return scoreCandidate(candidates, events, config);
}

export { getBranchRelations, getYearBranch } from "./branchRelations.ts";
