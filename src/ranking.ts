import type { CandidateChart, CandidateRankingInput, CandidateRankingResult, CandidateScore, ContextFact, EventBacktestResult, EvidenceItem, EvidenceRow, HourGroupPrior, HourGroupPriorResult, LifeEvent, ScoringConfig } from "./types.ts";
import { scoreEventBacktest } from "./eventBacktest.ts";

type Components = CandidateScore["components"];

function total(components: Components, weights: Components, contradictionCount: number, penaltyEnabled: boolean, config: ScoringConfig): number {
  const base =
    components.symbol_prior_fit * weights.symbol_prior_fit +
    components.event_timing_fit * weights.event_timing_fit +
    components.early_life_and_family_fit * weights.early_life_and_family_fit +
    components.birth_record_plausibility * weights.birth_record_plausibility +
    components.domain_trajectory_fit * weights.domain_trajectory_fit;
  const policy = config.legacy_ranking;
  const penalty = penaltyEnabled
    ? Math.min(policy.maximum_contradiction_penalty, contradictionCount * policy.contradiction_penalty_per_item)
    : 0;
  return Number(Math.max(0, base - penalty).toFixed(policy.score_precision_digits));
}

function confidence(scores: CandidateScore[], precision: number): CandidateScore[] {
  const sum = scores.reduce((acc, score) => acc + score.totalScore, 0);
  if (sum <= 0) return scores.map((score) => ({ ...score, confidence: Number((1 / scores.length).toFixed(precision)) }));
  return scores.map((score) => ({ ...score, confidence: Number((score.totalScore / sum).toFixed(precision)) }));
}

function symbolEntries(result: HourGroupPriorResult, group: CandidateChart["hour_group"]): EvidenceItem[] {
  return result.entries.find((entry) => entry.group === group)?.evidence ?? [];
}

function rowsForCandidate(candidate: CandidateChart, components: Components, symbolEvidence: EvidenceItem[], event: EventBacktestResult): EvidenceRow[] {
  const rows: EvidenceRow[] = [
    { candidate_id: candidate.candidate_id, category: "symbol", label: "symbol_prior_fit", value: components.symbol_prior_fit, impact: "positive" },
    { candidate_id: candidate.candidate_id, category: "birth_record", label: candidate.source_reasons.join("; "), value: components.birth_record_plausibility, impact: "positive" },
    { candidate_id: candidate.candidate_id, category: "event_backtest", label: event.warning, value: components.event_timing_fit, impact: "neutral" },
    { candidate_id: candidate.candidate_id, category: "early_life", label: "early_life_and_family_fit", value: components.early_life_and_family_fit, impact: "neutral" },
    { candidate_id: candidate.candidate_id, category: "domain_trajectory", label: "domain_trajectory_fit", value: components.domain_trajectory_fit, impact: "neutral" }
  ];
  for (const item of symbolEvidence) rows.push({ candidate_id: candidate.candidate_id, category: "symbol", label: item.message, value: item.value ?? "", impact: "positive" });
  for (const item of event.contradictions) rows.push({ candidate_id: candidate.candidate_id, category: "contradiction", label: item, value: item, impact: "negative" });
  for (const item of [...candidate.missing_information, ...event.missing_information]) rows.push({ candidate_id: candidate.candidate_id, category: "missing_information", label: item, value: item, impact: "neutral" });
  return rows;
}

