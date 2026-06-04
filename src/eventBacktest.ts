import type { BranchRelation, CandidateChart, EventBacktestResult, LifeEvent, PerEventScore } from "./types.ts";
import { getBranchRelations, getYearBranch } from "./branchRelations.ts";

const WARNING = "Round 02 event scoring is a deterministic stub based on year-branch/hour-branch relations. It is not a full BaZi calendar calculation.";

function eventType(event: LifeEvent): LifeEvent["type"] {
  if (event.type === "relocation") return "migration";
  if (event.type === "health_or_accident") return "health_accident";
  if (event.type === "best") return "best_year";
  if (event.type === "worst") return "worst_year";
  return event.type;
}

function bestRelationScore(type: LifeEvent["type"], relations: BranchRelation[], description = ""): { score: number; rationale: string } {
  const normalizedType = eventType({ year: 2000, type, description });
  if (normalizedType === "childbearing") return { score: 0.5, rationale: "childbearing retained as interface-only; full chart is required later" };
  const relationSet = relations.length > 0 ? relations : ["none"];

  const tables: Record<string, Partial<Record<BranchRelation | "none", number>>> = {
    change: { clash: 0.85, harm: 0.7, same_branch: 0.55, triad_same_group: 0.45, six_harmony: 0.35, none: 0.2 },
    flow: { six_harmony: 0.8, triad_same_group: 0.7, same_branch: 0.55, clash: 0.45, harm: 0.3, none: 0.2 },
    relationship: { six_harmony: 0.8, triad_same_group: 0.65, clash: 0.55, same_branch: 0.5, harm: 0.4, none: 0.2 },
    career: { triad_same_group: 0.7, six_harmony: 0.65, clash: 0.6, same_branch: 0.5, harm: 0.45, none: 0.2 },
    neutral: { clash: 0.6, six_harmony: 0.55, triad_same_group: 0.55, same_branch: 0.5, harm: 0.45, none: 0.2 }
  };

  let key: keyof typeof tables = "neutral";
  if (["major_turning", "migration", "career_transition", "health_accident", "family_change", "worst_year"].includes(normalizedType)) key = "change";
  if (["education", "best_year"].includes(normalizedType)) key = "flow";
  if (normalizedType === "relationship") key = "relationship";
  if (normalizedType === "career") {
    key = /转|创|失业|变动|change|startup|transition/i.test(description) ? "change" : "career";
  }

  const score = Math.max(...relationSet.map((relation) => tables[key][relation] ?? 0.2));
  return { score, rationale: `matched ${relationSet.join(", ")} using ${key} event scoring` };
}

function scoreCandidate(candidate: CandidateChart, events: LifeEvent[]): EventBacktestResult {
  if (events.length === 0) {
    return {
      candidate_id: candidate.candidate_id,
      event_timing_fit: 0.5,
      per_event_scores: [],
      matched_rules: ["No life events provided; neutral score 0.5."],
      contradictions: [],
      missing_information: ["No life events provided"],
      warning: WARNING
    };
  }

  const per_event_scores: PerEventScore[] = events.map((event) => {
    const year_branch = getYearBranch(event.year);
    const relations = getBranchRelations(candidate.branch, year_branch);
    const { score, rationale } = bestRelationScore(event.type, relations, event.description);
    return { event, year_branch, relations, score, rationale };
  });

  const weightedTotal = per_event_scores.reduce((sum, item) => sum + item.score * (item.event.confidence ?? 1), 0);
  const weight = per_event_scores.reduce((sum, item) => sum + (item.event.confidence ?? 1), 0);
  const contradictions = per_event_scores.filter((item) => item.score <= 0.3).map((item) => `${item.event.year} ${item.event.type} has weak branch relation fit`);

  return {
    candidate_id: candidate.candidate_id,
    event_timing_fit: Number((weightedTotal / weight).toFixed(4)),
    per_event_scores,
    matched_rules: per_event_scores.map((item) => `${item.event.year}: ${item.rationale}`),
    contradictions,
    missing_information: [],
    warning: WARNING
  };
}

export function scoreEventBacktest(candidates: CandidateChart[] | CandidateChart, events: LifeEvent[]): EventBacktestResult[] | EventBacktestResult {
  if (Array.isArray(candidates)) return candidates.map((candidate) => scoreCandidate(candidate, events));
  return scoreCandidate(candidates, events);
}

export { getBranchRelations, getYearBranch } from "./branchRelations.ts";
