import type { CandidateRectificationScore, RectificationEvidence, RectificationEvidenceSource, RectificationEvidenceTableRow, RectificationEvidenceType } from "./rectificationTypes.ts";

export function createRectificationEvidence(input: {
  candidate_id: string;
  evidence_type: RectificationEvidenceType;
  label: string;
  description: string;
  source: RectificationEvidenceSource;
  event_id?: string;
  score_delta?: number;
  weight?: number;
  confidence?: number;
}): RectificationEvidence {
  const eventPart = input.event_id ? `_${input.event_id}` : "";
  return {
    evidence_id: `${input.candidate_id}_${input.evidence_type}${eventPart}_${input.label}`.replace(/[^a-zA-Z0-9_:-]/g, "_"),
    candidate_id: input.candidate_id,
    evidence_type: input.evidence_type,
    event_id: input.event_id,
    label: input.label,
    description: input.description,
    score_delta: input.score_delta,
    weight: input.weight,
    confidence: input.confidence ?? 0.75,
    source: input.source
  };
}

export function evidenceTableRows(score: CandidateRectificationScore, weights: CandidateRectificationScore["components"]): RectificationEvidenceTableRow[] {
  const components = score.components;
  return [
    "recorded_time_prior",
    "event_timing_fit",
    "symbol_prior_fit",
    "chart_profile_fit",
    "contradiction_penalty"
  ].map((component) => {
    const value = components[component as keyof typeof components];
    const weight = weights[component as keyof typeof weights] ?? (component === "contradiction_penalty" ? 1 : 0);
    return {
      candidate_id: score.candidate_id,
      component,
      score: value,
      weight,
      weighted_score: component === "contradiction_penalty" ? -value : Number((value * weight).toFixed(4)),
      evidence_summary: score.evidence.filter((item) => item.evidence_type === component || (component === "contradiction_penalty" && item.evidence_type === "contradiction")).map((item) => item.description),
      contradictions: score.contradictions.map((item) => item.description)
    };
  });
}
