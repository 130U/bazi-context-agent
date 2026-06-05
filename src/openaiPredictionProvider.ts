import { buildPredictionProviderInput } from "./predictionPromptBuilder.ts";
import { mockPredictionPolicy } from "./predictionPolicy.ts";
import type { PredictionProvider, PredictionRequest, PredictionResult } from "./predictionTypes.ts";

export interface OpenAiChatMessage {
  role: "system" | "user";
  content: string;
}

export interface OpenAiChatRequest {
  model: string;
  messages: OpenAiChatMessage[];
  response_format: { type: "json_object" };
}

export type OpenAiChatClient = (request: OpenAiChatRequest, apiKey: string) => Promise<unknown>;

export interface OpenAiPredictionProviderOptions {
  apiKey: string;
  model: string;
  client?: OpenAiChatClient;
}

function extractJson(payload: unknown): unknown {
  if (payload && typeof payload === "object" && "choices" in payload) {
    const choice = (payload as { choices?: Array<{ message?: { content?: string } }> }).choices?.[0];
    const content = choice?.message?.content;
    if (typeof content === "string") return JSON.parse(content) as unknown;
  }
  return payload;
}

async function defaultOpenAiChatClient(request: OpenAiChatRequest, apiKey: string): Promise<unknown> {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify(request)
  });
  if (!response.ok) throw new Error(`openai_provider_error:${response.status}`);
  return response.json() as Promise<unknown>;
}

export function createOpenAiPredictionProvider(options: OpenAiPredictionProviderOptions): PredictionProvider {
  return {
    id: "openai",
    async predict(request: PredictionRequest): Promise<PredictionResult> {
      const input = buildPredictionProviderInput(request);
      const payload = {
        question: request.question,
        domain: request.domain ?? "general",
        ranking_snapshot: request.rankingSnapshot,
        known_facts: input.knownFacts,
        chart_signals: input.chartSignals,
        context_adjustments: input.contextAdjustments,
        life_events: request.lifeEvents,
        policy: mockPredictionPolicy("openai")
      };
      const raw = await (options.client ?? defaultOpenAiChatClient)({
        model: options.model,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content: "Return only JSON matching the PredictionResult schema. Do not alter ranking snapshot, candidate ids, scores, or confidence."
          },
          {
            role: "user",
            content: JSON.stringify(payload)
          }
        ]
      }, options.apiKey);
      return extractJson(raw) as PredictionResult;
    }
  };
}
