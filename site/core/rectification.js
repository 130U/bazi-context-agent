import {
  BRANCHES,
  BRANCH_LABELS,
  REPRESENTATIVE_TIMES,
  branchForTime,
  branchGroup,
  branchRelations,
  wrapBranchIndex,
  yearBranch
} from "./branches.js";
import {
  copy,
  getContextQuestions,
  normalizeText,
  optionIds,
  questionById,
  roundScore,
  runtimeParts,
  stageQuestions,
  validClockTime
} from "./shared.js";

const SKIP_VALUES = new Set([
  "unknown",
  "unsure",
  "skip",
  "prefer_not_to_say",
  "not_applicable",
  "complex_unknown",
  "varies_unknown"
]);

function candidateBranches(intake, browser) {
  if (intake.time_certainty === "unknown_time") {
    return BRANCHES.slice(0, browser.selection.unknown_candidate_count).map((branch) => ({ branch, source: "unknown_symmetric" }));
  }

  const recordedBranch = branchForTime(intake.recorded_time);
  if (!recordedBranch) {
    return BRANCHES.slice(0, browser.selection.unknown_candidate_count).map((branch) => ({ branch, source: "unknown_symmetric" }));
  }

  const center = BRANCHES.indexOf(recordedBranch);
  const baseRadius = browser.selection.radius_by_uncertainty[intake.uncertainty_range]
    ?? browser.selection.adjacent_branch_radius;
  const boundaryExpanded = intake.boundary_flags.some((flag) => (
    flag === "near_midnight" || flag === "near_hour_boundary" || flag === "date_may_shift"
  ));
  const radius = Math.max(
    baseRadius,
    boundaryExpanded ? browser.selection.boundary_expansion_radius : baseRadius
  );
  const result = [];
  for (let offset = -radius; offset <= radius; offset += 1) {
    const branch = BRANCHES[wrapBranchIndex(center + offset)];
    const source = offset === 0
      ? "recorded"
      : Math.abs(offset) <= baseRadius
        ? (intake.uncertainty_range === "auto" ? "adjacent" : "uncertain_range")
        : "boundary_expanded";
    result.push({ branch, source });
  }
  return result;
}

function birthRecordScore(source, browser) {
  return browser.birth_record_scores[source] ?? browser.birth_record_scores.unknown_symmetric;
}

function makeCandidates(intake, browser) {
  return candidateBranches(intake, browser).map(({ branch, source }) => ({
    candidate_id: `hour_${branch}`,
    branch,
    hour_label: BRANCH_LABELS[branch],
    representative_time: REPRESENTATIVE_TIMES[branch],
    source,
    components: {
      birth_record: birthRecordScore(source, browser),
      symbol_prior: browser.neutral_component_scores.symbol_prior,
      event_backtest: browser.neutral_component_scores.event_backtest
    },
    total_score: null,
    evidence: []
  }));
}

function normalizeRecordedTime(value) {
  const text = normalizeText(value);
  if (!text || text === "unsure" || text === "unknown") return null;
  if (validClockTime(text)) return text.padStart(5, "0");
  const first = text.split("-")[0];
  return validClockTime(first) ? first.padStart(5, "0") : null;
}

export function normalizeIntake(intake = {}) {
  const recorded = intake.recorded_time ?? intake.recordedTime ?? intake.A3_recorded_time;
  const recordedTime = normalizeRecordedTime(recorded);
  const uncertainty = intake.uncertainty_range ?? intake.uncertaintyRange ?? intake.A4_uncertainty_range ?? "auto";
  const unsure = !recordedTime || uncertainty === "full_day";
  return {
    birth_date: normalizeText(intake.birth_date ?? intake.birthDate ?? intake.A1_birth_date),
    birthplace: normalizeText(intake.birthplace ?? intake.A2_birthplace),
    recorded_time: recordedTime,
    recorded_time_input: normalizeText(recorded) || "unsure",
    time_certainty: unsure ? "unknown_time" : uncertainty === "recorded_only" ? "recorded" : "recorded_with_neighbors",
    uncertainty_range: uncertainty,
    boundary_flags: Array.isArray(intake.boundary_flags ?? intake.boundaryFlags ?? intake.A5_boundary_flags)
      ? copy(intake.boundary_flags ?? intake.boundaryFlags ?? intake.A5_boundary_flags)
      : [],
    chart_sex: normalizeText(intake.chart_sex ?? intake.chartSex ?? intake.A6_chart_sex) || "prefer_not_to_say"
  };
}

