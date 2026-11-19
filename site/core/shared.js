function assertObject(value, message) {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error(message);
}

function assertNumberKeys(value, keys, message, minimum = -Infinity, maximum = Infinity) {
  assertObject(value, message);
  for (const key of keys) {
    const item = value[key];
    if (!Number.isFinite(item) || item < minimum || item > maximum) throw new Error(message);
  }
}

function assertEnumValues(value, keys, allowed, message) {
  assertObject(value, message);
  for (const key of keys) {
    if (!allowed.has(value[key])) throw new Error(message);
  }
}

const BRANCH_IDS = new Set(["Zi", "Chou", "Yin", "Mao", "Chen", "Si", "Wu", "Wei", "Shen", "You", "Xu", "Hai"]);
const RELATION_IDS = ["same_branch", "clash", "six_harmony", "harm", "triad_same_group", "none"];
const RELATION_KINDS = new Set(["support", "transition", "quiet"]);

export function copy(value) {
  return value === undefined ? undefined : JSON.parse(JSON.stringify(value));
}

export function stageQuestions(questionBank, stageId) {
  return questionBank.stages.find((stage) => stage.id === stageId)?.questions ?? [];
}

export function allQuestions(questionBank) {
  return questionBank.stages.flatMap((stage) => stage.questions);
}

export function questionById(questionBank, questionId) {
  return allQuestions(questionBank).find((question) => question.id === questionId) ?? null;
}

export function getContextQuestions(questionBank) {
  const byId = new Map(stageQuestions(questionBank, "context_box").map((question) => [question.id, question]));
  return questionBank.context_policy.question_order.map((id) => byId.get(id)).filter(Boolean);
}

export function optionIds(question) {
  return (question?.options ?? []).map((option) => (typeof option === "string" ? option : option.id));
}

export function normalizeText(value) {
  return typeof value === "string" ? value.trim() : "";
}

export function validClockTime(value) {
  if (typeof value !== "string") return false;
  const match = value.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return false;
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  return Number.isInteger(hour) && Number.isInteger(minute) && hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59;
}

export function roundScore(value, digits) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

export function clamp(value, minimum, maximum) {
  return Math.min(maximum, Math.max(minimum, value));
}

