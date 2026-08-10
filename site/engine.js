const BRANCHES = ["Zi", "Chou", "Yin", "Mao", "Chen", "Si", "Wu", "Wei", "Shen", "You", "Xu", "Hai"];

const BRANCH_LABELS = {
  Zi: "子时",
  Chou: "丑时",
  Yin: "寅时",
  Mao: "卯时",
  Chen: "辰时",
  Si: "巳时",
  Wu: "午时",
  Wei: "未时",
  Shen: "申时",
  You: "酉时",
  Xu: "戌时",
  Hai: "亥时"
};

const REPRESENTATIVE_TIMES = {
  Zi: "00:30",
  Chou: "02:00",
  Yin: "04:00",
  Mao: "06:00",
  Chen: "08:00",
  Si: "10:00",
  Wu: "12:00",
  Wei: "14:00",
  Shen: "16:00",
  You: "18:00",
  Xu: "20:00",
  Hai: "22:00"
};

const GROUP_BRANCHES = {
  G1_zi_wu_mao_you: new Set(["Zi", "Wu", "Mao", "You"]),
  G2_yin_shen_si_hai: new Set(["Yin", "Shen", "Si", "Hai"]),
  G3_chen_xu_chou_wei: new Set(["Chen", "Xu", "Chou", "Wei"])
};

const SIX_HARMONY = new Set(["Zi-Chou", "Yin-Hai", "Mao-Xu", "Chen-You", "Si-Shen", "Wu-Wei"]);
const HARMS = new Set(["Zi-Wei", "Chou-Wu", "Yin-Si", "Mao-Chen", "Shen-Hai", "You-Xu"]);
const TRIADS = [
  new Set(["Shen", "Zi", "Chen"]),
  new Set(["Hai", "Mao", "Wei"]),
  new Set(["Yin", "Wu", "Xu"]),
  new Set(["Si", "You", "Chou"])
];

const SKIP_VALUES = new Set(["unknown", "unsure", "skip", "prefer_not_to_say", "not_applicable", "complex_unknown", "varies_unknown"]);

function copy(value) {
  return value === undefined ? undefined : JSON.parse(JSON.stringify(value));
}

function runtimeParts(runtimeConfig) {
  const questionBank = runtimeConfig?.question_bank ?? runtimeConfig?.questionBank ?? runtimeConfig;
  const scoringWeights = runtimeConfig?.scoring_weights ?? runtimeConfig?.scoringWeights ?? runtimeConfig;
  const browser = scoringWeights?.browser_rectification;
  if (!questionBank?.adaptive_policy || !Array.isArray(questionBank?.stages)) {
    throw new Error("Runtime config is missing question_bank.adaptive_policy.");
  }
  if (!browser?.candidate_component_weights || !browser?.event_relation_scores) {
    throw new Error("Runtime config is missing scoring_weights.browser_rectification.");
  }
  return { questionBank, scoringWeights, browser };
}

function stageQuestions(questionBank, stageId) {
  return questionBank.stages.find((stage) => stage.id === stageId)?.questions ?? [];
}

function allQuestions(questionBank) {
  return questionBank.stages.flatMap((stage) => stage.questions);
}

function questionById(questionBank, questionId) {
  return allQuestions(questionBank).find((question) => question.id === questionId) ?? null;
}

function optionIds(question) {
  return (question?.options ?? []).map((option) => (typeof option === "string" ? option : option.id));
}

function normalizeText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function validClockTime(value) {
  if (typeof value !== "string") return false;
  const match = value.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return false;
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  return Number.isInteger(hour) && Number.isInteger(minute) && hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59;
}

function branchForTime(value) {
  if (!validClockTime(value)) return null;
  const hour = Number(value.split(":")[0]);
  if (hour === 23 || hour === 0) return "Zi";
  return BRANCHES[Math.floor((hour + 1) / 2)];
}

function branchGroup(branch) {
  return Object.entries(GROUP_BRANCHES).find(([, members]) => members.has(branch))?.[0] ?? null;
}

