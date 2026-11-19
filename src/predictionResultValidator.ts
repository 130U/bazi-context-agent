import { PREDICTION_DOMAINS, type PredictionProviderId, type PredictionResult } from "./predictionTypes.ts";

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isNumber01(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0 && value <= 1;
}

function requireArray(record: Record<string, unknown>, field: string): unknown[] {
  const value = record[field];
  if (!Array.isArray(value)) throw new Error(`invalid_prediction_output:${field}`);
  return value;
}

function optionalConfidence(value: unknown, field: string): number | undefined {
  if (value === undefined) return undefined;
  if (!isNumber01(value)) throw new Error(`invalid_prediction_output:${field}`);
  return value;
}

function validateKnownFacts(items: unknown[]): void {
  for (const item of items) {
    if (!isRecord(item)) throw new Error("invalid_prediction_output:known_facts.item");
    if (typeof item.fact !== "string") throw new Error("invalid_prediction_output:known_facts.fact");
    if (typeof item.source !== "string") throw new Error("invalid_prediction_output:known_facts.source");
    optionalConfidence(item.confidence, "known_facts.confidence");
  }
}

function validateChartSignals(items: unknown[]): void {
  for (const item of items) {
    if (!isRecord(item)) throw new Error("invalid_prediction_output:chart_signals.item");
    if (typeof item.signal !== "string") throw new Error("invalid_prediction_output:chart_signals.signal");
    if (typeof item.source_candidate_id !== "string") throw new Error("invalid_prediction_output:chart_signals.source_candidate_id");
    if (!isNumber01(item.confidence)) throw new Error("invalid_prediction_output:chart_signals.confidence");
  }
}

function validateContextAdjustments(items: unknown[]): void {
  for (const item of items) {
    if (!isRecord(item)) throw new Error("invalid_prediction_output:context_adjustments.item");
    if (typeof item.adjustment !== "string") throw new Error("invalid_prediction_output:context_adjustments.adjustment");
    if (!Array.isArray(item.basis) || !item.basis.every((basis) => typeof basis === "string")) {
      throw new Error("invalid_prediction_output:context_adjustments.basis");
    }
  }
}

function validateStringArray(items: unknown[], field: string): void {
  if (!items.every((item) => typeof item === "string")) throw new Error(`invalid_prediction_output:${field}.item`);
}

export function validatePredictionResult(output: unknown, provider: PredictionProviderId): PredictionResult {
  if (!isRecord(output)) throw new Error("invalid_prediction_output:root");
  if (!PREDICTION_DOMAINS.includes(output.domain as PredictionResult["domain"])) {
    throw new Error("invalid_prediction_output:domain");
  }
  if (typeof output.conclusion !== "string") throw new Error("invalid_prediction_output:conclusion");
  validateKnownFacts(requireArray(output, "known_facts"));
  validateChartSignals(requireArray(output, "chart_signals"));
  validateContextAdjustments(requireArray(output, "context_adjustments"));
  validateStringArray(requireArray(output, "uncertainty"), "uncertainty");
  validateStringArray(requireArray(output, "next_questions"), "next_questions");
  if (!isRecord(output.prediction)) throw new Error("invalid_prediction_output:prediction");
  if (typeof output.prediction.answer !== "string") throw new Error("invalid_prediction_output:prediction.answer");
  if (!isNumber01(output.prediction.confidence)) throw new Error("invalid_prediction_output:prediction.confidence");
  if (output.prediction.timeframe !== undefined && typeof output.prediction.timeframe !== "string") {
    throw new Error("invalid_prediction_output:prediction.timeframe");
  }
  if (!isNumber01(output.confidence)) throw new Error("invalid_prediction_output:confidence");
  if (!isRecord(output.policy)) throw new Error("invalid_prediction_output:policy");
  if (output.policy.ai_used_for_ranking !== false) throw new Error("invalid_prediction_output:policy.ai_used_for_ranking");
  if (output.policy.ranking_modified_by_ai !== false) throw new Error("invalid_prediction_output:policy.ranking_modified_by_ai");
  if (output.policy.provider !== provider) throw new Error("invalid_prediction_output:policy.provider");

  return {
    ...(output as unknown as PredictionResult),
    policy: {
      ...(output.policy as unknown as PredictionResult["policy"]),
      provider,
      ai_used_for_ranking: false,
      ranking_modified_by_ai: false,
      output_schema_validated: true
    }
  };
}
