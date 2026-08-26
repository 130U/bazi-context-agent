import { getBranchRelations, getYearBranch } from "./branchRelations.ts";
import { clampScore, loadEventTypeScoringConfig } from "./rectificationConfig.ts";
import type { BaziDerivedProfile, CandidateChartV2, DefaultChart } from "./baziTypes.ts";
import type { EarthlyBranch } from "./types.ts";
import type { EventTimingFitResult, EventTypeScoringConfig, RectificationContradiction, RectificationEventImportance, RectificationLifeEvent } from "./rectificationTypes.ts";

type ChartLike = DefaultChart | CandidateChartV2;

const CHINESE_TO_BRANCH: Record<string, EarthlyBranch> = {
  "子": "Zi",
  "丑": "Chou",
  "寅": "Yin",
  "卯": "Mao",
  "辰": "Chen",
  "巳": "Si",
  "午": "Wu",
  "未": "Wei",
  "申": "Shen",
  "酉": "You",
  "戌": "Xu",
  "亥": "Hai"
};

function chartId(chart: ChartLike): string {
  return "chart_role" in chart && chart.chart_role === "default" ? chart.chart_id : (chart as CandidateChartV2).candidate_id;
}

function eventId(event: RectificationLifeEvent, index: number): string {
  return event.event_id ?? `event_${event.year}_${event.event_type ?? event.type ?? "unknown"}_${index + 1}`;
}

function eventType(event: RectificationLifeEvent): string {
  const raw = event.event_type ?? event.type ?? "major_turning_point";
  if (raw === "major_turning") return "major_turning_point";
  if (raw === "health_accident" || raw === "health_or_accident") return "health";
  if (raw === "family_change") return "family";
  if (raw === "career_transition") return "career";
  if (raw === "best") return "best_year";
  if (raw === "worst") return "worst_year";
  return raw;
}

function importance(event: RectificationLifeEvent, type: string, config: EventTypeScoringConfig): RectificationEventImportance {
  return event.importance ?? config.event_types[type]?.importance_default ?? "medium";
}

function valuesFrom(value: unknown): string[] {
  if (Array.isArray(value)) return value.flatMap(valuesFrom);
  if (typeof value === "string") return [value.toLowerCase()];
  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    return [...valuesFrom(record.domains), ...valuesFrom(record.signals), ...valuesFrom(record.god), ...valuesFrom(record.star)];
  }
  return [];
}

function annualFortuneForYear(profile: BaziDerivedProfile | undefined, year: number): Record<string, unknown> | null {
  const annual = profile?.annual_fortunes;
  if (!Array.isArray(annual)) return null;
  return (annual.find((item) => Boolean(item) && typeof item === "object" && Number((item as Record<string, unknown>).year) === year) as Record<string, unknown> | undefined) ?? null;
}

function hourBranch(profile: BaziDerivedProfile | undefined): EarthlyBranch | null {
  const raw = profile?.pillars?.hour?.branch;
  if (!raw) return null;
  if ((["Zi", "Chou", "Yin", "Mao", "Chen", "Si", "Wu", "Wei", "Shen", "You", "Xu", "Hai"] as string[]).includes(raw)) return raw as EarthlyBranch;
  return CHINESE_TO_BRANCH[raw] ?? null;
}

function domainMatch(
  profile: BaziDerivedProfile | undefined,
  annual: Record<string, unknown> | null,
  domains: string[],
  parameters: Record<string, number>
): { score: number; matched: string[]; missing: string[] } {
  const candidateSignals = new Set([
    ...valuesFrom(annual?.domains),
    ...valuesFrom(annual?.signals),
    ...valuesFrom(profile?.ten_gods),
    ...valuesFrom(profile?.stars),
    ...valuesFrom(profile?.shensha)
  ]);
  const normalizedDomains = domains.map((item) => item.toLowerCase());
  const matched = normalizedDomains.filter((domain) => candidateSignals.has(domain));
  if (!annual && candidateSignals.size === 0) return { score: parameters.domain_missing_score, matched, missing: ["annual_fortunes", "domain_signals"] };
  return {
    score: domains.length > 0
      ? Math.min(configuredMaximum(parameters, "domain_signal_match"), (matched.length / Math.max(domains.length, 1)) * configuredMaximum(parameters, "domain_signal_match"))
      : parameters.domain_empty_score,
    matched,
    missing: annual ? [] : ["annual_fortunes"]
  };
}

function configuredMaximum(parameters: Record<string, number>, key: string): number {
  return parameters[`${key}_maximum`] ?? parameters.domain_empty_score;
}

function timingMatch(profile: BaziDerivedProfile | undefined, event: RectificationLifeEvent, parameters: Record<string, number>): { score: number; matched: string[]; contradictions: string[] } {
  const branch = hourBranch(profile);
  if (!branch) return { score: parameters.timing_missing_score, matched: [], contradictions: [] };
  const yearBranch = getYearBranch(event.year);
  const relations = getBranchRelations(branch, yearBranch);
  const type = eventType(event);
  const changeEvent = ["migration", "career", "health", "family", "worst_year", "major_turning_point"].includes(type);
  const flowEvent = ["education", "best_year", "relationship"].includes(type);
  const relationSet = new Set(relations);
  let score = parameters.timing_base_score;
  if (changeEvent && (relationSet.has("clash") || relationSet.has("harm"))) score = parameters.timing_change_match_score;
  else if (flowEvent && (relationSet.has("six_harmony") || relationSet.has("triad_same_group") || relationSet.has("same_branch"))) score = parameters.timing_flow_match_score;
  else if (relations.length > 0) score = parameters.timing_related_score;
  const contradictions = relations.length === 0 && event.importance === "high" ? ["weak_hour_year_relation_for_high_importance_event"] : [];
  return { score, matched: relations, contradictions };
}

