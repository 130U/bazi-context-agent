import { loadForecastDomainMappingConfig, loadForecastHorizonsConfig, loadForecastInputPolicyConfig } from "./config.ts";
import type {
  ForecastContextFact,
  ForecastDataProvenance,
  ForecastDomain,
  ForecastInput,
  ForecastInputBuildRequest,
  ForecastKnownLifeEvent,
  ForecastSelectedChart
} from "./forecastInputTypes.ts";

export class ForecastInputBuildError extends Error {
  code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = "ForecastInputBuildError";
    this.code = code;
  }
}

function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function text(value: unknown, fallback = ""): string {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : fallback;
}

function normalizeConfidence(value: unknown, fallback = 0.5): number {
  return typeof value === "number" && Number.isFinite(value) ? Math.max(0, Math.min(1, value)) : fallback;
}

function ensureCurrentDate(value: unknown): string {
  const candidate = text(value);
  if (!candidate) return todayIsoDate();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(candidate)) throw new ForecastInputBuildError("INVALID_CURRENT_DATE", "current_date must be YYYY-MM-DD.");
  return candidate;
}

function normalizeContextFact(value: unknown, index: number): ForecastContextFact {
  const record = isRecord(value) ? value : { value };
  const field = text(record.field, text(record.id, `context_${index + 1}`));
  return {
    fact_id: text(record.fact_id, text(record.id, `context_${index + 1}`)),
    category: text(record.category, "context"),
    field,
    value: record.value ?? "",
    source: text(record.source, "context_box"),
    confidence: normalizeConfidence(record.confidence),
    fact_type: text(record.fact_type, text(record.factType, "unknown")) as ForecastContextFact["fact_type"]
  };
}

function normalizeLifeEvent(value: unknown, index: number): ForecastKnownLifeEvent {
  const record = isRecord(value) ? value : {};
  return {
    event_id: text(record.event_id, text(record.id, `event_${index + 1}`)),
    year: Number(record.year),
    event_type: text(record.event_type, text(record.type, "unknown")),
    description: typeof record.description === "string" ? record.description : undefined,
    confidence: typeof record.confidence === "number" ? normalizeConfidence(record.confidence) : undefined
  };
}

function inferDomains(question: string): ForecastDomain[] {
  const config = loadForecastDomainMappingConfig();
  const lowerQuestion = question.toLowerCase();
  const found = config.allowed_domains.filter((domain) => {
    const keywords = config.keyword_mapping[domain] ?? [];
    return keywords.some((keyword) => lowerQuestion.includes(keyword.toLowerCase()));
  });
  return found.length > 0 ? found : config.default_domains;
}

function normalizeDomains(question: string, domains: unknown): ForecastDomain[] {
  const config = loadForecastDomainMappingConfig();
  const requested = Array.isArray(domains) ? domains.map((item) => text(item)).filter(Boolean) : [];
  const values = requested.length > 0 ? requested : inferDomains(question);
  const invalid = values.filter((domain) => !config.allowed_domains.includes(domain as ForecastDomain));
  if (invalid.length > 0) throw new ForecastInputBuildError("INVALID_FORECAST_DOMAIN", `Invalid forecast_domain: ${invalid.join(", ")}`);
  return Array.from(new Set(values)) as ForecastDomain[];
}

function normalizeHorizon(value: unknown) {
  const config = loadForecastHorizonsConfig();
  const horizon = text(value, config.default_horizon);
  if (!config.allowed_horizons.some((entry) => entry.id === horizon)) {
    throw new ForecastInputBuildError("INVALID_FORECAST_HORIZON", `Invalid forecast_horizon: ${horizon}`);
  }
  return horizon as ForecastInput["forecast_request"]["forecast_horizon"];
}

function selectionSource(selectedChart: ForecastSelectedChart, rectificationResult: Record<string, unknown> | undefined): "default_chart" | "rectification_v2" {
  if (selectedChart.selection_source === "default_chart" || selectedChart.selection_source === "rectification_v2") return selectedChart.selection_source;
  return text(rectificationResult?.selected_chart_id) === selectedChart.chart_id && text(rectificationResult?.selected_chart_role) === "candidate"
    ? "rectification_v2"
    : "default_chart";
}

function rectificationConfidence(selectedChart: ForecastSelectedChart, rectificationResult: Record<string, unknown> | undefined): number {
  if (!rectificationResult || !Array.isArray(rectificationResult.scores)) return normalizeConfidence(selectedChart.confidence);
  const match = rectificationResult.scores.find((score) => isRecord(score) && text(score.candidate_id) === selectedChart.chart_id);
  return isRecord(match) ? normalizeConfidence(match.confidence, normalizeConfidence(selectedChart.confidence)) : normalizeConfidence(selectedChart.confidence);
}

function defaultChartProtected(rectificationResult: Record<string, unknown> | undefined): boolean {
  const protection = rectificationResult?.default_chart_protection;
  if (isRecord(protection)) {
    if (typeof protection.default_chart_protected === "boolean") return protection.default_chart_protected;
    if (typeof protection.override_allowed === "boolean") return !protection.override_allowed;
  }
  const recommendation = text(rectificationResult?.recommendation);
  return recommendation !== "candidate_preferred";
}

function objectFromMaybe(value: unknown): Record<string, unknown> {
  return isRecord(value) ? clone(value) : {};
}

function resourceBaseline(contextFacts: ForecastContextFact[]): Record<string, unknown> {
  const baseline: Record<string, unknown> = {};
  for (const fact of contextFacts) {
    if (fact.category === "family" || fact.category === "resource" || fact.field.includes("support")) baseline[fact.field] = fact.value;
  }
  return baseline;
}

