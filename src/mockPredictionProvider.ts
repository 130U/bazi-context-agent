import { buildPredictionProviderInput } from "./predictionPromptBuilder.ts";
import { mockPredictionPolicy } from "./predictionPolicy.ts";
import type { PredictionProvider, PredictionRequest, PredictionResult } from "./predictionTypes.ts";

function clamp(value: number): number {
  return Number(Math.max(0, Math.min(1, value)).toFixed(4));
}

export const mockPredictionProvider = {
  id: "mock",
  predict(request: PredictionRequest): PredictionResult {
    const input = buildPredictionProviderInput(request);
    const topConfidence = request.rankingSnapshot.top_3[0]?.confidence ?? 0.4;
    const contextBoost = Math.min(0.18, input.knownFacts.length * 0.03);
    const confidence = clamp(0.42 + topConfidence * 0.35 + contextBoost);
    const contextSummary = input.knownFacts[0]?.fact ?? "no specific context fact";
    const topCandidateText = input.topCandidateId ? `top candidate ${input.topCandidateId}` : "the available ranking snapshot";

    return {
      domain: request.domain ?? "general",
      conclusion: `Mock ${request.domain ?? "general"} reading based on ${topCandidateText}.`,
      known_facts: input.knownFacts,
      chart_signals: input.chartSignals,
      context_adjustments: input.contextAdjustments,
      prediction: {
        answer: `Using ${contextSummary}, the mock layer suggests a cautious ${request.domain ?? "general"} direction without changing the ranking snapshot.`,
        confidence,
        timeframe: "mock_near_term"
      },
      confidence,
      uncertainty: [
        "This result uses the offline mock provider.",
        "Prediction quality depends on the frozen ranking snapshot and disclosed context."
      ],
      next_questions: [
        "What outcome would make this prediction useful?",
        "Which context fact should receive the most weight in the report?"
      ],
      policy: mockPredictionPolicy("mock")
    };
  }
} satisfies PredictionProvider;
