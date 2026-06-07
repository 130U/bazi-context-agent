import { LunarJavascriptAdapter } from "./lunarJavascriptAdapter.ts";
import { StaticBaziAdapter } from "./staticBaziAdapter.ts";
import type { BaziAdapterPolicy, BaziEngineAdapter } from "./baziTypes.ts";

export const DEFAULT_BAZI_ADAPTER_POLICY: BaziAdapterPolicy = {
  default_adapter_priority: ["lunar-javascript", "static-adapter"],
  fallback_required: true,
  allow_external_dependency_install: true,
  allowed_external_dependencies: ["lunar-javascript"],
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

export function getStaticBaziAdapter(): BaziEngineAdapter {
  return new StaticBaziAdapter();
}

export async function getBaziEngineAdapter(policy: BaziAdapterPolicy = DEFAULT_BAZI_ADAPTER_POLICY): Promise<BaziEngineAdapter> {
  if (policy.default_adapter_priority.includes("lunar-javascript")) {
    const lunar = new LunarJavascriptAdapter();
    if (await lunar.isAvailable()) return lunar;
  }
  return new StaticBaziAdapter();
}
