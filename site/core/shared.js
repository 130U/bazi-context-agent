function assertObject(value, message) {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error(message);
}

function assertFiniteNumbers(value, message) {
  assertObject(value, message);
  if (Object.values(value).some((item) => !Number.isFinite(item))) throw new Error(message);
}

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
  assertFiniteNumbers(browser.candidate_component_weights, "Runtime config has invalid candidate component weights.");
  assertObject(browser.event_relation_scores, "Runtime config is missing event relation scores.");
  assertObject(browser.selection, "Runtime config is missing candidate selection policy.");
  assertObject(browser.stability, "Runtime config is missing stability policy.");
  assertObject(browser.policy, "Runtime config is missing browser policy.");
  assertObject(browser.forecast, "Runtime config is missing forecast policy.");

  const questions = allQuestions(questionBank);
  const questionIds = questions.map((question) => question?.id);
  if (questionIds.some((id) => typeof id !== "string" || !id)) throw new Error("Runtime config contains a question without an id.");
  if (new Set(questionIds).size !== questionIds.length) throw new Error("Runtime config contains duplicate question ids.");
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
