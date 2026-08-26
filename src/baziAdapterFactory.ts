import { StaticBaziAdapter } from "./staticBaziAdapter.ts";
import type { BaziAdapterPolicy, BaziEngineAdapter } from "./baziTypes.ts";

export const DEFAULT_BAZI_ADAPTER_POLICY: BaziAdapterPolicy = {
  default_adapter_priority: ["static-adapter"],
  fallback_required: true,
  allow_external_dependency_install: false,
  allowed_external_dependencies: [],
  forbidden_dependencies: ["langchain", "llamaindex", "@ai-sdk", "openai", "@anthropic-ai/sdk"],
  adapter_must_not: [
    "modify_ranking",
    "read_context_box",
    "call_ai_provider",
    "read_api_keys",
    "make_network_requests",
    "select_final_chart",
    "forecast_future"
  ],
  required_output_shape: "configs/bazi_derived_profile.schema.stage5b.json"
};

export function getStaticBaziAdapter(): StaticBaziAdapter {
  return new StaticBaziAdapter();
}

export async function getBaziEngineAdapter(_policy: BaziAdapterPolicy = DEFAULT_BAZI_ADAPTER_POLICY): Promise<BaziEngineAdapter> {
  return new StaticBaziAdapter();
}
