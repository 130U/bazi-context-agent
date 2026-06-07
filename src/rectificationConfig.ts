import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import type { DefaultChartProtectionConfig, EventTypeScoringConfig, RectificationPolicyConfig, RectificationWeightsConfig } from "./rectificationTypes.ts";

export const RECTIFICATION_WEIGHTS_SOURCE = "configs/rectification_weights.stage5d.json";
export const EVENT_TYPE_SCORING_SOURCE = "configs/event_type_scoring.stage5d.json";
export const DEFAULT_CHART_PROTECTION_SOURCE = "configs/default_chart_protection.stage5d.json";
export const RECTIFICATION_POLICY_SOURCE = "configs/rectification_policy.stage5d.json";

function configPath(relativePath: string): string {
  return fileURLToPath(new URL(`../${relativePath}`, import.meta.url));
}

function readJson<T>(relativePath: string): T {
  return JSON.parse(readFileSync(configPath(relativePath), "utf8")) as T;
}

export function loadRectificationWeights(): RectificationWeightsConfig {
  return readJson<RectificationWeightsConfig>(RECTIFICATION_WEIGHTS_SOURCE);
}

export function loadEventTypeScoringConfig(): EventTypeScoringConfig {
  return readJson<EventTypeScoringConfig>(EVENT_TYPE_SCORING_SOURCE);
}

export function loadDefaultChartProtectionConfig(): DefaultChartProtectionConfig {
  return readJson<DefaultChartProtectionConfig>(DEFAULT_CHART_PROTECTION_SOURCE);
}

export function loadRectificationPolicyConfig(): RectificationPolicyConfig {
  return readJson<RectificationPolicyConfig>(RECTIFICATION_POLICY_SOURCE);
}

export function clampScore(value: number, range: [number, number] = [0, 1]): number {
  const [min, max] = range;
  return Number(Math.min(max, Math.max(min, value)).toFixed(4));
}
