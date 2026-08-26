import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { loadScoringConfig } from "./config.ts";
import type { DefaultChartProtectionConfig, EventTypeScoringConfig, RectificationPolicyConfig, RectificationWeightsConfig } from "./rectificationTypes.ts";

export const RECTIFICATION_WEIGHTS_SOURCE = "configs/scoring_weights.v1.json#rectification_v2.weights";
export const EVENT_TYPE_SCORING_SOURCE = "configs/scoring_weights.v1.json#rectification_v2.event_scoring";
export const DEFAULT_CHART_PROTECTION_SOURCE = "configs/scoring_weights.v1.json#rectification_v2.default_chart_protection";
export const RECTIFICATION_POLICY_SOURCE = "configs/rectification_policy.stage5d.json";

function configPath(relativePath: string): string {
  return fileURLToPath(new URL(`../${relativePath}`, import.meta.url));
}

function readJson<T>(relativePath: string): T {
  return JSON.parse(readFileSync(configPath(relativePath), "utf8")) as T;
}

export function loadRectificationWeights(): RectificationWeightsConfig {
  return loadScoringConfig().rectification_v2.weights;
}

export function loadEventTypeScoringConfig(): EventTypeScoringConfig {
  return loadScoringConfig().rectification_v2.event_scoring;
}

export function loadDefaultChartProtectionConfig(): DefaultChartProtectionConfig {
  return loadScoringConfig().rectification_v2.default_chart_protection;
}

export function loadRectificationPolicyConfig(): RectificationPolicyConfig {
  return readJson<RectificationPolicyConfig>(RECTIFICATION_POLICY_SOURCE);
}

export function clampScore(value: number, range?: [number, number]): number {
  const weights = loadRectificationWeights();
  const [min, max] = range ?? weights.clamp_scores_to;
  return Number(Math.min(max, Math.max(min, value)).toFixed(weights.result_policy.score_precision_digits));
}
