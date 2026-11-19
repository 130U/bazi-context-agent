import { loadDefaultChartProtectionConfig } from "./rectificationConfig.ts";
import type { CandidateRectificationScore, DefaultChartProtectionConfig, DefaultChartProtectionResult } from "./rectificationTypes.ts";

export function applyDefaultChartProtection(
  scores: CandidateRectificationScore[],
  eventCount: number,
  config: DefaultChartProtectionConfig = loadDefaultChartProtectionConfig(),
  protectionEnabled = true
): DefaultChartProtectionResult {
  const sorted = [...scores].sort((a, b) => b.total_score - a.total_score);
  const defaultScore = scores.find((score) => score.chart_role === "default") ?? sorted[0];
  const topAlternative = sorted.find((score) => score.chart_role === "candidate");
  const defaultValue = defaultScore?.total_score ?? 0;
  const alternativeValue = topAlternative?.total_score;
  const lead = alternativeValue === undefined ? undefined : Number((alternativeValue - defaultValue).toFixed(4));
  const reasons: string[] = [];
  const minimumEvents = config.minimum_major_events_to_override_default;

  if (!protectionEnabled) {
    return {
      default_chart_id: defaultScore?.candidate_id ?? "unprotected_unknown_time",
      top_alternative_id: topAlternative?.candidate_id,
      default_score: defaultValue,
      top_alternative_score: alternativeValue,
      lead_over_default: lead,
      event_count: eventCount,
      minimum_events_required: minimumEvents,
      override_allowed: Boolean(topAlternative),
      recommendation: topAlternative ? "candidate_preferred" : "insufficient_evidence",
      reasons: [
        topAlternative
          ? "Recorded birth time is unknown; no arbitrary hour receives DefaultChart protection."
          : "Recorded birth time is unknown and no candidate is available."
      ]
    };
  }

  if (!defaultScore) {
    return {
      default_chart_id: "missing_default_chart",
      top_alternative_id: topAlternative?.candidate_id,
      default_score: 0,
      top_alternative_score: alternativeValue,
      lead_over_default: lead,
      event_count: eventCount,
      minimum_events_required: minimumEvents,
      override_allowed: false,
      recommendation: "insufficient_evidence",
      reasons: ["DefaultChart score is missing; cannot override safely."]
    };
  }

  if (eventCount < minimumEvents) {
    reasons.push(`Only ${eventCount} dated events supplied; minimum ${minimumEvents} required to override DefaultChart.`);
    return {
      default_chart_id: defaultScore.candidate_id,
      top_alternative_id: topAlternative?.candidate_id,
      default_score: defaultValue,
      top_alternative_score: alternativeValue,
      lead_over_default: lead,
      event_count: eventCount,
      minimum_events_required: minimumEvents,
      override_allowed: false,
      recommendation: "insufficient_evidence",
      reasons
    };
  }

  if (!topAlternative || lead === undefined || lead <= config.lead_thresholds.keep_default_if_lead_lte) {
    reasons.push("Top alternative does not lead DefaultChart by more than the keep-default threshold.");
    return {
      default_chart_id: defaultScore.candidate_id,
      top_alternative_id: topAlternative?.candidate_id,
      default_score: defaultValue,
      top_alternative_score: alternativeValue,
      lead_over_default: lead,
      event_count: eventCount,
      minimum_events_required: minimumEvents,
      override_allowed: false,
      recommendation: "use_default_chart",
      reasons
    };
  }

  if (lead <= config.lead_thresholds.uncertain_if_lead_lte) {
    reasons.push("Top alternative leads, but not enough to safely override DefaultChart.");
    return {
      default_chart_id: defaultScore.candidate_id,
      top_alternative_id: topAlternative.candidate_id,
      default_score: defaultValue,
      top_alternative_score: alternativeValue,
      lead_over_default: lead,
      event_count: eventCount,
      minimum_events_required: minimumEvents,
      override_allowed: false,
      recommendation: "default_protected_uncertain",
      reasons
    };
  }

  const enoughHighImportanceMatches = topAlternative.high_importance_event_matches >= config.minimum_high_importance_event_matches_for_override;
  if (lead > config.lead_thresholds.candidate_preferred_if_lead_gt && enoughHighImportanceMatches) {
    reasons.push("Top alternative leads DefaultChart by more than the override threshold and has enough high-importance event matches.");
    return {
      default_chart_id: defaultScore.candidate_id,
      top_alternative_id: topAlternative.candidate_id,
      default_score: defaultValue,
      top_alternative_score: alternativeValue,
      lead_over_default: lead,
      event_count: eventCount,
      minimum_events_required: minimumEvents,
      override_allowed: true,
      recommendation: "candidate_preferred",
      reasons
    };
  }

  reasons.push("Top alternative has a strong lead but lacks enough high-importance event matches.");
  return {
    default_chart_id: defaultScore.candidate_id,
    top_alternative_id: topAlternative.candidate_id,
    default_score: defaultValue,
    top_alternative_score: alternativeValue,
    lead_over_default: lead,
    event_count: eventCount,
    minimum_events_required: minimumEvents,
    override_allowed: false,
    recommendation: "default_protected_uncertain",
    reasons
  };
}
