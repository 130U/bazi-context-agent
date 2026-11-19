import { loadPredictionProviderPolicyConfig } from "./config.ts";
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
  const policy = loadPredictionProviderPolicyConfig();
  const providerEnv = policy.env.provider;
  const keyEnv = policy.env.api_key;
  const modelEnv = policy.env.model;
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
