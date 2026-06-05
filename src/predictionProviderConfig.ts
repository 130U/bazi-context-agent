import { loadStage4BPredictionProviderPolicyConfig } from "./config.ts";
import type { PredictionProviderId } from "./predictionTypes.ts";

export const DEFAULT_OPENAI_MODEL = "gpt-4.1-mini";

export interface PredictionProviderEnv {
  PREDICTION_PROVIDER?: string;
  OPENAI_API_KEY?: string;
  OPENAI_MODEL?: string;
}

export interface PredictionProviderConfig {
  requestedProvider: PredictionProviderId;
  provider: PredictionProviderId;
  model: string;
  apiKey?: string;
  configError?: {
    code: "PROVIDER_CONFIG_ERROR";
    message: string;
  };
}

function normalizeProvider(value: string | undefined): PredictionProviderId {
  return value === "openai" ? "openai" : "mock";
}

export function getPredictionProviderConfig(env: PredictionProviderEnv = process.env): PredictionProviderConfig {
  const policy = loadStage4BPredictionProviderPolicyConfig();
  const providerEnv = policy.env?.provider ?? policy.provider_env ?? "PREDICTION_PROVIDER";
  const keyEnv = policy.env?.api_key ?? policy.api_key_env ?? "OPENAI_API_KEY";
  const modelEnv = policy.env?.model ?? policy.model_env ?? "OPENAI_MODEL";
  const requestedProvider = normalizeProvider(env[providerEnv as keyof PredictionProviderEnv]);
  const model = env[modelEnv as keyof PredictionProviderEnv] || DEFAULT_OPENAI_MODEL;
  const apiKey = env[keyEnv as keyof PredictionProviderEnv];

  if (requestedProvider === "openai" && !apiKey) {
    return {
      requestedProvider,
      provider: "mock",
      model,
      configError: {
        code: "PROVIDER_CONFIG_ERROR",
        message: "PREDICTION_PROVIDER=openai requires server-side OPENAI_API_KEY."
      }
    };
  }

  return {
    requestedProvider,
    provider: requestedProvider,
    model,
    apiKey
  };
}