export function rankCandidates(input: CandidateRankingInput): CandidateRankingResult;
export function rankCandidates(candidates: CandidateChart[], priors: HourGroupPrior[] | HourGroupPriorResult, events: LifeEvent[], contextFacts: ContextFact[] | undefined, scoringConfig: ScoringConfig): CandidateScore[];
export function rankCandidates(inputOrCandidates: CandidateRankingInput | CandidateChart[], priors?: HourGroupPrior[] | HourGroupPriorResult, events?: LifeEvent[], contextFacts?: ContextFact[], scoringConfig?: ScoringConfig): CandidateRankingResult | CandidateScore[] {
  if (Array.isArray(inputOrCandidates) && !scoringConfig) throw new Error("scoringConfig is required for candidate ranking.");
  const uniformPrior = Array.isArray(inputOrCandidates)
    ? (scoringConfig as ScoringConfig).legacy_ranking.uniform_group_prior
    : inputOrCandidates.scoringConfig.legacy_ranking.uniform_group_prior;
  const input: CandidateRankingInput = Array.isArray(inputOrCandidates)
    ? {
        candidates: inputOrCandidates,
        symbol_prior_result: Array.isArray(priors)
          ? {
              prior: {
                G1_zi_wu_mao_you: priors.find((entry) => entry.group === "G1_zi_wu_mao_you")?.prior ?? uniformPrior,
                G2_yin_shen_si_hai: priors.find((entry) => entry.group === "G2_yin_shen_si_hai")?.prior ?? uniformPrior,
                G3_chen_xu_chou_wei: priors.find((entry) => entry.group === "G3_chen_xu_chou_wei")?.prior ?? uniformPrior
              },
              raw_scores: { G1_zi_wu_mao_you: 0, G2_yin_shen_si_hai: 0, G3_chen_xu_chou_wei: 0 },
              entries: priors,
              evidence: priors.flatMap((entry) => entry.evidence),
              missing_information: [],
              warning: "Symbol evidence is weak and cannot determine birth hour alone."
            }
          : (priors as HourGroupPriorResult),
        event_backtest_results: scoreEventBacktest(inputOrCandidates, events ?? [], scoringConfig),
        contextFacts,
        scoringConfig: scoringConfig as ScoringConfig
      }
    : inputOrCandidates;

  const policy = input.scoringConfig.legacy_ranking;
  const scored = input.candidates.map((candidate): CandidateScore => {
    const event = input.event_backtest_results.find((item) => item.candidate_id === candidate.candidate_id) ?? {
      candidate_id: candidate.candidate_id,
      event_timing_fit: policy.neutral_component_score,
      per_event_scores: [],
      matched_rules: [],
      contradictions: [],
      missing_information: ["event backtest result"],
      warning: "Event scoring is a deterministic year-branch and hour-branch approximation, not a full calendar calculation."
    };
    const components: Components = {
      symbol_prior_fit: candidate.symbol_prior_fit ?? input.symbol_prior_result.prior[candidate.hour_group],
      event_timing_fit: event.event_timing_fit,
      early_life_and_family_fit: policy.neutral_component_score,
      birth_record_plausibility: candidate.birth_record_plausibility ?? policy.neutral_component_score,
      domain_trajectory_fit: policy.neutral_component_score
    };
    const symbolEvidence = symbolEntries(input.symbol_prior_result, candidate.hour_group);
    const evidence_table = rowsForCandidate(candidate, components, symbolEvidence, event);
    return {
      candidate,
      components,
      totalScore: total(components, input.scoringConfig.candidate_score_weights, event.contradictions.length, input.scoringConfig.contradiction_penalty_enabled, input.scoringConfig),
      confidence: 0,
      evidence: [...symbolEvidence, ...event.matched_rules.map((message) => ({ code: "event_backtest", message }))],
      evidence_table,
      contradictions: event.contradictions,
      missing_information: [...new Set([...candidate.missing_information, ...event.missing_information])]
    };
  });

  const sorted = scored.sort((a, b) => b.totalScore - a.totalScore);
  const top_3 = confidence(sorted.slice(0, 3), policy.confidence_precision_digits);
  const should_not_force_single_hour = top_3.length > 1 && (
    top_3[0].totalScore - top_3[1].totalScore < policy.single_hour_score_margin
    || top_3[0].confidence - top_3[1].confidence < policy.single_hour_confidence_margin
  );
  const result: CandidateRankingResult = {
    top_candidate_id: top_3[0]?.candidate.candidate_id ?? null,
    candidates: confidence(sorted, policy.confidence_precision_digits),
    top_3,
    should_not_force_single_hour,
    evidence_table: top_3.flatMap((candidate) => candidate.evidence_table),
    contradictions: [...new Set(top_3.flatMap((candidate) => candidate.contradictions))],
    missing_information: [...new Set(top_3.flatMap((candidate) => candidate.missing_information))],
    warning: should_not_force_single_hour ? "Top 1 and Top 2 are close; do not force-lock one birth hour." : "Ranking is deterministic and uses configured weights."
      ,
    weights_used: input.scoringConfig.candidate_score_weights
  };

  return Array.isArray(inputOrCandidates) ? result.top_3 : result;
}
