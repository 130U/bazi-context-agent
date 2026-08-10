import { BRANCH_LABELS, branchRelations } from "./branches.js";
import { clamp, copy, getContextQuestions, roundScore, runtimeParts } from "./shared.js";

function validIsoDate(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

function isoDate(value) {
  return validIsoDate(value) ? value : new Date().toISOString().slice(0, 10);
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
    const alternativeKinds = alternatives.map((candidate) => (
      primaryForecastRelation(candidate.branch, seasonalBranch, forecastConfig).kind
    ));
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