export function validateRuntimeConfig(runtimeConfig) {
  const questionBank = runtimeConfig?.question_bank ?? runtimeConfig?.questionBank ?? runtimeConfig;
  const scoringWeights = runtimeConfig?.scoring_weights ?? runtimeConfig?.scoringWeights ?? runtimeConfig;
  const browser = scoringWeights?.browser_rectification;

  assertObject(questionBank?.adaptive_policy, "Runtime config is missing question_bank.adaptive_policy.");
  if (!Array.isArray(questionBank?.stages)) throw new Error("Runtime config is missing question_bank.stages.");
  assertObject(questionBank?.context_policy, "Runtime config is missing question_bank.context_policy.");
  assertObject(browser, "Runtime config is missing scoring_weights.browser_rectification.");
  const componentKeys = ["birth_record", "symbol_prior", "event_backtest"];
  assertNumberKeys(browser.candidate_component_weights, componentKeys, "Runtime config has invalid candidate component weights.", 0, 1);
  const componentWeightTotal = componentKeys.reduce((sum, key) => sum + browser.candidate_component_weights[key], 0);
  if (Math.abs(componentWeightTotal - 1) > 1e-9) throw new Error("Runtime config candidate component weights must sum to one.");
  assertNumberKeys(
    browser.birth_record_scores,
    ["recorded", "adjacent", "uncertain_range", "boundary_expanded", "unknown_symmetric"],
    "Runtime config has invalid birth record scores.",
    0,
    1
  );
  assertNumberKeys(browser.neutral_component_scores, ["symbol_prior", "event_backtest"], "Runtime config has invalid neutral component scores.", 0, 1);
  assertObject(browser.event_relation_scores, "Runtime config is missing event relation scores.");
  for (const profile of ["change", "flow", "mixed"]) {
    assertNumberKeys(browser.event_relation_scores[profile], RELATION_IDS, `Runtime config has an invalid ${profile} event profile.`, 0, 1);
  }
  assertObject(browser.event_type_relation_profiles, "Runtime config is missing event type profiles.");
  if (Object.values(browser.event_type_relation_profiles).some((profile) => !browser.event_relation_scores[profile])) {
    throw new Error("Runtime config event type profile references an unknown relation profile.");
  }
  assertNumberKeys(browser.event_importance_multipliers, ["low", "medium", "high"], "Runtime config has invalid event importance multipliers.", 0);
  assertNumberKeys(browser.symbol_signal, ["baseline", "unit_scale", "no_match", "fetal_order_match", "minimum", "maximum"], "Runtime config has an invalid symbol signal policy.");
  assertObject(browser.selection, "Runtime config is missing candidate selection policy.");
  assertNumberKeys(browser.selection, ["unknown_candidate_count", "adjacent_branch_radius", "boundary_expansion_radius", "locked_alternative_count", "score_precision_digits"], "Runtime config has an invalid candidate selection policy.", 0);
  assertNumberKeys(browser.selection.radius_by_uncertainty, ["recorded_only", "adjacent_1_shichen", "adjacent_2_shichen", "auto"], "Runtime config has invalid uncertainty radii.", 0);
  assertObject(browser.stability, "Runtime config is missing stability policy.");
  assertNumberKeys(browser.stability, ["minimum_score_margin", "minimum_event_answers", "minimum_informative_answers"], "Runtime config has an invalid stability policy.", 0);
  assertObject(browser.policy, "Runtime config is missing browser policy.");
  for (const key of ["ai_used_for_ranking", "ai_used_for_forecast", "context_may_change_rectification_scores"]) {
    if (typeof browser.policy[key] !== "boolean") throw new Error("Runtime config has an invalid browser policy.");
  }
  assertObject(browser.forecast, "Runtime config is missing forecast policy.");
  assertNumberKeys(browser.forecast, ["default_horizon_months", "minimum_horizon_months", "maximum_horizon_months"], "Runtime config has invalid forecast horizons.", 1);
  const monthKeys = Array.from({ length: 12 }, (_, index) => String(index + 1));
  assertObject(browser.forecast.month_branch_by_gregorian_month, "Runtime config is missing forecast month branches.");
  if (monthKeys.some((month) => !BRANCH_IDS.has(browser.forecast.month_branch_by_gregorian_month[month]))) {
    throw new Error("Runtime config must define all twelve forecast month branches.");
  }
  assertNumberKeys(browser.forecast.relation_scores, RELATION_IDS, "Runtime config has invalid forecast relation scores.");
  assertEnumValues(browser.forecast.relation_kinds, RELATION_IDS, RELATION_KINDS, "Runtime config has invalid forecast relation kinds.");
  assertObject(browser.forecast.relation_labels, "Runtime config is missing forecast relation labels.");
  if (RELATION_IDS.some((relation) => typeof browser.forecast.relation_labels[relation] !== "string")) {
    throw new Error("Runtime config has invalid forecast relation labels.");
  }
  assertObject(browser.forecast.domain_definitions, "Runtime config is missing forecast domain definitions.");
  assertObject(browser.forecast.domain_profile_multipliers, "Runtime config is missing forecast domain profiles.");
  for (const definition of Object.values(browser.forecast.domain_definitions)) {
    if (!definition || typeof definition.label !== "string" || !browser.forecast.domain_profile_multipliers[definition.profile]) {
      throw new Error("Runtime config has an invalid forecast domain definition.");
    }
  }
  if ((browser.forecast.default_domains ?? []).some((domain) => !browser.forecast.domain_definitions[domain])) {
    throw new Error("Runtime config references an unknown default forecast domain.");
  }
  assertNumberKeys(browser.forecast.confidence, ["stable_base", "provisional_base", "margin_scale", "minimum", "maximum", "high_threshold", "medium_threshold"], "Runtime config has an invalid forecast confidence policy.");
  assertNumberKeys(browser.forecast.strength_thresholds, ["high", "medium"], "Runtime config has invalid forecast strength thresholds.");
  assertNumberKeys(browser.forecast.window_selection, ["support_count", "transition_count", "maximum_domains"], "Runtime config has an invalid forecast window selection policy.", 1);

  const questions = allQuestions(questionBank);
  const questionIds = questions.map((question) => question?.id);
  if (questionIds.some((id) => typeof id !== "string" || !id)) throw new Error("Runtime config contains a question without an id.");
  if (new Set(questionIds).size !== questionIds.length) throw new Error("Runtime config contains duplicate question ids.");
  for (const question of questions) {
    if (typeof question.title !== "string" || !question.title.trim() || typeof question.inputType !== "string") {
      throw new Error("Runtime config contains an incomplete question definition.");
    }
    if (["single_choice", "multi_choice"].includes(question.inputType) && !(question.options?.length > 0)) {
      throw new Error("Runtime config contains a choice question without options.");
    }
  }
  const knownQuestions = new Set(questionIds);
  const orderedIds = [
    ...(questionBank.adaptive_policy.question_order ?? []),
    ...(questionBank.context_policy.question_order ?? [])
  ];
  if (orderedIds.some((id) => !knownQuestions.has(id))) throw new Error("Runtime config references an unknown ordered question.");
  if (!Number.isInteger(questionBank.adaptive_policy.minimum_questions)
    || !Number.isInteger(questionBank.adaptive_policy.maximum_questions)
    || questionBank.adaptive_policy.minimum_questions < 1
    || questionBank.adaptive_policy.maximum_questions < questionBank.adaptive_policy.minimum_questions
    || questionBank.adaptive_policy.maximum_questions > questionBank.adaptive_policy.question_order.length) {
    throw new Error("Runtime config has an invalid adaptive question range.");
  }

  return { questionBank, scoringWeights, browser };
}

export function runtimeParts(runtimeConfig) {
  return validateRuntimeConfig(runtimeConfig);
}
