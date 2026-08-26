import { applyDefaultChartProtection } from "./defaultChartProtection.ts";
import { scoreEventTimingFit } from "./eventTimingFit.ts";
import { clampScore, loadRectificationWeights, RECTIFICATION_WEIGHTS_SOURCE } from "./rectificationConfig.ts";
import { createRectificationEvidence, evidenceTableRows } from "./rectificationEvidence.ts";
import type { BaziDerivedProfile, CandidateChartV2, DefaultChart } from "./baziTypes.ts";
import type {
  CandidateRectificationScore,
  RectificationEvidence,
  RectificationResultV2,
  RectificationV2Request
} from "./rectificationTypes.ts";

type ChartLike = DefaultChart | CandidateChartV2;

function chartId(chart: ChartLike): string {
  return chart.chart_role === "default" ? chart.chart_id : chart.candidate_id;
}

function chartRole(chart: ChartLike): "default" | "candidate" {
  return chart.chart_role;
}

function profileFor(chart: ChartLike, profiles: BaziDerivedProfile[] | undefined): BaziDerivedProfile | undefined {
  const embedded = chart.derived_profile;
  if (embedded) return embedded;
  return profiles?.find((profile) => profile.source_chart_id === chartId(chart));
}

function recordedTimePrior(chart: ChartLike, config: ReturnType<typeof loadRectificationWeights>): number {
  return clampScore(typeof chart.recorded_time_prior_score === "number"
    ? chart.recorded_time_prior_score
    : chart.chart_role === "default"
      ? config.fallback_scores.default_recorded_time_prior
      : config.fallback_scores.candidate_recorded_time_prior);
}

function symbolPriorFit(chart: ChartLike, symbolPrior: unknown, config: ReturnType<typeof loadRectificationWeights>): number {
  if (chart.chart_role === "candidate" && typeof chart.symbol_prior_score === "number") return clampScore(chart.symbol_prior_score);
  if (symbolPrior && typeof symbolPrior === "object") {
    const values = Object.values(symbolPrior as Record<string, unknown>).filter((value): value is number => typeof value === "number");
    if (values.length > 0) return clampScore(values.reduce((sum, value) => sum + value, 0) / values.length);
  }
  return config.fallback_scores.symbol_prior;
}

function chartProfileFit(profile: BaziDerivedProfile | undefined, config: ReturnType<typeof loadRectificationWeights>): { score: number; missing: string[]; evidence: string[] } {
  const policy = config.profile_scoring;
  if (!profile) return { score: policy.missing_profile, missing: ["BaziDerivedProfile"], evidence: ["No derived profile attached."] };
  const evidence: string[] = [];
  const missing: string[] = [];
  let score = policy.base;
  if (Array.isArray(profile.annual_fortunes) && profile.annual_fortunes.length > 0) {
    score += policy.annual_fortunes;
    evidence.push("annual_fortunes present");
  } else missing.push("annual_fortunes");
  if (Array.isArray(profile.luck_cycles) && profile.luck_cycles.length > 0) {
    score += policy.luck_cycles;
    evidence.push("luck_cycles present");
  } else missing.push("luck_cycles");
  if (profile.relations) {
    score += policy.relations;
    evidence.push("relations present");
  } else missing.push("relations");
  if (Array.isArray(profile.ten_gods) && profile.ten_gods.length > 0) {
    score += policy.ten_gods;
    evidence.push("ten_gods present");
  } else missing.push("ten_gods");
  if (Array.isArray(profile.warnings) && profile.warnings.length === 0) score += policy.no_warnings;
  return { score: clampScore(score), missing, evidence };
}

function contradictionPenalty(contradictions: CandidateRectificationScore["contradictions"], config: ReturnType<typeof loadRectificationWeights>): number {
  return clampScore(
    contradictions.reduce((sum, item) => sum + item.penalty, 0),
    [config.clamp_scores_to[0], config.fallback_scores.maximum_contradiction_penalty]
  );
}

