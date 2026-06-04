import type { CandidateChart, CandidateRankingInput, CandidateRankingResult, CandidateScore, ContextFact, EventBacktestResult, EvidenceItem, EvidenceRow, HourGroupPrior, HourGroupPriorResult, LifeEvent, ScoringConfig } from "./types.ts";
import { scoreEventBacktest } from "./eventBacktest.ts";

type Components = CandidateScore["components"];

function contextFit(contextFacts: ContextFact[] = []): Pick<Components, "early_life_and_family_fit" | "domain_trajectory_fit"> {
  if (contextFacts.length === 0) return { early_life_and_family_fit: 0.5, domain_trajectory_fit: 0.5 };
  const confidence = contextFacts.reduce((sum, fact) => sum + fact.confidence, 0) / contextFacts.length;
  return {
    early_life_and_family_fit: Number(Math.min(1, confidence).toFixed(4)),
    domain_trajectory_fit: Number(Math.min(1, 0.45 + confidence / 2).toFixed(4))
  };
}

function total(components: Components, weights: Components, contradictionCount: number, penaltyEnabled: boolean): number {
  const base =
    components.symbol_prior_fit * weights.symbol_prior_fit +
    components.event_timing_fit * weights.event_timing_fit +
    components.early_life_and_family_fit * weights.early_life_and_family_fit +
    components.birth_record_plausibility * weights.birth_record_plausibility +
    components.domain_trajectory_fit * weights.domain_trajectory_fit;
  const penalty = penaltyEnabled ? Math.min(0.15, contradictionCount * 0.03) : 0;
  return Number(Math.max(0, base - penalty).toFixed(6));
}

function confidence(scores: CandidateScore[]): CandidateScore[] {
  const sum = scores.reduce((acc, score) => acc + score.totalScore, 0);
  if (sum <= 0) return scores.map((score) => ({ ...score, confidence: Number((1 / scores.length).toFixed(4)) }));
  return scores.map((score) => ({ ...score, confidence: Number((score.totalScore / sum).toFixed(4)) }));
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

export function rankCandidates(inputOrCandidates: CandidateRankingInput | CandidateChart[], priors?: HourGroupPrior[] | HourGroupPriorResult, events?: LifeEvent[], contextFacts?: ContextFact[], scoringConfig?: ScoringConfig): CandidateRankingResult | CandidateScore[] {
  const input: CandidateRankingInput = Array.isArray(inputOrCandidates)
    ? {
        candidates: inputOrCandidates,
        symbol_prior_result: Array.isArray(priors)
          ? {
              prior: {
                G1_zi_wu_mao_you: priors.find((entry) => entry.group === "G1_zi_wu_mao_you")?.prior ?? 1 / 3,
                G2_yin_shen_si_hai: priors.find((entry) => entry.group === "G2_yin_shen_si_hai")?.prior ?? 1 / 3,
                G3_chen_xu_chou_wei: priors.find((entry) => entry.group === "G3_chen_xu_chou_wei")?.prior ?? 1 / 3
              },
              raw_scores: { G1_zi_wu_mao_you: 0, G2_yin_shen_si_hai: 0, G3_chen_xu_chou_wei: 0 },
              entries: priors,
              evidence: priors.flatMap((entry) => entry.evidence),
              missing_information: [],
              warning: "Symbol evidence is weak and cannot determine birth hour alone."
            }
          : (priors as HourGroupPriorResult),
        event_backtest_results: scoreEventBacktest(inputOrCandidates, events ?? []) as EventBacktestResult[],
        contextFacts,
        scoringConfig: scoringConfig as ScoringConfig
      }
    : inputOrCandidates;

  const context = contextFit(input.contextFacts);
  const scored = input.candidates.map((candidate): CandidateScore => {
    const event = input.event_backtest_results.find((item) => item.candidate_id === candidate.candidate_id) ?? {
      candidate_id: candidate.candidate_id,
      event_timing_fit: 0.5,
      per_event_scores: [],
      matched_rules: [],
      contradictions: [],
      missing_information: ["event backtest result"],
      warning: "Round 02 event scoring is a deterministic stub based on year-branch/hour-branch relations. It is not a full BaZi calendar calculation."
    };
    const components: Components = {
      symbol_prior_fit: candidate.symbol_prior_fit ?? input.symbol_prior_result.prior[candidate.hour_group],
      event_timing_fit: event.event_timing_fit,
      early_life_and_family_fit: context.early_life_and_family_fit,
      birth_record_plausibility: candidate.birth_record_plausibility ?? 0.5,
      domain_trajectory_fit: context.domain_trajectory_fit
    };
    const symbolEvidence = symbolEntries(input.symbol_prior_result, candidate.hour_group);
    const evidence_table = rowsForCandidate(candidate, components, symbolEvidence, event);
    return {
      candidate,
      components,
      totalScore: total(components, input.scoringConfig.candidate_score_weights, event.contradictions.length, input.scoringConfig.contradiction_penalty_enabled),
      confidence: 0,
      evidence: [...symbolEvidence, ...event.matched_rules.map((message) => ({ code: "event_backtest", message }))],
      evidence_table,
      contradictions: event.contradictions,
      missing_information: [...new Set([...candidate.missing_information, ...event.missing_information])]
    };
  });

  const sorted = scored.sort((a, b) => b.totalScore - a.totalScore);
  const top_3 = confidence(sorted.slice(0, 3));
  const should_not_force_single_hour = top_3.length > 1 && (top_3[0].totalScore - top_3[1].totalScore < 0.08 || top_3[0].confidence - top_3[1].confidence < 0.1);
  const result: CandidateRankingResult = {
    top_candidate_id: top_3[0]?.candidate.candidate_id ?? null,
    candidates: confidence(sorted),
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
