import { mockPredictionProvider } from "./mockPredictionProvider.ts";
import { createOpenAiPredictionProvider, type OpenAiChatClient } from "./openaiPredictionProvider.ts";
import { getPredictionProviderConfig, type PredictionProviderEnv } from "./predictionProviderConfig.ts";
import { assertRankingSnapshotUnchanged, cloneRankingSnapshot } from "./predictionPolicy.ts";
import { validatePredictionResult } from "./predictionResultValidator.ts";
import type { PredictionRequest, PredictionResult } from "./predictionTypes.ts";

export interface RunPredictionOptions {
  env?: PredictionProviderEnv;
  openAiClient?: OpenAiChatClient;
}

export interface RunPredictionResult {
  result?: PredictionResult;
  error?: {
    code: "PROVIDER_CONFIG_ERROR" | "PROVIDER_OUTPUT_INVALID";
    message: string;
  };
}

export async function runPredictionWithConfiguredProvider(request: PredictionRequest, options: RunPredictionOptions = {}): Promise<RunPredictionResult> {
  const config = getPredictionProviderConfig(options.env);
  if (config.configError) return { error: config.configError };
  const before = cloneRankingSnapshot(request.rankingSnapshot);
  const provider = config.provider === "openai"
    ? createOpenAiPredictionProvider({ apiKey: config.apiKey ?? "", model: config.model, client: options.openAiClient })
    : mockPredictionProvider;
  try {
    const raw = await provider.predict(request);
    assertRankingSnapshotUnchanged(before, request.rankingSnapshot);
    const result = validatePredictionResult(raw, provider.id);
    assertRankingSnapshotUnchanged(before, request.rankingSnapshot);
    return { result };
  } catch (caught) {
    const message = caught instanceof Error ? caught.message : "Invalid prediction provider output.";
    if (message.startsWith("invalid_prediction_output:")) {
      return { error: { code: "PROVIDER_OUTPUT_INVALID", message } };
    }
    throw caught;
  }
}
