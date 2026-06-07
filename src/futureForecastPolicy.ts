import { loadFutureForecastDomainPolicyConfig, loadFutureForecastSafetyPolicyConfig, loadFutureForecastTimeWindowPolicyConfig } from "./config.ts";
import type { ForecastInput } from "./forecastInputTypes.ts";
import type { FutureForecastProviderId, Stage6ForecastDomain, Stage6ForecastHorizon } from "./futureForecastTypes.ts";

export function getFutureForecastProvider(requested?: string): FutureForecastProviderId {
  return requested === "openai" ? "mock_fallback" : "mock";
}

export function allowedStage6Domains(): Stage6ForecastDomain[] {
  return loadFutureForecastDomainPolicyConfig().domains;
}

export function allowedStage6Horizons(): Stage6ForecastHorizon[] {
  return loadFutureForecastTimeWindowPolicyConfig().allowed_horizons;
}

export function stage6SafetyForbiddenPatterns(): RegExp[] {
  const policy = loadFutureForecastSafetyPolicyConfig();
  return [
    ...policy.must_not_include.map((item) => new RegExp(item.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i")),
    /gho_[A-Za-z0-9_]+/,
    /github_pat_[A-Za-z0-9_]+/,
    /sk-[A-Za-z0-9_-]{12,}/
  ];
}

export function assertForecastInputBoundary(input: ForecastInput): void {
  if (input.boundaries.ai_used_to_build_forecast_input !== false) throw new Error("ForecastInput boundary violation: ai_used_to_build_forecast_input.");
  if (input.boundaries.ranking_modified !== false) throw new Error("ForecastInput boundary violation: ranking_modified.");
  if (input.boundaries.rectification_modified !== false) throw new Error("ForecastInput boundary violation: rectification_modified.");
  if (input.boundaries.context_box_used_for_rectification !== false) throw new Error("ForecastInput boundary violation: context_box_used_for_rectification.");
  if (input.boundaries.secrets_included !== false) throw new Error("ForecastInput boundary violation: secrets_included.");
}
