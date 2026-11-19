import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { assertQuestionBank, assertScoringConfig } from "./configValidation.ts";
import type { QuestionBank, ScoringConfig } from "./types.ts";
import type { PredictionDomainsConfig, PredictionOutputSchemaConfig, PredictionProviderPolicyConfig } from "./predictionTypes.ts";
import type { ForecastDomainMappingConfig, ForecastHorizonsConfig, ForecastInputPolicyConfig } from "./forecastInputTypes.ts";
import type {
  FutureForecastDomainPolicyConfig,
  FutureForecastPromptPolicyConfig,
  FutureForecastSafetyPolicyConfig,
  FutureForecastSchemaConfig
} from "./futureForecastTypes.ts";

function readJson<T>(relativePath: string): T {
  const url = new URL(relativePath, import.meta.url);
  return JSON.parse(readFileSync(fileURLToPath(url), "utf8")) as T;
}

export function loadQuestionBank(): QuestionBank {
  return assertQuestionBank(readJson<unknown>("../configs/question_bank.json"));
}

export function loadScoringConfig(): ScoringConfig {
  return assertScoringConfig(readJson<unknown>("../configs/scoring_weights.json"));
}

export function loadPredictionDomainsConfig(): PredictionDomainsConfig {
  return readJson<PredictionDomainsConfig>("../configs/prediction_domains.json");
}

export function loadPredictionOutputSchemaConfig(): PredictionOutputSchemaConfig {
  return readJson<PredictionOutputSchemaConfig>("../configs/prediction_output_schema.json");
}

export function loadPredictionProviderPolicyConfig(): PredictionProviderPolicyConfig {
  return readJson<PredictionProviderPolicyConfig>("../configs/prediction_provider_policy.json");
}

export function loadForecastHorizonsConfig(): ForecastHorizonsConfig {
  return readJson<ForecastHorizonsConfig>("../configs/forecast_horizons.json");
}

export function loadForecastDomainMappingConfig(): ForecastDomainMappingConfig {
  return readJson<ForecastDomainMappingConfig>("../configs/forecast_domain_mapping.json");
}

export function loadForecastInputPolicyConfig(): ForecastInputPolicyConfig {
  return readJson<ForecastInputPolicyConfig>("../configs/forecast_input_policy.json");
}

export function loadFutureForecastSchemaConfig(): FutureForecastSchemaConfig {
  return readJson<FutureForecastSchemaConfig>("../configs/future_forecast_schema.json");
}

export function loadFutureForecastDomainPolicyConfig(): FutureForecastDomainPolicyConfig {
  return readJson<FutureForecastDomainPolicyConfig>("../configs/forecast_domain_policy.json");
}

export function loadFutureForecastPromptPolicyConfig(): FutureForecastPromptPolicyConfig {
  return readJson<FutureForecastPromptPolicyConfig>("../configs/forecast_prompt_policy.json");
}

export function loadFutureForecastSafetyPolicyConfig(): FutureForecastSafetyPolicyConfig {
  return readJson<FutureForecastSafetyPolicyConfig>("../configs/forecast_safety_policy.json");
}
