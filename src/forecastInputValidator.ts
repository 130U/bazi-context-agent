import { loadForecastDomainMappingConfig, loadForecastHorizonsConfig } from "./config.ts";
import { containsSecretValue } from "./secretSafety.ts";
import type { ForecastDomain, ForecastInput, ForecastInputValidationResult } from "./forecastInputTypes.ts";

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function containsSecret(value: unknown): boolean {
  return containsSecretValue(value);
}

export function validateForecastInput(input: unknown): ForecastInputValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const horizonConfig = loadForecastHorizonsConfig();
  const domainConfig = loadForecastDomainMappingConfig();

  if (!isRecord(input)) {
    return { valid: false, errors: ["ForecastInput must be an object."], warnings };
  }

  for (const field of [
    "forecast_input_id",
    "schema_version",
    "current_date",
    "forecast_request",
    "selected_chart",
    "derivative_function",
    "initial_value",
    "rectification_summary",
    "data_provenance",
    "boundaries",
    "warnings"
  ]) {
    if (!(field in input)) errors.push(`Missing required field: ${field}`);
  }

  if (input.schema_version !== "stage5e.v1") errors.push("schema_version must be stage5e.v1.");
  if (typeof input.current_date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(input.current_date)) {
    errors.push("current_date must be YYYY-MM-DD.");
  }

  const forecastRequest = input.forecast_request;
  if (!isRecord(forecastRequest)) {
    errors.push("forecast_request must be an object.");
  } else {
    if (typeof forecastRequest.user_question !== "string" || forecastRequest.user_question.trim().length === 0) {
      errors.push("forecast_request.user_question is required.");
    }
    if (!horizonConfig.allowed_horizons.some((entry) => entry.id === forecastRequest.forecast_horizon)) {
      errors.push("forecast_request.forecast_horizon is invalid.");
    }
    if (!Array.isArray(forecastRequest.forecast_domains) || forecastRequest.forecast_domains.length === 0) {
      errors.push("forecast_request.forecast_domains must be a non-empty array.");
    } else {
      for (const domain of forecastRequest.forecast_domains) {
        if (!domainConfig.allowed_domains.includes(domain as ForecastDomain)) errors.push(`Invalid forecast domain: ${String(domain)}`);
      }
    }
  }

  const boundaries = input.boundaries;
  if (!isRecord(boundaries)) {
    errors.push("boundaries must be an object.");
  } else {
    const requiredBoundaries: Array<[string, boolean]> = [
      ["ai_used_to_build_forecast_input", false],
      ["ai_allowed_in_stage6_forecast", true],
      ["ranking_modified", false],
      ["rectification_modified", false],
      ["context_box_used_for_rectification", false],
      ["secrets_included", false]
    ];
    for (const [key, expected] of requiredBoundaries) {
      if (boundaries[key] !== expected) errors.push(`boundaries.${key} must be ${String(expected)}.`);
    }
  }

  if (containsSecret(input)) errors.push("ForecastInput must not include secrets or env contents.");
  if (!Array.isArray(input.data_provenance)) errors.push("data_provenance must be an array.");
  if (!Array.isArray(input.warnings)) errors.push("warnings must be an array.");

  return { valid: errors.length === 0, errors, warnings };
}

export function assertValidForecastInput(input: ForecastInput): ForecastInput {
  const result = validateForecastInput(input);
  if (!result.valid) throw new Error(`Invalid ForecastInput: ${result.errors.join("; ")}`);
  return input;
}