function scoreChart(
  chart: ChartLike,
  request: RectificationV2Request,
  weightsConfig: ReturnType<typeof loadRectificationWeights>
): CandidateRectificationScore {
  const weights = weightsConfig.candidate_rectification_score_weights;
  const id = chartId(chart);
  const profile = profileFor(chart, request.bazi_derived_profiles);
  const eventFit = scoreEventTimingFit(chart, request.life_events ?? [], profile);
  const profileFit = chartProfileFit(profile, weightsConfig);
  const recorded = recordedTimePrior(chart, weightsConfig);
  const symbol = symbolPriorFit(chart, request.symbol_prior, weightsConfig);
  const penalty = weightsConfig.contradiction_penalty_enabled ? contradictionPenalty(eventFit.contradictions, weightsConfig) : 0;
  const weighted = {
    recorded_time_prior: clampScore(recorded * weights.recorded_time_prior),
    event_timing_fit: clampScore(eventFit.event_timing_fit * weights.event_timing_fit),
    symbol_prior_fit: clampScore(symbol * weights.symbol_prior_fit),
    chart_profile_fit: clampScore(profileFit.score * weights.chart_profile_fit)
  };
  const total = clampScore(weighted.recorded_time_prior + weighted.event_timing_fit + weighted.symbol_prior_fit + weighted.chart_profile_fit - penalty, weightsConfig.clamp_scores_to);
  const evidence: RectificationEvidence[] = [
    createRectificationEvidence({
      candidate_id: id,
      evidence_type: "recorded_time_prior",
      label: "recorded_time_prior",
      description: `Recorded time prior score ${recorded}.`,
      source: "birth_record",
      score_delta: recorded,
      weight: weights.recorded_time_prior
    }),
    createRectificationEvidence({
      candidate_id: id,
      evidence_type: "event_timing_fit",
      label: "event_timing_fit",
      description: `Event timing fit ${eventFit.event_timing_fit} from ${eventFit.event_scores.length} dated events.`,
      source: "life_event",
      score_delta: eventFit.event_timing_fit,
      weight: weights.event_timing_fit,
      confidence: eventFit.confidence
    }),
    createRectificationEvidence({
      candidate_id: id,
      evidence_type: "symbol_prior",
      label: "symbol_prior_fit",
      description: `Weak symbol prior fit ${symbol}.`,
      source: "symbol_answer",
      score_delta: symbol,
      weight: weights.symbol_prior_fit
    }),
    createRectificationEvidence({
      candidate_id: id,
      evidence_type: "chart_profile_fit",
      label: "chart_profile_fit",
      description: `Chart profile fit ${profileFit.score}; ${profileFit.evidence.join(", ") || "limited profile data"}.`,
      source: "derived_profile",
      score_delta: profileFit.score,
      weight: weights.chart_profile_fit
    })
  ];
  if (penalty > 0) {
    evidence.push(
      createRectificationEvidence({
        candidate_id: id,
        evidence_type: "contradiction",
        label: "contradiction_penalty",
        description: `Contradiction penalty ${penalty}.`,
        source: "life_event",
        score_delta: -penalty,
        weight: weightsConfig.result_policy.contradiction_evidence_weight
      })
    );
  }
  for (const missing of [...eventFit.missing_information, ...profileFit.missing]) {
    evidence.push(
      createRectificationEvidence({
        candidate_id: id,
        evidence_type: "missing_information",
        label: missing,
        description: `Missing information: ${missing}.`,
        source: "derived_profile",
        confidence: weightsConfig.fallback_scores.missing_evidence_confidence
      })
    );
  }

  return {
    candidate_id: id,
    chart_role: chartRole(chart),
    total_score: total,
    confidence: clampScore(
      (eventFit.confidence + (profile ? weightsConfig.fallback_scores.profile_confidence : weightsConfig.fallback_scores.missing_profile_confidence))
        / weightsConfig.result_policy.confidence_component_count
        - penalty / weightsConfig.result_policy.penalty_confidence_divisor
    ),
    components: {
      recorded_time_prior: recorded,
      event_timing_fit: eventFit.event_timing_fit,
      symbol_prior_fit: symbol,
      chart_profile_fit: profileFit.score,
      contradiction_penalty: penalty
    },
    weighted_components: weighted,
    evidence,
    contradictions: eventFit.contradictions,
    missing_information: [...new Set([...eventFit.missing_information, ...profileFit.missing])],
    warnings: [...new Set([...eventFit.warnings, ...(profile?.warnings ?? [])])],
    high_importance_event_matches: eventFit.high_importance_matches
  };
}

export function runRectificationV2(request: RectificationV2Request): RectificationResultV2 {
  if (!request.default_chart) throw new Error("Rectification v2 requires default_chart.");
  const weightsConfig = loadRectificationWeights();
  const scores = [request.default_chart, ...(request.candidates ?? [])]
    .map((chart) => scoreChart(chart, request, weightsConfig))
    .sort((a, b) => b.total_score - a.total_score);
  const protection = applyDefaultChartProtection(
    scores,
    request.life_events?.length ?? 0,
    undefined,
    request.default_chart.protection_policy?.protected_as_default ?? true
  );
  const selected =
    protection.recommendation === "candidate_preferred" && protection.top_alternative_id
      ? scores.find((score) => score.candidate_id === protection.top_alternative_id) ?? scores.find((score) => score.chart_role === "default") ?? scores[0]
      : scores.find((score) => score.chart_role === "default") ?? scores[0];
  const componentWeights = {
    ...weightsConfig.candidate_rectification_score_weights,
    contradiction_penalty: weightsConfig.result_policy.contradiction_evidence_weight
  };
  const evidence_table = scores.flatMap((score) => evidenceTableRows(score, componentWeights));
  return {
    selected_chart_id: selected.candidate_id,
    selected_chart_role: selected.chart_role,
    recommendation: protection.recommendation,
    scores,
    top_alternatives: scores
      .filter((score) => score.candidate_id !== selected.candidate_id)
      .slice(0, weightsConfig.result_policy.alternative_count),
    evidence_table,
    default_chart_protection: protection,
    warnings: [...new Set([...scores.flatMap((score) => score.warnings), ...protection.reasons])],
    missing_information: [...new Set(scores.flatMap((score) => score.missing_information))],
    metadata: {
      stage: "5D",
      ai_used: false,
      context_box_used_for_rectification: false,
      ranking_modified_by_ai: false,
      weights_source: RECTIFICATION_WEIGHTS_SOURCE
    }
  };
}
