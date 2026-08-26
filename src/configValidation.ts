import type { QuestionBank, ScoringConfig } from "./types.ts";

type JsonRecord = Record<string, unknown>;

function record(value: unknown, path: string): JsonRecord {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error(`${path} must be an object.`);
  return value as JsonRecord;
}

function finiteNumber(value: unknown, path: string): number {
  if (!Number.isFinite(value)) throw new Error(`${path} must be a finite number.`);
  return value as number;
}

function valueAt(root: JsonRecord, path: string): unknown {
  return path.split(".").reduce<unknown>((value, key) => record(value, path)[key], root);
}

function requireNumberPaths(root: JsonRecord, paths: string[]): void {
  for (const path of paths) finiteNumber(valueAt(root, path), path);
}

function assertFiniteTree(value: unknown, path: string): void {
  if (typeof value === "number" && !Number.isFinite(value)) throw new Error(`${path} contains a non-finite number.`);
  if (Array.isArray(value)) value.forEach((item, index) => assertFiniteTree(item, `${path}[${index}]`));
  else if (value && typeof value === "object") {
    for (const [key, child] of Object.entries(value as JsonRecord)) assertFiniteTree(child, `${path}.${key}`);
  }
}

export function assertQuestionBank(input: unknown): QuestionBank {
  const bank = record(input, "question_bank");
  if (!Array.isArray(bank.stages)) throw new Error("question_bank.stages must be an array.");
  const questions = bank.stages.flatMap((stage, stageIndex) => {
    const item = record(stage, `question_bank.stages[${stageIndex}]`);
    if (typeof item.id !== "string" || !item.id) throw new Error(`question_bank.stages[${stageIndex}].id is required.`);
    if (!Array.isArray(item.questions)) throw new Error(`question_bank.stages[${stageIndex}].questions must be an array.`);
    return item.questions;
  });
  const ids = new Set<string>();
  for (const [index, rawQuestion] of questions.entries()) {
    const question = record(rawQuestion, `question_bank.questions[${index}]`);
    if (typeof question.id !== "string" || !question.id || ids.has(question.id)) throw new Error("Question ids must be present and unique.");
    if (typeof question.title !== "string" || !question.title.trim()) throw new Error(`Question ${question.id} must have a title.`);
    if (typeof question.inputType !== "string") throw new Error(`Question ${question.id} must have an inputType.`);
    if (["single_choice", "multi_choice"].includes(question.inputType) && (!Array.isArray(question.options) || question.options.length === 0)) {
      throw new Error(`Question ${question.id} must define options.`);
    }
    if (question.inputType === "year_event_list" && question.eventTypeOptions !== undefined) {
      if (!Array.isArray(question.eventTypeOptions) || question.eventTypeOptions.length < 2) {
        throw new Error(`Question ${question.id} must define at least two eventTypeOptions.`);
      }
      for (const rawOption of question.eventTypeOptions) {
        const option = record(rawOption, `question ${question.id} eventTypeOption`);
        if (typeof option.id !== "string" || !option.id || typeof option.label !== "string" || !option.label.trim()) {
          throw new Error(`Question ${question.id} has an invalid eventTypeOption.`);
        }
      }
    }
    ids.add(question.id);
  }
  for (const id of ["A1_birth_date", "A2_birthplace", "A3_recorded_time", "A4_uncertainty_range", "A5_boundary_flags", "A6_chart_sex"]) {
    if (!ids.has(id)) throw new Error(`question_bank is missing ${id}.`);
  }
  for (const policyName of ["adaptive_policy", "context_policy"]) {
    const policy = record(bank[policyName], `question_bank.${policyName}`);
    if (!Array.isArray(policy.question_order) || policy.question_order.some((id) => typeof id !== "string" || !ids.has(id))) {
      throw new Error(`question_bank.${policyName}.question_order contains an unknown question.`);
    }
  }
  return input as QuestionBank;
}

export function assertScoringConfig(input: unknown): ScoringConfig {
  const config = record(input, "scoring_weights");
  assertFiniteTree(config, "scoring_weights");
  requireNumberPaths(config, [
    "candidate_score_weights.symbol_prior_fit",
    "candidate_score_weights.event_timing_fit",
    "candidate_score_weights.early_life_and_family_fit",
    "candidate_score_weights.birth_record_plausibility",
    "candidate_score_weights.domain_trajectory_fit",
    "legacy_event_backtest.neutral_score",
    "legacy_event_backtest.contradiction_threshold",
    "symbol_prior_policy.fetal_order_match_score",
    "symbol_prior_policy.normalization_precision_digits",
    "legacy_ranking.neutral_component_score",
    "legacy_ranking.maximum_contradiction_penalty",
    "legacy_ranking.single_hour_score_margin",
    "rectification_v2.weights.candidate_rectification_score_weights.recorded_time_prior",
    "rectification_v2.weights.candidate_rectification_score_weights.event_timing_fit",
    "rectification_v2.weights.candidate_rectification_score_weights.symbol_prior_fit",
    "rectification_v2.weights.candidate_rectification_score_weights.chart_profile_fit",
    "rectification_v2.event_scoring.parameters.neutral_event_score",
    "rectification_v2.default_chart_protection.lead_thresholds.keep_default_if_lead_lte",
    "chart_generation.recorded_time_prior_scores.exact_to_minute",
    "chart_generation.recorded_time_prior_scores.unknown_time",
    "chart_generation.expanded_candidate_prior_penalty",
    "chart_generation.minimum_candidate_prior",
    "legacy_candidate_generation.maximum_candidates",
    "legacy_candidate_generation.minimum_candidates",
    "legacy_candidate_generation.adjacent_1_shichen_radius",
    "legacy_candidate_generation.adjacent_2_shichen_radius",
    "browser_rectification.candidate_component_weights.birth_record",
    "browser_rectification.candidate_component_weights.symbol_prior",
    "browser_rectification.candidate_component_weights.event_backtest",
    "browser_rectification.selection.unknown_candidate_count",
    "browser_rectification.stability.minimum_score_margin"
  ]);
  const weightGroups = [
    record(config.candidate_score_weights, "candidate_score_weights"),
    record(valueAt(config, "rectification_v2.weights.candidate_rectification_score_weights"), "rectification_v2 weights"),
    record(valueAt(config, "browser_rectification.candidate_component_weights"), "browser component weights")
  ];
  for (const weights of weightGroups) {
    const total = Object.values(weights).reduce<number>((sum, value) => sum + finiteNumber(value, "weight"), 0);
    if (Math.abs(total - 1) > 1e-9) throw new Error("Candidate scoring weights must sum to one.");
  }
  if (config.ai_allowed_before_candidate_ranking !== false) throw new Error("AI must remain disabled before ranking.");
  const browserPolicy = record(valueAt(config, "browser_rectification.policy"), "browser_rectification.policy");
  if (browserPolicy.ai_used_for_ranking !== false || browserPolicy.context_may_change_rectification_scores !== false) {
    throw new Error("Browser rectification policy violates the deterministic boundary.");
  }
  return input as ScoringConfig;
}
