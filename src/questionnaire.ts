import type { AnswerMap, Question, QuestionBank, QuestionLayer, QuestionnaireSession, ValidationResult } from "./types.ts";

const DEFAULT_LAYER_ORDER: QuestionLayer[] = ["birth_input", "symbol_prior", "event_backtest", "context_box"];
const SKIP_VALUES = new Set(["unknown", "skip", "prefer_not_to_say", "not_applicable", "complex_unknown", "varies_unknown"]);
const WORKING_IDENTITIES = new Set(["professional", "entrepreneur_freelance", "multiple", "working", "internship", "has_work_history"]);

function optionIds(question: Question): string[] {
  return (question.options ?? []).map((option) => (typeof option === "string" ? option : option.id));
}

function empty(answer: unknown): boolean {
  return answer === undefined || answer === null || answer === "" || (Array.isArray(answer) && answer.length === 0);
}

function skip(answer: unknown): boolean {
  return typeof answer === "string" && SKIP_VALUES.has(answer);
}

function normalizeYearEvent(answer: unknown, eventType?: string) {
  if (!answer || typeof answer !== "object" || Array.isArray(answer)) return null;
  const record = answer as Record<string, unknown>;
  const year = Number(record.year);
  const type = String(record.event_type ?? record.eventType ?? record.type ?? eventType ?? "");
  if (!Number.isInteger(year) || year < 1900 || year > 2101 || type.length === 0) return null;
  return { year, event_type: type, description: typeof record.description === "string" ? record.description : undefined };
}

export function getQuestionsByLayer(bank: QuestionBank, layer: QuestionLayer): Question[] {
  return bank.stages.find((stage) => stage.id === layer)?.questions ?? [];
}

export function validateAnswer(question: Question, answer: unknown): ValidationResult {
  const errors: string[] = [];
  if (empty(answer)) {
    if (question.required) errors.push("required");
    return { valid: errors.length === 0, errors, skipped: !question.required };
  }
  if (skip(answer)) {
    if (question.required && !optionIds(question).includes(String(answer))) errors.push("skip_not_allowed");
    return { valid: errors.length === 0, errors, normalized: answer, skipped: true };
  }

  if (question.inputType === "single_choice") {
    if (typeof answer !== "string" || !optionIds(question).includes(answer)) errors.push("invalid_option");
    return { valid: errors.length === 0, errors, normalized: answer };
  }
  if (question.inputType === "multi_choice") {
    if (!Array.isArray(answer) || !answer.every((item) => typeof item === "string" && optionIds(question).includes(item))) errors.push("invalid_option");
    if (Array.isArray(answer) && question.maxSelections !== undefined && answer.length > question.maxSelections) errors.push("too_many_selections");
    return { valid: errors.length === 0, errors, normalized: answer };
  }
  if (question.inputType === "short_text") {
    const maxLength = question.maxLength ?? 50;
    if (typeof answer !== "string") errors.push("invalid_text");
    if (typeof answer === "string" && answer.length > maxLength) errors.push("too_long");
    return { valid: errors.length === 0, errors, normalized: answer };
  }
  if (question.inputType === "date") {
    if (typeof answer !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(answer)) errors.push("invalid_date");
    return { valid: errors.length === 0, errors, normalized: answer };
  }
  if (question.inputType === "time_or_range") {
    if (typeof answer !== "string" || !/^(\d{1,2}:\d{2})(-\d{1,2}:\d{2})?$/.test(answer)) errors.push("invalid_time_or_range");
    return { valid: errors.length === 0, errors, normalized: answer };
  }
  if (question.inputType === "year_event") {
    const event = normalizeYearEvent(answer, question.eventType);
    if (!event) errors.push("invalid_year_event");
    return { valid: errors.length === 0, errors, normalized: event ?? undefined };
  }
  if (question.inputType === "year_event_list") {
    if (!Array.isArray(answer)) return { valid: false, errors: ["invalid_year_event_list"] };
    const events = answer.map((item) => normalizeYearEvent(item, question.eventType));
    if (events.some((event) => !event)) errors.push("invalid_year_event");
    if (question.maxItems !== undefined && answer.length > question.maxItems) errors.push("too_many_items");
    return { valid: errors.length === 0, errors, normalized: events.filter(Boolean) };
  }
  return { valid: false, errors: ["unsupported_question_type"] };
}

export function isQuestionVisible(question: Question, answers: AnswerMap): boolean {
  if (question.id === "B7_birth_posture_if_known") return true;
  if (question.conditional === "current_identity_is_working_or_has_work_history") {
    const identity = answers.D6_current_identity ?? answers.current_identity;
    const actualPath = answers.D8_actual_path ?? answers.actual_path;
    if (typeof identity === "string" && WORKING_IDENTITIES.has(identity)) return true;
    if (typeof actualPath === "string" && actualPath.trim().length > 0 && !SKIP_VALUES.has(actualPath)) return true;
    return Boolean(answers.has_work_history);
  }
  if (question.conditional === "childbearing_applicable") {
    if (answers.childbearing_applicable === true) return true;
    const events = Object.values(answers).flat();
    return events.some((item) => typeof item === "object" && item !== null && /child|pregnan|birth|子|育/.test(JSON.stringify(item)));
  }
  return true;
}

export function getNextQuestion(session: QuestionnaireSession): Question | null {
  for (const layer of session.layerOrder ?? DEFAULT_LAYER_ORDER) {
    for (const question of getQuestionsByLayer(session.bank, layer)) {
      if (session.answers[question.id] === undefined && isQuestionVisible(question, session.answers)) return question;
    }
  }
  return null;
}
