import type { EvalCase, EvaluationModeId, ForecastEvalScore, ModeOutput, PairwiseResult } from "./evalTypes.ts";
import { runLeakageGuard } from "./leakageGuard.ts";

function clamp(value: number): number {
  return Math.max(0, Math.min(1, Number.isFinite(value) ? value : 0));
}

function textForOutput(output: ModeOutput): string {
  return output.domain_forecasts.map((forecast) => `${forecast.domain} ${forecast.prediction} ${forecast.year ?? ""} ${forecast.occurred ?? ""}`).join("\n");
}

function includesAny(text: string, terms: string[]): boolean {
  const lower = text.toLocaleLowerCase();
  return terms.some((term) => term.length > 0 && lower.includes(term.toLocaleLowerCase()));
}

function yearScore(outputYear: number | undefined, targetYear: number | undefined): number {
  if (!targetYear) return 0.5;
  if (!outputYear) return 0.4;
  const diff = Math.abs(outputYear - targetYear);
  if (diff === 0) return 1;
  if (diff === 1) return 0.75;
  if (diff <= 3) return 0.5;
  return 0;
}

export function scoreModeOutput(evalCase: EvalCase, output: ModeOutput): ForecastEvalScore {
  const outputText = textForOutput(output);
  const leakage = runLeakageGuard(output, evalCase);
  const targetDomains = new Set(evalCase.hidden_targets.map((target) => target.domain));
  const forecastDomains = new Set(output.domain_forecasts.map((forecast) => forecast.domain));
  const domainMatches = [...targetDomains].filter((domain) => forecastDomains.has(domain)).length;
  const domain_accuracy = targetDomains.size > 0 ? domainMatches / targetDomains.size : 0;

  const perTargetYear = evalCase.hidden_targets.map((target) => {
    const forecast = output.domain_forecasts.find((item) => item.domain === target.domain);
    return yearScore(forecast?.year, target.year);
  });
  const time_window_overlap = perTargetYear.length > 0 ? perTargetYear.reduce((sum, item) => sum + item, 0) / perTargetYear.length : 0;

  const directionMatches = evalCase.hidden_targets.map((target) => {
    const forecast = output.domain_forecasts.find((item) => item.domain === target.domain);
    if (!forecast || typeof forecast.occurred !== "boolean") return includesAny(outputText, target.acceptable_answers) ? 0.75 : 0.45;
    return forecast.occurred === target.occurred ? 1 : 0;
  });
  const directional_correctness = directionMatches.length > 0 ? directionMatches.reduce((sum, item) => sum + item, 0) / directionMatches.length : 0;
  const specificity = clamp(output.domain_forecasts.reduce((sum, item) => sum + (item.prediction.length > 30 ? 1 : 0.5), 0) / Math.max(1, output.domain_forecasts.length));
  const calibration = clamp(output.domain_forecasts.reduce((sum, item) => sum + item.confidence, 0) / Math.max(1, output.domain_forecasts.length));
  const evidence_separation = output.known_facts_used && output.derivative_signals_used ? 1 : 0.5;
  const actionability = specificity > 0.8 ? 0.7 : 0.4;
  const leakage_penalty = leakage.total_penalty;

  const base =
    0.2 * domain_accuracy +
    0.15 * time_window_overlap +
    0.15 * directional_correctness +
    0.1 * specificity +
    0.1 * calibration +
    0.15 * evidence_separation +
    0.05 * actionability -
    0.3 * leakage_penalty;

  return {
    mode: output.mode,
    total_score: clamp(base),
    domain_accuracy: clamp(domain_accuracy),
    time_window_overlap: clamp(time_window_overlap),
    directional_correctness: clamp(directional_correctness),
    specificity,
    calibration,
    evidence_separation,
    actionability,
    leakage_penalty,
    notes: leakage.passed ? [] : leakage.violations.map((item) => item.message)
  };
}

export function comparePair(a: ForecastEvalScore, b: ForecastEvalScore, tieThreshold = 0.03): PairwiseResult {
  const delta = a.total_score - b.total_score;
  const winner: EvaluationModeId | "tie" = Math.abs(delta) <= tieThreshold ? "tie" : delta > 0 ? a.mode : b.mode;
  return {
    pair: [a.mode, b.mode],
    winner,
    score_delta: Number(Math.abs(delta).toFixed(4)),
    reason: winner === "tie" ? "Scores are within tie threshold." : `${winner} has higher deterministic score.`
  };
}