function initialPolicy(browser) {
  return {
    ai_used_for_ranking: browser.policy.ai_used_for_ranking,
    ai_used_for_forecast: browser.policy.ai_used_for_forecast,
    context_may_change_rectification_scores: browser.policy.context_may_change_rectification_scores,
    data_leaves_browser: false
  };
}

export function createSession(runtimeConfig, intake = {}) {
  const { questionBank, browser } = runtimeParts(runtimeConfig);
  const normalized = normalizeIntake(intake);
  const state = {
    version: "public-session.v1",
    phase: "stage_one",
    intake: normalized,
    answers: {
      stage_one: {},
      context: {}
    },
    candidates: makeCandidates(normalized, browser),
    stage_one: {
      asked_question_ids: [],
      question_count: 0,
      stable: false,
      status: "collecting",
      score_margin: null,
      minimum_questions: questionBank.adaptive_policy.minimum_questions,
      maximum_questions: questionBank.adaptive_policy.maximum_questions
    },
    lock: null,
    policy: initialPolicy(browser)
  };
  return scoreSession(state, runtimeConfig);
}

export function getStageOneQuestions(runtimeConfig) {
  const { questionBank } = runtimeParts(runtimeConfig);
  const eligible = new Set(questionBank.adaptive_policy.eligible_stages);
  const byId = new Map(
    questionBank.stages
      .filter((stage) => eligible.has(stage.id))
      .flatMap((stage) => stage.questions)
      .map((question) => [question.id, question])
  );
  return questionBank.adaptive_policy.question_order.map((id) => byId.get(id)).filter(Boolean).map(copy);
}

export function getNextQuestion(state, runtimeConfig) {
  const { questionBank } = runtimeParts(runtimeConfig);
  if (state.lock) {
    return copy(getContextQuestions(questionBank).find((question) => state.answers.context[question.id] === undefined) ?? null);
  }

  const policy = questionBank.adaptive_policy;
  if (state.stage_one.question_count >= policy.maximum_questions) return null;
  if (state.stage_one.question_count >= policy.minimum_questions && state.stage_one.stable) return null;
  return copy(getStageOneQuestions(runtimeConfig).find((question) => state.answers.stage_one[question.id] === undefined) ?? null);
}

function isSkipped(value) {
  return value === null
    || value === undefined
    || value === ""
    || (typeof value === "string" && SKIP_VALUES.has(value))
    || (Array.isArray(value) && value.length === 0);
}

function normalizeEvents(value, question) {
  const items = Array.isArray(value) ? value : value && typeof value === "object" ? [value] : [];
  return items
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const year = Number(item.year);
      if (!Number.isInteger(year)) return null;
      return {
        year,
        event_type: String(item.event_type ?? item.eventType ?? item.type ?? question.eventType ?? "major_turning"),
        importance: String(item.importance ?? "medium"),
        description: typeof item.description === "string" ? item.description : undefined
      };
    })
    .filter(Boolean);
}

function symbolComponent(branch, answers, questionBank, scoringWeights, browser) {
  const group = branchGroup(branch);
  let signal = browser.symbol_signal.baseline;
  let evidenceCount = 0;
  for (const question of stageQuestions(questionBank, "symbol_prior")) {
    const answer = answers[question.id];
    if (isSkipped(answer)) continue;
    let raw = scoringWeights.symbol_prior_question_scores?.[question.id]?.[String(answer)]?.[group] ?? browser.symbol_signal.no_match;
    if (question.specialScoring === "fetal_order_by_chart_sex") {
      const order = String(answer) === "5_plus" ? 5 : Number(answer);
      const sex = answers.A6_chart_sex ?? null;
      const configuredSex = sex === "male" || sex === "female" ? sex : null;
      raw = configuredSex && scoringWeights.fetal_order_rules?.[configuredSex]?.[group]?.includes(order)
        ? browser.symbol_signal.fetal_order_match
        : browser.symbol_signal.no_match;
    }
    signal += raw * browser.symbol_signal.unit_scale;
    evidenceCount += 1;
  }
  const clamped = Math.min(browser.symbol_signal.maximum, Math.max(browser.symbol_signal.minimum, signal));
  return { score: clamped, evidenceCount };
}

