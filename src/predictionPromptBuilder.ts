import { contextFactsToKnownFacts } from "./contextBox.ts";
import type { ChartSignal, ContextAdjustment, PredictionProviderInput, PredictionRequest } from "./predictionTypes.ts";

export function buildPredictionProviderInput(request: PredictionRequest): PredictionProviderInput {
  const top = request.rankingSnapshot.top_3[0];
  const topCandidateId = top?.candidate.candidate_id ?? request.rankingSnapshot.top_candidate_id ?? null;
  const chartSignals: ChartSignal[] = request.rankingSnapshot.top_3.slice(0, 3).map((score) => ({
    signal: `${score.candidate.hour_name_cn} candidate has deterministic total score ${score.totalScore}`,
    source_candidate_id: score.candidate.candidate_id,
    confidence: score.confidence
  }));
  const knownFacts = contextFactsToKnownFacts(request.contextBox);
  const contextAdjustments: ContextAdjustment[] = knownFacts.length === 0
    ? [{ adjustment: "No context-box facts were supplied; keep the answer conservative.", basis: ["empty_context_box"] }]
    : knownFacts.slice(0, 5).map((fact) => ({
        adjustment: `Use disclosed context when interpreting ${request.domain ?? "general"} direction.`,
        basis: [fact.fact]
      }));

  return { request, topCandidateId, knownFacts, chartSignals, contextAdjustments };
}