function preferenceProfile(contextFacts: ForecastContextFact[], explicitPreferences: unknown): Record<string, unknown> {
  const profile = objectFromMaybe(explicitPreferences);
  for (const fact of contextFacts) {
    const haystack = `${fact.category} ${fact.field}`.toLowerCase();
    if (haystack.includes("preference") || haystack.includes("prefer") || haystack.includes("desired") || haystack.includes("inner")) {
      profile[fact.field] = fact.value;
    }
  }
  return profile;
}

function provenance(request: {
  selectedChart: ForecastSelectedChart;
  derivativeProfileId: string;
  rectificationResult?: Record<string, unknown>;
  contextFacts: ForecastContextFact[];
  lifeEvents: ForecastKnownLifeEvent[];
  currentDateFromRequest: boolean;
}): ForecastDataProvenance[] {
  return [
    {
      field_path: "selected_chart",
      source: "selected_chart",
      source_id: request.selectedChart.chart_id,
      confidence: normalizeConfidence(request.selectedChart.confidence),
      fact_type: "rectification_metadata"
    },
    {
      field_path: "derivative_function",
      source: "bazi_derived_profile",
      source_id: request.derivativeProfileId,
      fact_type: "derived_chart_signal"
    },
    {
      field_path: "rectification_summary",
      source: "rectification_result",
      source_id: text(request.rectificationResult?.selected_chart_id),
      fact_type: "rectification_metadata"
    },
    {
      field_path: "forecast_request.user_question",
      source: "request",
      fact_type: "user_question"
    },
    {
      field_path: "current_date",
      source: request.currentDateFromRequest ? "request" : "system_current_date",
      fact_type: "system_metadata"
    },
    ...request.contextFacts.map((fact) => ({
      field_path: "initial_value.context_facts",
      source: "context_box" as const,
      source_id: fact.fact_id,
      confidence: fact.confidence,
      fact_type: "initial_value" as const
    })),
    ...request.lifeEvents.map((event) => ({
      field_path: "initial_value.known_life_events",
      source: "known_life_events" as const,
      source_id: event.event_id,
      confidence: event.confidence,
      fact_type: "initial_value" as const
    }))
  ];
}

export function buildForecastInput(request: ForecastInputBuildRequest): ForecastInput {
  loadForecastInputPolicyConfig();
  if (!request.selected_chart) throw new ForecastInputBuildError("MISSING_SELECTED_CHART", "ForecastInput requires selected_chart.");
  if (!request.derivative_profile) throw new ForecastInputBuildError("MISSING_DERIVATIVE_PROFILE", "ForecastInput requires derivative_profile.");
  const userQuestion = text(request.user_question);
  if (!userQuestion) throw new ForecastInputBuildError("MISSING_USER_QUESTION", "ForecastInput requires user_question.");

  const selectedChart = clone(request.selected_chart);
  const derivativeProfile = clone(request.derivative_profile);
  const rectificationResult = request.rectification_result && isRecord(request.rectification_result) ? clone(request.rectification_result) : undefined;
  const contextFacts = Array.isArray(request.context_box) ? request.context_box.map(normalizeContextFact) : [];
  const knownLifeEvents = Array.isArray(request.known_life_events)
    ? request.known_life_events.map(normalizeLifeEvent).filter((event) => Number.isInteger(event.year))
    : [];
  const currentDate = ensureCurrentDate(request.current_date);
  const selection_source = selectionSource(selectedChart, rectificationResult);

  return {
    forecast_input_id: `forecast_input_${selectedChart.chart_id}_${currentDate.replaceAll("-", "")}`,
    schema_version: "stage5e.v1",
    current_date: currentDate,
    ...(request.timezone ? { timezone: request.timezone } : {}),
    forecast_request: {
      user_question: userQuestion,
      forecast_horizon: normalizeHorizon(request.forecast_horizon),
      forecast_domains: normalizeDomains(userQuestion, request.forecast_domains)
    },
    selected_chart: {
      ...selectedChart,
      selection_source
    },
    derivative_function: derivativeProfile,
    initial_value: {
      context_facts: contextFacts,
      known_life_events: knownLifeEvents,
      ...(typeof request.current_state === "string" ? { current_state_summary: request.current_state } : {}),
      resource_baseline: resourceBaseline(contextFacts),
      preference_profile: preferenceProfile(contextFacts, request.preferences),
      warnings: []
    },
    rectification_summary: {
      recommendation: text(rectificationResult?.recommendation, "unknown"),
      confidence: rectificationConfidence(selectedChart, rectificationResult),
      selected_chart_id: text(rectificationResult?.selected_chart_id, selectedChart.chart_id),
      default_chart_protected: defaultChartProtected(rectificationResult),
      context_box_used_for_rectification: false,
      ai_used_for_rectification: false
    },
    data_provenance: provenance({
      selectedChart,
      derivativeProfileId: derivativeProfile.profile_id,
      rectificationResult,
      contextFacts,
      lifeEvents: knownLifeEvents,
      currentDateFromRequest: Boolean(request.current_date)
    }),
    boundaries: {
      ai_used_to_build_forecast_input: false,
      ai_allowed_in_stage6_forecast: true,
      ranking_modified: false,
      rectification_modified: false,
      context_box_used_for_rectification: false,
      secrets_included: false
    },
    warnings: [
      "Stage 5E builds forecast input only; it does not generate future predictions.",
      "Known facts are packaged as initial_value, not as prediction output."
    ]
  };
}
