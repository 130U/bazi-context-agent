import { loadFutureForecastSchemaConfig } from "./config.ts";
import { allowedStage6Domains, allowedStage6Horizons, stage6SafetyForbiddenPatterns } from "./futureForecastPolicy.ts";
import type { FutureForecastResult, FutureForecastValidationResult, Stage6ForecastDomain } from "./futureForecastTypes.ts";

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isNumber01(value: unknown): boolean {
  return typeof value === "number" && Number.isFinite(value) && value >= 0 && value <= 1;
}

function hasSecrets(value: unknown): boolean {
  const json = JSON.stringify(value);
  return stage6SafetyForbiddenPatterns().some((pattern) => pattern.test(json));
}

export function validateFutureForecastResult(result: unknown): FutureForecastValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const schema = loadFutureForecastSchemaConfig();
  if (!isRecord(result)) return { valid: false, errors: ["FutureForecastResult must be an object."], warnings };

  for (const field of schema.required) {
    if (!(field in result)) errors.push(`Missing required field: ${field}`);
  }

  if (result.schema_version !== "stage6.v1") errors.push("schema_version must be stage6.v1.");
  for (const key of ["forecast_result_id", "generated_at", "current_date", "executive_summary"]) {
    if (typeof result[key] !== "string" || result[key].length === 0) errors.push(`${key} is required.`);
  }
  if (!allowedStage6Horizons().includes(result.forecast_horizon as FutureForecastResult["forecast_horizon"])) errors.push("forecast_horizon is invalid.");

  if (!Array.isArray(result.domain_forecasts) || result.domain_forecasts.length === 0) {
    errors.push("domain_forecasts must be a non-empty array.");
  } else {
    for (const [index, forecast] of result.domain_forecasts.entries()) {
      if (!isRecord(forecast)) {
        errors.push(`domain_forecasts[${index}] must be an object.`);
        continue;
      }
      if (!allowedStage6Domains().includes(forecast.domain as Stage6ForecastDomain)) errors.push(`domain_forecasts[${index}].domain is invalid.`);
      if (!isNumber01(forecast.confidence)) errors.push(`domain_forecasts[${index}].confidence must be 0-1.`);
      for (const key of ["derivative_basis", "initial_value_basis", "time_windows", "caveats"]) {
        if (!Array.isArray(forecast[key])) errors.push(`domain_forecasts[${index}].${key} must be an array.`);
      }
      for (const key of ["conclusion", "forecast"]) {
        if (typeof forecast[key] !== "string" || forecast[key].length === 0) errors.push(`domain_forecasts[${index}].${key} is required.`);
      }
    }
  }

  for (const key of ["timeline_windows", "opportunity_windows", "risk_windows", "recommended_actions", "uncertainty", "known_facts_used", "derivative_signals_used", "initial_value_adjustments"]) {
    if (!Array.isArray(result[key])) errors.push(`${key} must be an array.`);
  }

  const policy = result.policy;
  if (!isRecord(policy)) {
    errors.push("policy must be an object.");
  } else {
    if (!["mock", "openai", "mock_fallback"].includes(String(policy.provider))) errors.push("policy.provider is invalid.");
    if (typeof policy.ai_used_for_forecast !== "boolean") errors.push("policy.ai_used_for_forecast must be boolean.");
    for (const key of ["ai_used_for_ranking", "ai_used_for_rectification", "ranking_modified", "rectification_modified", "selected_chart_modified", "secrets_included"]) {
      if (policy[key] !== false) errors.push(`policy.${key} must be false.`);
    }
    if (policy.output_schema_validated !== true) errors.push("policy.output_schema_validated must be true.");
  }

  if (hasSecrets(result)) errors.push("FutureForecastResult must not include secrets.");
  return { valid: errors.length === 0, errors, warnings };
}

export function assertValidFutureForecastResult(result: FutureForecastResult): FutureForecastResult {
  const validation = validateFutureForecastResult(result);
  if (!validation.valid) throw new Error(`Invalid FutureForecastResult: ${validation.errors.join("; ")}`);
  return result;
}
