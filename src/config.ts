import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import type { QuestionBank, ScoringConfig } from "./types.ts";
import type { PredictionDomainsConfig, PredictionOutputSchemaConfig, PredictionProviderPolicyConfig } from "./predictionTypes.ts";
import type { ForecastDomainMappingConfig, ForecastHorizonsConfig, ForecastInputPolicyConfig } from "./forecastInputTypes.ts";
import type {
  FutureForecastDomainPolicyConfig,
  FutureForecastPromptPolicyConfig,
  FutureForecastSafetyPolicyConfig,
  FutureForecastSchemaConfig,
  FutureForecastTimeWindowPolicyConfig
} from "./futureForecastTypes.ts";

function readJson<T>(relativePath: string): T {
  const url = new URL(relativePath, import.meta.url);
  return JSON.parse(readFileSync(fileURLToPath(url), "utf8")) as T;
}

export function loadQuestionBank(): QuestionBank {
  return readJson<QuestionBank>("../configs/question_bank.v1.json");
}

export function loadScoringConfig(): ScoringConfig {
  return readJson<ScoringConfig>("../configs/scoring_weights.v1.json");
}

export const loadScoringWeights = loadScoringConfig;

export function loadPredictionDomainsConfig(): PredictionDomainsConfig {
  return readJson<PredictionDomainsConfig>("../configs/prediction_domains.v1.json");
}

export function loadPredictionOutputSchemaConfig(): PredictionOutputSchemaConfig {
  return readJson<PredictionOutputSchemaConfig>("../configs/prediction_output_schema.v1.json");
}

export function loadPredictionProviderPolicyConfig(): PredictionProviderPolicyConfig {
  return readJson<PredictionProviderPolicyConfig>("../configs/prediction_provider_policy.v1.json");
}

export function loadStage4BPredictionProviderPolicyConfig(): PredictionProviderPolicyConfig {
  return readJson<PredictionProviderPolicyConfig>("../configs/prediction_provider_policy.stage4b.json");
}

export function loadForecastHorizonsConfig(): ForecastHorizonsConfig {
  return readJson<ForecastHorizonsConfig>("../configs/forecast_horizons.stage5e.json");
}

export function loadForecastDomainMappingConfig(): ForecastDomainMappingConfig {
  return readJson<ForecastDomainMappingConfig>("../configs/forecast_domain_mapping.stage5e.json");
}

export function loadForecastInputPolicyConfig(): ForecastInputPolicyConfig {
  return readJson<ForecastInputPolicyConfig>("../configs/forecast_input_policy.stage5e.json");
}

export function loadFutureForecastSchemaConfig(): FutureForecastSchemaConfig {
  return readJson<FutureForecastSchemaConfig>("../configs/future_forecast_schema.stage6.json");
}

export function loadFutureForecastDomainPolicyConfig(): FutureForecastDomainPolicyConfig {
  return readJson<FutureForecastDomainPolicyConfig>("../configs/forecast_domain_policy.stage6.json");
}

export function loadFutureForecastPromptPolicyConfig(): FutureForecastPromptPolicyConfig {
  return readJson<FutureForecastPromptPolicyConfig>("../configs/forecast_prompt_policy.stage6.json");
}

export function loadFutureForecastSafetyPolicyConfig(): FutureForecastSafetyPolicyConfig {
  return readJson<FutureForecastSafetyPolicyConfig>("../configs/forecast_safety_policy.stage6.json");
}

export function loadFutureForecastTimeWindowPolicyConfig(): FutureForecastTimeWindowPolicyConfig {
  return readJson<FutureForecastTimeWindowPolicyConfig>("../configs/forecast_time_window_policy.stage6.json");
}
