import { loadFutureForecastDomainPolicyConfig, loadFutureForecastPromptPolicyConfig } from "./config.ts";
import type { ForecastContextFact, ForecastInput, ForecastKnownLifeEvent } from "./forecastInputTypes.ts";
import type {
  DerivativeSignalReference,
  FutureForecastPromptInput,
  InitialValueAdjustment,
  KnownFactReference,
  Stage6ForecastDomain,
  Stage6ForecastHorizon
} from "./futureForecastTypes.ts";

function text(value: unknown, fallback = ""): string {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : fallback;
}

function confidence(value: unknown, fallback = 0.5): number | undefined {
  return typeof value === "number" && Number.isFinite(value) ? Math.max(0, Math.min(1, value)) : fallback;
}

export function normalizeStage6Domains(input: ForecastInput): Stage6ForecastDomain[] {
  const policy = loadFutureForecastDomainPolicyConfig();
  const requested = input.forecast_request.forecast_domains.map((domain) => (domain === "personality" ? "personal_growth" : domain));
  const allowed = requested.filter((domain): domain is Stage6ForecastDomain => policy.domains.includes(domain as Stage6ForecastDomain));
  return allowed.length > 0 ? Array.from(new Set(allowed)) : policy.default_domains;
}

export function normalizeStage6Horizon(input: ForecastInput): Stage6ForecastHorizon {
  const horizon = input.forecast_request.forecast_horizon === "5_years" ? "3_years" : input.forecast_request.forecast_horizon;
  return horizon as Stage6ForecastHorizon;
}

function contextFactToKnownFact(fact: ForecastContextFact): KnownFactReference {
  return {
    fact: `${fact.category}.${fact.field}: ${String(fact.value)}`,
    source: "context_box",
    source_id: fact.fact_id,
    confidence: confidence(fact.confidence)
  };
}

function lifeEventToKnownFact(event: ForecastKnownLifeEvent): KnownFactReference {
  return {
    fact: `${event.year} ${event.event_type}${event.description ? `: ${event.description}` : ""}`,
    source: "known_life_events",
    source_id: event.event_id,
    confidence: confidence(event.confidence, 0.7)
  };
}

export function knownFactsFromForecastInput(input: ForecastInput): KnownFactReference[] {
  return [
    ...input.initial_value.context_facts.map(contextFactToKnownFact),
    ...input.initial_value.known_life_events.map(lifeEventToKnownFact)
  ];
}

export function derivativeSignalsFromForecastInput(input: ForecastInput): DerivativeSignalReference[] {
  const profile = input.derivative_function;
  const signals: DerivativeSignalReference[] = [
    {
      signal: `day_master=${profile.day_master}`,
      source: "BaziDerivedProfile",
      source_id: profile.profile_id,
      confidence: input.selected_chart.confidence
    },
    {
      signal: `calculation_mode=${profile.calculation_mode}`,
      source: "BaziDerivedProfile",
      source_id: profile.profile_id,
      confidence: input.selected_chart.confidence
    }
  ];
  if (profile.five_elements && Object.keys(profile.five_elements).length > 0) {
    signals.push({
      signal: `five_elements=${JSON.stringify(profile.five_elements)}`,
      source: "BaziDerivedProfile",
      source_id: profile.profile_id,
      confidence: input.selected_chart.confidence
    });
  }
  if (profile.warnings.length > 0) {
    signals.push({
      signal: `profile_warnings=${profile.warnings.join("; ")}`,
      source: "BaziDerivedProfile",
      source_id: profile.profile_id,
      confidence: 0.4
    });
  }
  return signals;
}

export function initialValueAdjustmentsFromForecastInput(input: ForecastInput): InitialValueAdjustment[] {
  const adjustments: InitialValueAdjustment[] = [];
  const preferences = Object.entries(input.initial_value.preference_profile ?? {});
  for (const [field, value] of preferences) {
    adjustments.push({
      adjustment: `Use stated preference ${field} as initial-value context, not as prediction.`,
      basis: [field, String(value)],
      confidence: 0.7
    });
  }
  if (input.initial_value.current_state_summary) {
    adjustments.push({
      adjustment: "Use current_state_summary as present baseline.",
      basis: [input.initial_value.current_state_summary],
      confidence: 0.7
    });
  }
  if (adjustments.length === 0 && input.initial_value.context_facts.length > 0) {
    adjustments.push({
      adjustment: "Use context_box facts as initial-value baseline.",
      basis: input.initial_value.context_facts.slice(0, 3).map((fact) => fact.field),
      confidence: 0.6
    });
  }
  return adjustments;
}

export function buildFutureForecastPromptInput(input: ForecastInput): FutureForecastPromptInput {
  const promptPolicy = loadFutureForecastPromptPolicyConfig();
  const domains = normalizeStage6Domains(input);
  return {
    task: "Generate a structured future forecast from ForecastInput. Do not recalculate chart, modify rectification, or present known facts as predictions.",
    current_date: input.current_date,
    forecast_horizon: normalizeStage6Horizon(input),
    selected_chart_summary: {
      chart_id: input.selected_chart.chart_id,
      chart_role: input.selected_chart.chart_role,
      confidence: input.selected_chart.confidence,
      selection_source: input.selected_chart.selection_source
    },
    derivative_signals: derivativeSignalsFromForecastInput(input),
    initial_value_facts: knownFactsFromForecastInput(input),
    initial_value_adjustments: initialValueAdjustmentsFromForecastInput(input),
    user_question: input.forecast_request.user_question,
    output_schema: "FutureForecastResult stage6.v1",
    policy_constraints: [
      `Must separate: ${promptPolicy.must_separate.join(", ")}`,
      `Forbidden claims: ${promptPolicy.forbidden_claims.join(", ")}`,
      `Style: ${promptPolicy.style.tone}; ${promptPolicy.style.format}`,
      `Supported domains: ${domains.join(", ")}`,
      "Do not provide medical, legal, or financial certainty.",
      "Keep known facts, derivative signals, initial value adjustments, and actual forecast separate."
    ]
  };
}
