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

function domainMatch(profile: BaziDerivedProfile | undefined, annual: Record<string, unknown> | null, domains: string[]): { score: number; matched: string[]; missing: string[] } {
  const candidateSignals = new Set([
    ...valuesFrom(annual?.domains),
    ...valuesFrom(annual?.signals),
    ...valuesFrom(profile?.ten_gods),
    ...valuesFrom(profile?.stars),
    ...valuesFrom(profile?.shensha)
  ]);
  const normalizedDomains = domains.map((item) => item.toLowerCase());
  const matched = normalizedDomains.filter((domain) => candidateSignals.has(domain));
  if (!annual && candidateSignals.size === 0) return { score: 0.12, matched, missing: ["annual_fortunes", "domain_signals"] };
  return {
    score: domains.length > 0 ? Math.min(0.4, (matched.length / Math.max(domains.length, 1)) * 0.4) : 0.12,
    matched,
    missing: annual ? [] : ["annual_fortunes"]
  };
}

function timingMatch(profile: BaziDerivedProfile | undefined, event: RectificationLifeEvent): { score: number; matched: string[]; contradictions: string[] } {
  const branch = hourBranch(profile);
  if (!branch) return { score: 0.08, matched: [], contradictions: [] };
  const yearBranch = getYearBranch(event.year);
  const relations = getBranchRelations(branch, yearBranch);
  const type = eventType(event);
  const changeEvent = ["migration", "career", "health", "family", "worst_year", "major_turning_point"].includes(type);
  const flowEvent = ["education", "best_year", "relationship"].includes(type);
  const relationSet = new Set(relations);
  let score = 0.1;
  if (changeEvent && (relationSet.has("clash") || relationSet.has("harm"))) score = 0.25;
  else if (flowEvent && (relationSet.has("six_harmony") || relationSet.has("triad_same_group") || relationSet.has("same_branch"))) score = 0.24;
  else if (relations.length > 0) score = 0.16;
  const contradictions = relations.length === 0 && event.importance === "high" ? ["weak_hour_year_relation_for_high_importance_event"] : [];
  return { score, matched: relations, contradictions };
}

function intensityScore(annual: Record<string, unknown> | null, event: RectificationLifeEvent, importanceLevel: RectificationEventImportance): number {
  const intensity = typeof annual?.intensity === "number" ? annual.intensity : null;
  if (intensity === null) return importanceLevel === "high" ? 0.08 : 0.12;
  if (importanceLevel === "high") return intensity >= 0.65 ? 0.2 : 0.08;
  if (importanceLevel === "medium") return intensity >= 0.35 ? 0.17 : 0.09;
  return 0.12;
}

export function scoreEventTimingFit(chart: ChartLike, events: RectificationLifeEvent[], profile = chart.derived_profile, config = loadEventTypeScoringConfig()): EventTimingFitResult {
  const candidate_id = chartId(chart);
  const warnings: string[] = ["Stage 5D EventTimingFit is deterministic v2 scoring, not full metaphysical precision."];
  const missing = new Set<string>();
  if (!profile) missing.add("BaziDerivedProfile");
  if (!Array.isArray(profile?.annual_fortunes) || profile.annual_fortunes.length === 0) missing.add("annual_fortunes");
  if (!Array.isArray(profile?.luck_cycles) || profile.luck_cycles.length === 0) missing.add("luck_cycles");
  if (!profile?.relations) missing.add("relations");

  if (events.length === 0) {
    return {
      candidate_id,
      event_scores: [],
      event_timing_fit: 0.5,
      matched_rules: ["No dated life events supplied; neutral timing score."],
      contradictions: [],
      missing_information: ["life_events"],
      warnings,
      high_importance_matches: 0,
      confidence: 0.25
    };
  }

  const contradictions: RectificationContradiction[] = [];
  const event_scores = events.map((event, index) => {
    const type = eventType(event);
    const typeConfig = config.event_types[type] ?? config.event_types.major_turning_point;
    const annual = annualFortuneForYear(profile, event.year);
    const importanceLevel = importance(event, type, config);
    const domain = domainMatch(profile, annual, typeConfig?.domains ?? []);
    const timing = timingMatch(profile, event);
    const intensity = intensityScore(annual, event, importanceLevel);
    const genericChange = annual ? 0.12 : 0.05;
    for (const item of domain.missing) missing.add(item);
    const eventContradictions = [...timing.contradictions];
    if (domain.score <= 0.05 && importanceLevel === "high") eventContradictions.push("weak_domain_match_for_high_importance_event");
    const fit_score = clampScore(domain.score + timing.score + intensity + genericChange);
    const id = eventId(event, index);
    if (eventContradictions.length > 0) {
      contradictions.push({
        candidate_id,
        event_id: id,
        severity: importanceLevel === "high" ? "high" : "medium",
        description: eventContradictions.join("; "),
        penalty: importanceLevel === "high" ? 0.05 : 0.03
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

  const weight = event_scores.reduce((sum, item) => sum + (item.importance === "high" ? 1.25 : item.importance === "medium" ? 1 : 0.75), 0);
  const weighted = event_scores.reduce((sum, item) => sum + item.fit_score * (item.importance === "high" ? 1.25 : item.importance === "medium" ? 1 : 0.75), 0);
  const high_importance_matches = event_scores.filter((item) => item.importance === "high" && item.fit_score >= 0.62).length;
  const confidence = clampScore(Math.max(0.2, Math.min(0.95, 0.35 + events.length * 0.1 - missing.size * 0.04)));

  return {
    candidate_id,
    event_scores,
    event_timing_fit: clampScore(weighted / Math.max(weight, 1)),
    matched_rules: event_scores.flatMap((item) => item.matched_rules.map((rule) => `${item.event_id}:${rule}`)),
    contradictions,
    missing_information: [...missing],
    warnings,
    high_importance_matches,
    confidence
  };
}