function eventComponent(branch, answers, questionBank, browser) {
  const contributions = [];
  let answerCount = 0;
  for (const question of stageQuestions(questionBank, "event_backtest")) {
    const events = normalizeEvents(answers[question.id], question);
    if (events.length === 0) continue;
    answerCount += 1;
    for (const event of events) {
      const profile = browser.event_type_relation_profiles[event.event_type] ?? "mixed";
      const scores = browser.event_relation_scores[profile] ?? browser.event_relation_scores.mixed;
      const relations = branchRelations(branch, yearBranch(event.year));
      const relationScore = relations.length > 0 ? Math.max(...relations.map((relation) => scores[relation] ?? scores.none)) : scores.none;
      const multiplier = browser.event_importance_multipliers[event.importance] ?? browser.event_importance_multipliers.medium;
      contributions.push({ weighted: relationScore * multiplier, multiplier });
    }
  }
  if (contributions.length === 0) {
    return { score: browser.neutral_component_scores.event_backtest, answerCount: 0, eventCount: 0 };
  }
  const totalWeight = contributions.reduce((sum, contribution) => sum + contribution.multiplier, 0);
  return {
    score: contributions.reduce((sum, contribution) => sum + contribution.weighted, 0) / totalWeight,
    answerCount,
    eventCount: contributions.length
  };
}

function informativeAnswerCount(answers) {
  return Object.values(answers).filter((answer) => !isSkipped(answer)).length;
}

export function scoreSession(state, runtimeConfig) {
  const { questionBank, scoringWeights, browser } = runtimeParts(runtimeConfig);
  const weights = browser.candidate_component_weights;
  const stageAnswers = state.answers?.stage_one ?? {};
  const candidates = state.candidates
    .map((candidate) => {
      const symbol = symbolComponent(
        candidate.branch,
        { ...stageAnswers, A6_chart_sex: state.intake.chart_sex },
        questionBank,
        scoringWeights,
        browser
      );
      const events = eventComponent(candidate.branch, stageAnswers, questionBank, browser);
      const components = {
        birth_record: candidate.components.birth_record,
        symbol_prior: symbol.score,
        event_backtest: events.score
      };
      const total = components.birth_record * weights.birth_record
        + components.symbol_prior * weights.symbol_prior
        + components.event_backtest * weights.event_backtest;
      return {
        ...copy(candidate),
        components,
        total_score: roundScore(total, browser.selection.score_precision_digits),
        evidence: [
          { type: "birth_record", source: candidate.source, value: components.birth_record },
          { type: "symbol_prior", answer_count: symbol.evidenceCount, value: components.symbol_prior },
          { type: "event_backtest", answer_count: events.answerCount, event_count: events.eventCount, value: components.event_backtest }
        ]
      };
    })
    .sort((left, right) => right.total_score - left.total_score || BRANCHES.indexOf(left.branch) - BRANCHES.indexOf(right.branch));

  const margin = candidates.length > 1
    ? roundScore(candidates[0].total_score - candidates[1].total_score, browser.selection.score_precision_digits)
    : candidates[0]?.total_score ?? null;
  const eventAnswers = stageQuestions(questionBank, "event_backtest")
    .filter((question) => normalizeEvents(stageAnswers[question.id], question).length > 0)
    .length;
  const informative = informativeAnswerCount(stageAnswers);
  const asked = state.stage_one?.question_count ?? Object.keys(stageAnswers).length;
  const enoughQuestions = asked >= questionBank.adaptive_policy.minimum_questions;
  const stable = enoughQuestions
    && margin !== null
    && margin >= browser.stability.minimum_score_margin
    && eventAnswers >= browser.stability.minimum_event_answers
    && informative >= browser.stability.minimum_informative_answers;

  return {
    ...copy(state),
    candidates,
    stage_one: {
      ...copy(state.stage_one),
      stable,
      status: stable
        ? "stable_ready_to_lock"
        : asked >= questionBank.adaptive_policy.maximum_questions ? "provisional_ready_to_lock" : "collecting",
      score_margin: margin,
      event_answer_count: eventAnswers,
      informative_answer_count: informative
    }
  };
}

