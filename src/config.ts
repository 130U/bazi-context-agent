import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import type { QuestionBank, ScoringConfig } from "./types.ts";
import type { PredictionDomainsConfig, PredictionOutputSchemaConfig, PredictionProviderPolicyConfig } from "./predictionTypes.ts";

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