function wrapBranchIndex(index) {
  return ((index % BRANCHES.length) + BRANCHES.length) % BRANCHES.length;
}

function candidateBranches(intake, browser) {
  if (intake.time_certainty === "unknown_time") {
    return BRANCHES.slice(0, browser.selection.unknown_candidate_count).map((branch) => ({ branch, source: "unknown_symmetric" }));
  }

  const recordedBranch = branchForTime(intake.recorded_time);
  if (!recordedBranch) {
    return BRANCHES.slice(0, browser.selection.unknown_candidate_count).map((branch) => ({ branch, source: "unknown_symmetric" }));
  }

  const center = BRANCHES.indexOf(recordedBranch);
  const radius = browser.selection.adjacent_branch_radius;
  const result = [];
  for (let offset = -radius; offset <= radius; offset += 1) {
    const branch = BRANCHES[wrapBranchIndex(center + offset)];
    result.push({ branch, source: offset === 0 ? "recorded" : "adjacent" });
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

function getContextQuestions(questionBank) {
  const byId = new Map(stageQuestions(questionBank, "context_box").map((question) => [question.id, question]));
  return questionBank.context_policy.question_order.map((id) => byId.get(id)).filter(Boolean);
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

function pairKey(a, b) {
  return [a, b].sort((left, right) => BRANCHES.indexOf(left) - BRANCHES.indexOf(right)).join("-");
}

function branchRelations(a, b) {
  const relations = [];
  const diff = (BRANCHES.indexOf(a) - BRANCHES.indexOf(b) + BRANCHES.length) % BRANCHES.length;
  if (a === b) relations.push("same_branch");
  if (diff === BRANCHES.length / 2) relations.push("clash");
  if (SIX_HARMONY.has(pairKey(a, b))) relations.push("six_harmony");
  if (HARMS.has(pairKey(a, b))) relations.push("harm");
  if (TRIADS.some((triad) => triad.has(a) && triad.has(b))) relations.push("triad_same_group");
  return relations;
}

function yearBranch(year) {
  return BRANCHES[((year - 4) % BRANCHES.length + BRANCHES.length) % BRANCHES.length];
}

function isSkipped(value) {
  return value === null || value === undefined || value === "" || (typeof value === "string" && SKIP_VALUES.has(value)) || (Array.isArray(value) && value.length === 0);
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
  if (contributions.length === 0) return { score: browser.neutral_component_scores.event_backtest, answerCount: 0, eventCount: 0 };
  const totalWeight = contributions.reduce((sum, contribution) => sum + contribution.multiplier, 0);
  return {
    score: contributions.reduce((sum, contribution) => sum + contribution.weighted, 0) / totalWeight,
    answerCount,
    eventCount: contributions.length
  };
}

function roundScore(value, digits) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
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
      const symbol = symbolComponent(candidate.branch, { ...stageAnswers, A6_chart_sex: state.intake.chart_sex }, questionBank, scoringWeights, browser);
      const events = eventComponent(candidate.branch, stageAnswers, questionBank, browser);
      const components = {
        birth_record: candidate.components.birth_record,
        symbol_prior: symbol.score,
        event_backtest: events.score
      };
      const total =
        components.birth_record * weights.birth_record +
        components.symbol_prior * weights.symbol_prior +
        components.event_backtest * weights.event_backtest;
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

  const margin = candidates.length > 1 ? roundScore(candidates[0].total_score - candidates[1].total_score, browser.selection.score_precision_digits) : candidates[0]?.total_score ?? null;
  const eventAnswers = stageQuestions(questionBank, "event_backtest").filter((question) => normalizeEvents(stageAnswers[question.id], question).length > 0).length;
  const informative = informativeAnswerCount(stageAnswers);
  const asked = state.stage_one?.question_count ?? Object.keys(stageAnswers).length;
  const enoughQuestions = asked >= questionBank.adaptive_policy.minimum_questions;
  const stable =
    enoughQuestions &&
    margin !== null &&
    margin >= browser.stability.minimum_score_margin &&
    eventAnswers >= browser.stability.minimum_event_answers &&
    informative >= browser.stability.minimum_informative_answers;

  return {
    ...copy(state),
    candidates,
    stage_one: {
      ...copy(state.stage_one),
      stable,
      status: stable ? "stable_ready_to_lock" : asked >= questionBank.adaptive_policy.maximum_questions ? "provisional_ready_to_lock" : "collecting",
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
  if (prefix !== "B" && prefix !== "C") throw new Error("Birth intake must be supplied to createSession; only B/C/D answers are accepted here.");
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

function isoDate(value) {
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  return new Date().toISOString().slice(0, 10);
}

function addMonths(date, months) {
  const parsed = new Date(`${date}T00:00:00.000Z`);
  const target = new Date(Date.UTC(parsed.getUTCFullYear(), parsed.getUTCMonth() + months, 1));
  const lastDay = new Date(Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0)).getUTCDate();
  target.setUTCDate(Math.min(parsed.getUTCDate(), lastDay));
  return target.toISOString().slice(0, 10);
}

function addDays(date, days) {
  const parsed = new Date(`${date}T00:00:00.000Z`);
  parsed.setUTCDate(parsed.getUTCDate() + days);
  return parsed.toISOString().slice(0, 10);
}

function firstDayOfMonth(date, offset = 0) {
  const parsed = new Date(`${date}T00:00:00.000Z`);
  return new Date(Date.UTC(parsed.getUTCFullYear(), parsed.getUTCMonth() + offset, 1)).toISOString().slice(0, 10);
}

function earlierDate(left, right) {
  return left < right ? left : right;
}

function clamp(value, minimum, maximum) {
  return Math.min(maximum, Math.max(minimum, value));
}

function primaryForecastRelation(branch, seasonalBranch, forecastConfig) {
  const relations = branchRelations(branch, seasonalBranch);
  const candidates = (relations.length ? relations : ["none"]).map((relation) => ({
    relation,
    score: forecastConfig.relation_scores[relation] ?? forecastConfig.relation_scores.none,
    kind: forecastConfig.relation_kinds[relation] ?? "quiet",
    label: forecastConfig.relation_labels[relation] ?? relation
  }));
  return candidates.sort((left, right) => Math.abs(right.score) - Math.abs(left.score))[0];
}

function selectedForecastDomains(contextFacts, question, forecastConfig) {
  const selected = [];
  const add = (domainId) => {
    if (forecastConfig.domain_definitions[domainId] && !selected.includes(domainId)) selected.push(domainId);
  };
  for (const fact of contextFacts) {
    const values = Array.isArray(fact.value) ? fact.value : [fact.value];
    values.forEach((value) => add(forecastConfig.context_domain_map[String(value)]));
  }
  const normalizedQuestion = typeof question === "string" ? question.toLowerCase() : "";
  for (const [domainId, keywords] of Object.entries(forecastConfig.question_keywords)) {
    if (keywords.some((keyword) => normalizedQuestion.includes(String(keyword).toLowerCase()))) add(domainId);
  }
  forecastConfig.default_domains.forEach(add);
  return selected.slice(0, forecastConfig.window_selection.maximum_domains);
}

function forecastConfidence(state, forecastConfig) {
  const base = state.lock.status === "stable"
    ? forecastConfig.confidence.stable_base
    : forecastConfig.confidence.provisional_base;
  const margin = Number(state.stage_one?.score_margin ?? 0);
  const score = roundScore(clamp(
    base + Math.max(0, margin) * forecastConfig.confidence.margin_scale,
    forecastConfig.confidence.minimum,
    forecastConfig.confidence.maximum
  ), 3);
  const level = score >= forecastConfig.confidence.high_threshold
    ? "high"
    : score >= forecastConfig.confidence.medium_threshold ? "medium" : "low";
  return { score, level, lock_status: state.lock.status };
}

function signalStrength(score, forecastConfig) {
  const magnitude = Math.abs(score);
  if (magnitude >= forecastConfig.strength_thresholds.high) return "high";
  if (magnitude >= forecastConfig.strength_thresholds.medium) return "medium";
  return "low";
}

function monthlyForecastWindows(state, startDate, endDate, domainIds, forecastConfig) {
  const selected = state.lock.selected_chart;
  const alternatives = state.lock.alternatives ?? [];
  const windows = [];
  for (let offset = 0; offset <= forecastConfig.maximum_horizon_months; offset += 1) {
    const calendarStart = firstDayOfMonth(startDate, offset);
    const windowStart = offset === 0 ? startDate : calendarStart;
    if (windowStart > endDate) break;
    const nextMonth = firstDayOfMonth(startDate, offset + 1);
    const windowEnd = earlierDate(addDays(nextMonth, -1), endDate);
    const parsed = new Date(`${calendarStart}T00:00:00.000Z`);
    const monthNumber = parsed.getUTCMonth() + 1;
    const seasonalBranch = forecastConfig.month_branch_by_gregorian_month[String(monthNumber)];
    const signal = primaryForecastRelation(selected.branch, seasonalBranch, forecastConfig);
    const domainSignals = domainIds.map((domainId) => {
      const definition = forecastConfig.domain_definitions[domainId];
      const multiplier = forecastConfig.domain_profile_multipliers[definition.profile][signal.kind];
      const score = roundScore(signal.score * multiplier, 3);
      return {
        domain_id: domainId,
        label: definition.label,
        profile: definition.profile,
        direction: signal.kind,
        score,
        strength: signalStrength(score, forecastConfig)
      };
    });
    const alternativeKinds = alternatives.map((candidate) => primaryForecastRelation(candidate.branch, seasonalBranch, forecastConfig).kind);
    const agreementCount = 1 + alternativeKinds.filter((kind) => kind === signal.kind).length;
    windows.push({
      window_id: `${calendarStart.slice(0, 7)}_${seasonalBranch}`,
      month_label: `${parsed.getUTCFullYear()}年${monthNumber}月`,
      start_date: windowStart,
      end_date: windowEnd,
      seasonal_branch: seasonalBranch,
      seasonal_branch_label: BRANCH_LABELS[seasonalBranch],
      relation: signal.relation,
      relation_label: signal.label,
      kind: signal.kind,
      score: roundScore(signal.score, 3),
      strength: signalStrength(signal.score, forecastConfig),
      domain_signals: domainSignals,
      sensitivity: {
        agreement_count: agreementCount,
        compared_chart_count: 1 + alternatives.length,
        alternative_kinds: alternativeKinds
      }
    });
  }
  return windows;
}

function selectHeadlineWindows(windows, forecastConfig) {
  const support = windows
    .filter((window) => window.kind === "support")
    .sort((left, right) => right.score - left.score || left.start_date.localeCompare(right.start_date))
    .slice(0, forecastConfig.window_selection.support_count);
  const transition = windows
    .filter((window) => window.kind === "transition")
    .sort((left, right) => left.score - right.score || left.start_date.localeCompare(right.start_date))
    .slice(0, forecastConfig.window_selection.transition_count);
  return { support: copy(support), transition: copy(transition) };
}

function domainForecasts(domainIds, windows, confidence, forecastConfig) {
  return domainIds.map((domainId) => {
    const definition = forecastConfig.domain_definitions[domainId];
    const signals = windows.map((window) => ({
      window,
      signal: window.domain_signals.find((item) => item.domain_id === domainId)
    }));
    const support = signals
      .filter((item) => item.signal.direction === "support")
      .sort((left, right) => right.signal.score - left.signal.score)[0] ?? null;
    const transition = signals
      .filter((item) => item.signal.direction === "transition")
      .sort((left, right) => left.signal.score - right.signal.score)[0] ?? null;
    return {
      domain_id: domainId,
      label: definition.label,
      profile: definition.profile,
      confidence: copy(confidence),
      support_window: support ? {
        start_date: support.window.start_date,
        end_date: support.window.end_date,
        month_label: support.window.month_label,
        relation_label: support.window.relation_label,
        strength: support.signal.strength,
        score: support.signal.score
      } : null,
      transition_window: transition ? {
        start_date: transition.window.start_date,
        end_date: transition.window.end_date,
        month_label: transition.window.month_label,
        relation_label: transition.window.relation_label,
        strength: transition.signal.strength,
        score: transition.signal.score
      } : null
    };
  });
}

export function buildLocalForecast(state, request = {}, runtimeConfig) {
  if (!state.lock?.selected_chart) throw new Error("Lock a working chart before creating a forecast scenario.");
  const { questionBank, browser } = runtimeParts(runtimeConfig);
  const currentDate = isoDate(request.current_date ?? request.currentDate);
  const requestedHorizon = Number(request.horizon_months ?? request.horizonMonths ?? browser.forecast.default_horizon_months);
  const horizonMonths = clamp(
    Number.isFinite(requestedHorizon) ? Math.round(requestedHorizon) : browser.forecast.default_horizon_months,
    browser.forecast.minimum_horizon_months,
    browser.forecast.maximum_horizon_months
  );
  const contextById = new Map(getContextQuestions(questionBank).map((question) => [question.id, question]));
  const contextFacts = Object.entries(state.answers.context).map(([questionId, value]) => ({
    question_id: questionId,
    label: contextById.get(questionId)?.title ?? questionId,
    value: copy(value)
  }));
  const selected = copy(state.lock.selected_chart);
  const forecastConfig = browser.forecast;
  const question = typeof request.question === "string" ? request.question.trim() : "";
  const domainIds = selectedForecastDomains(contextFacts, question, forecastConfig);
  const confidence = forecastConfidence(state, forecastConfig);
  const endDate = addMonths(currentDate, horizonMonths);
  const windows = monthlyForecastWindows(state, currentDate, endDate, domainIds, forecastConfig);
  const headlineWindows = selectHeadlineWindows(windows, forecastConfig);

  return {
    forecast_type: "deterministic_branch_cycle_forecast",
    generated_for_date: currentDate,
    horizon: {
      months: horizonMonths,
      start_date: currentDate,
      end_date: endDate
    },
    selected_structure: selected,
    initial_conditions: contextFacts,
    question,
    scenario: {
      mode: "branch_cycle_forecast",
      summary: `未来 ${horizonMonths} 个月的窗口由锁定时支与逐月季节支关系确定性推导，再按现实关注领域解释。`,
      focus_areas: domainIds.map((domainId) => copy(forecastConfig.domain_definitions[domainId])),
      structure_anchor: `${selected.hour_label} / ${selected.branch}`,
      confidence
    },
    monthly_windows: windows,
    headline_windows: headlineWindows,
    domain_forecasts: domainForecasts(domainIds, windows, confidence, forecastConfig),
    limitations: [
      "这是按锁定时支与逐月季节支关系生成的本地确定性推演，不是完整四柱、大运与流年排盘。",
      "公开浏览器版以公历月份近似季节支边界，未执行节气日的精确切换。",
      state.lock.status === "provisional"
        ? "当前工作时辰为暂定结果；候选时辰变化可能改变窗口方向。"
        : "工作时辰已达到本次会话的稳定门，但仍不等于客观真值。",
      "窗口表示相对支持或调整压力，不代表事件必然发生，也不能替代医疗、法律或财务判断。"
    ],
    policy: {
      ai_used_for_ranking: false,
      ai_used_for_forecast: false,
      selected_chart_modified_by_context: false,
      data_leaves_browser: false,
      calendar_basis: "gregorian_month_to_seasonal_branch_approximation"
    }
  };
}

export const createInitialState = createSession;
export const selectNextQuestion = getNextQuestion;
export const applyAnswer = answerQuestion;
export const lockChart = lockWorkingChart;
export const createForecast = buildLocalForecast;
