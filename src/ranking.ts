import type { CandidateChart, CandidateScore, ContextFact, EvidenceItem, HourGroupPrior, LifeEvent, ScoringConfig } from "./types.ts";
import { scoreEventBacktest } from "./eventBacktest.ts";

function priorFor(candidate: CandidateChart, priors: HourGroupPrior[]): number {
  return priors.find((prior) => prior.group === candidate.hourGroup)?.prior ?? 1 / 3;
}

function contextFit(contextFacts: ContextFact[]): Pick<CandidateScore["components"], "early_life_and_family_fit" | "domain_trajectory_fit"> {
  if (contextFacts.length === 0) {
    return {
      early_life_and_family_fit: 0.5,
      domain_trajectory_fit: 0.5
    };
  }
  const averageConfidence = contextFacts.reduce((sum, fact) => sum + fact.confidence, 0) / contextFacts.length;
  return {
    early_life_and_family_fit: Number(Math.min(1, averageConfidence).toFixed(2)),
    domain_trajectory_fit: Number(Math.min(1, 0.45 + averageConfidence / 2).toFixed(2))
  };
}

function weightedTotal(components: CandidateScore["components"], weights: ScoringConfig["candidate_score_weights"]): number {
  return Number(
    (
      components.symbol_prior_fit * weights.symbol_prior_fit +
      components.event_timing_fit * weights.event_timing_fit +
      components.early_life_and_family_fit * weights.early_life_and_family_fit +
      components.birth_record_plausibility * weights.birth_record_plausibility +
      components.domain_trajectory_fit * weights.domain_trajectory_fit
    ).toFixed(4)
  );
}

export function rankCandidates(
  candidates: CandidateChart[],
  priors: HourGroupPrior[],
  events: LifeEvent[],
  contextFacts: ContextFact[],
  scoringConfig: ScoringConfig
): CandidateScore[] {
  const ranked = candidates.map((candidate): CandidateScore => {
    const eventBacktest = scoreEventBacktest(candidate, events);
    const context = contextFit(contextFacts);
    const components = {
      symbol_prior_fit: Number(priorFor(candidate, priors).toFixed(4)),
      event_timing_fit: eventBacktest.event_timing_fit,
      early_life_and_family_fit: context.early_life_and_family_fit,
      birth_record_plausibility: candidate.birthRecordPlausibility,
      domain_trajectory_fit: context.domain_trajectory_fit
    };
    const evidence: EvidenceItem[] = [
      ...eventBacktest.evidence,
      { code: "symbol_prior_fit", message: `candidate belongs to ${candidate.hourGroup}`, value: components.symbol_prior_fit },
      { code: "birth_record_plausibility", message: `candidate source is ${candidate.source}`, value: components.birth_record_plausibility }
    ];

    return {
      candidate,
      components,
      totalScore: weightedTotal(components, scoringConfig.candidate_score_weights),
      confidence: 0,
      evidence,
      contradictions: eventBacktest.contradictions,
      missing_information: eventBacktest.missing_information
    };
  });

  const top3 = ranked.sort((a, b) => b.totalScore - a.totalScore).slice(0, 3);
  const sumTop3 = top3.reduce((sum, score) => sum + score.totalScore, 0);
  return top3.map((score) => ({
    ...score,
    confidence: sumTop3 > 0 ? Number((score.totalScore / sumTop3).toFixed(4)) : 0
  }));
}