function normalizeAnswer(question, value) {
  if (isSkipped(value)) return copy(value ?? "skip");
  if (question.inputType === "single_choice") {
    if (typeof value !== "string" || !optionIds(question).includes(value)) throw new Error(`Invalid option for ${question.id}.`);
    return value;
  }
  if (question.inputType === "multi_choice") {
    if (!Array.isArray(value) || !value.every((item) => typeof item === "string" && optionIds(question).includes(item))) {
      throw new Error(`Invalid options for ${question.id}.`);
    }
    if (question.maxSelections !== undefined && value.length > question.maxSelections) throw new Error(`Too many selections for ${question.id}.`);
    return copy(value);
  }
  if (question.inputType === "year_event_list") {
    const events = normalizeEvents(value, question);
    if (!Array.isArray(value) || events.length !== value.length) throw new Error(`Invalid event list for ${question.id}.`);
    if (question.maxItems !== undefined && events.length > question.maxItems) throw new Error(`Too many events for ${question.id}.`);
    return events;
  }
  if (question.inputType === "short_text") {
    if (typeof value !== "string") throw new Error(`Invalid text for ${question.id}.`);
    if (question.maxLength !== undefined && value.length > question.maxLength) throw new Error(`Text too long for ${question.id}.`);
    return value;
  }
  return copy(value);
}

export function answerQuestion(state, questionId, value, runtimeConfig) {
  const { questionBank } = runtimeParts(runtimeConfig);
  const question = questionById(questionBank, questionId);
  if (!question) throw new Error(`Unknown question: ${questionId}.`);
  const prefix = questionId.charAt(0);
  const next = copy(state);
  if (prefix === "D") {
    if (!state.lock) throw new Error("Context questions start only after the working chart is locked.");
    next.answers.context[questionId] = normalizeAnswer(question, value);
    return next;
  }
  if (prefix !== "B" && prefix !== "C") {
    throw new Error("Birth intake must be supplied to createSession; only B/C/D answers are accepted here.");
  }
  if (state.lock) throw new Error("Stage-one answers cannot change after the working chart is locked.");
  if (state.answers.stage_one[questionId] === undefined) next.stage_one.asked_question_ids.push(questionId);
  next.answers.stage_one[questionId] = normalizeAnswer(question, value);
  next.stage_one.question_count = next.stage_one.asked_question_ids.length;
  return scoreSession(next, runtimeConfig);
}

export function lockWorkingChart(state, runtimeConfig) {
  if (state.lock) return copy(state);
  const { questionBank, browser } = runtimeParts(runtimeConfig);
  const scored = scoreSession(state, runtimeConfig);
  const policy = questionBank.adaptive_policy;
  if (scored.stage_one.question_count < policy.minimum_questions) {
    throw new Error(`At least ${policy.minimum_questions} stage-one questions are required before locking.`);
  }
  if (!scored.stage_one.stable && scored.stage_one.question_count < policy.maximum_questions) {
    throw new Error("The chart is not stable yet; continue the configured stage-one questions.");
  }
  const status = scored.stage_one.stable ? "stable" : "provisional";
  return {
    ...scored,
    phase: "context",
    lock: {
      status,
      selected_chart: copy(scored.candidates[0]),
      alternatives: copy(scored.candidates.slice(1, 1 + browser.selection.locked_alternative_count)),
      question_count: scored.stage_one.question_count,
      locked_at: null,
      policy: {
        deterministic: true,
        ai_used: false,
        context_used: false
      }
    },
    stage_one: {
      ...scored.stage_one,
      status: status === "stable" ? "locked_stable" : "locked_provisional"
    }
  };
}