function intensityScore(annual: Record<string, unknown> | null, importanceLevel: RectificationEventImportance, parameters: Record<string, number>): number {
  const intensity = typeof annual?.intensity === "number" ? annual.intensity : null;
  if (intensity === null) return importanceLevel === "high" ? parameters.intensity_missing_high_score : parameters.intensity_missing_other_score;
  if (importanceLevel === "high") return intensity >= parameters.intensity_high_threshold ? parameters.intensity_high_match_score : parameters.intensity_high_miss_score;
  if (importanceLevel === "medium") return intensity >= parameters.intensity_medium_threshold ? parameters.intensity_medium_match_score : parameters.intensity_medium_miss_score;
  return parameters.intensity_low_score;
}

export function scoreEventTimingFit(chart: ChartLike, events: RectificationLifeEvent[], profile = chart.derived_profile, config = loadEventTypeScoringConfig()): EventTimingFitResult {
  const candidate_id = chartId(chart);
  const parameters: Record<string, number> = {
    ...config.parameters,
    domain_signal_match_maximum: config.event_score_components.domain_signal_match.max
  };
  const warnings: string[] = ["Event timing fit uses deterministic heuristic scoring, not full metaphysical precision."];
  const missing = new Set<string>();
  if (!profile) missing.add("BaziDerivedProfile");
  if (!Array.isArray(profile?.annual_fortunes) || profile.annual_fortunes.length === 0) missing.add("annual_fortunes");
  if (!Array.isArray(profile?.luck_cycles) || profile.luck_cycles.length === 0) missing.add("luck_cycles");
  if (!profile?.relations) missing.add("relations");

  if (events.length === 0) {
    return {
      candidate_id,
      event_scores: [],
      event_timing_fit: parameters.neutral_event_score,
      matched_rules: ["No dated life events supplied; neutral timing score."],
      contradictions: [],
      missing_information: ["life_events"],
      warnings,
      high_importance_matches: 0,
      confidence: parameters.no_event_confidence
    };
  }

  const contradictions: RectificationContradiction[] = [];
  const event_scores = events.map((event, index) => {
    const type = eventType(event);
    const typeConfig = config.event_types[type] ?? config.event_types.major_turning_point;
    const annual = annualFortuneForYear(profile, event.year);
    const importanceLevel = importance(event, type, config);
    const domain = domainMatch(profile, annual, typeConfig?.domains ?? [], parameters);
    const timing = timingMatch(profile, event, parameters);
    const intensity = intensityScore(annual, importanceLevel, parameters);
    const genericChange = annual ? parameters.generic_annual_present_score : parameters.generic_annual_missing_score;
    for (const item of domain.missing) missing.add(item);
    const eventContradictions = [...timing.contradictions];
    if (domain.score <= parameters.domain_contradiction_threshold && importanceLevel === "high") eventContradictions.push("weak_domain_match_for_high_importance_event");
    const fit_score = clampScore(domain.score + timing.score + intensity + genericChange);
    const id = eventId(event, index);
    if (eventContradictions.length > 0) {
      contradictions.push({
        candidate_id,
        event_id: id,
        severity: importanceLevel === "high" ? "high" : "medium",
        description: eventContradictions.join("; "),
        penalty: importanceLevel === "high" ? parameters.high_importance_contradiction_penalty : parameters.other_contradiction_penalty
      });
    }
    return {
      event_id: id,
      year: event.year,
      event_type: type,
      fit_score,
      matched_rules: [
        ...domain.matched.map((item) => `domain:${item}`),
        ...timing.matched.map((item) => `relation:${item}`),
        annual ? "annual_fortune:present" : "annual_fortune:missing"
      ],
      missing_signals: domain.missing,
      contradictions: eventContradictions,
      importance: importanceLevel
    };
  });

  const importanceWeight = (level: RectificationEventImportance) => (
    level === "high" ? parameters.high_importance_multiplier
      : level === "medium" ? parameters.medium_importance_multiplier
        : parameters.low_importance_multiplier
  );
  const weight = event_scores.reduce((sum, item) => sum + importanceWeight(item.importance), 0);
  const weighted = event_scores.reduce((sum, item) => sum + item.fit_score * importanceWeight(item.importance), 0);
  const high_importance_matches = event_scores.filter((item) => item.importance === "high" && item.fit_score >= parameters.high_importance_match_threshold).length;
  const confidence = clampScore(Math.max(
    parameters.confidence_minimum,
    Math.min(
      parameters.confidence_maximum,
      parameters.confidence_base + events.length * parameters.confidence_per_event - missing.size * parameters.confidence_per_missing_signal
    )
  ));

  return {
    candidate_id,
    event_scores,
    event_timing_fit: clampScore(weighted / Math.max(weight, parameters.medium_importance_multiplier)),
    matched_rules: event_scores.flatMap((item) => item.matched_rules.map((rule) => `${item.event_id}:${rule}`)),
    contradictions,
    missing_information: [...missing],
    warnings,
    high_importance_matches,
    confidence
  };
}
