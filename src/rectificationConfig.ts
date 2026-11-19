import { loadScoringConfig } from "./config.ts";
import type { DefaultChartProtectionConfig, EventTypeScoringConfig, RectificationWeightsConfig } from "./rectificationTypes.ts";

export const RECTIFICATION_WEIGHTS_SOURCE = "configs/scoring_weights.json#rectification.weights";

export function loadRectificationWeights(): RectificationWeightsConfig {
  return loadScoringConfig().rectification.weights;
}

export function loadEventTypeScoringConfig(): EventTypeScoringConfig {
  return loadScoringConfig().rectification.event_scoring;
}

export function loadDefaultChartProtectionConfig(): DefaultChartProtectionConfig {
  return loadScoringConfig().rectification.default_chart_protection;
}

export function clampScore(value: number, range?: [number, number]): number {
  const weights = loadRectificationWeights();
  const [min, max] = range ?? weights.clamp_scores_to;
  return Number(Math.min(max, Math.max(min, value)).toFixed(weights.result_policy.score_precision_digits));
}
