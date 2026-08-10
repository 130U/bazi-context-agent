import { clear, listItems, make, text } from "./dom.js";
import { BRANCH_GLYPHS } from "./labels.js";

function findQuestion(runtimeConfig, questionId) {
  return runtimeConfig.question_bank.stages
    .flatMap((stage) => stage.questions)
    .find((question) => question.id === questionId) ?? null;
}

function optionLabel(question, value) {
  return question?.options?.find((option) => (typeof option === "string" ? option : option.id) === value)?.label ?? String(value);
}

function displayValue(runtimeConfig, questionId, value) {
  const question = findQuestion(runtimeConfig, questionId);
  if (Array.isArray(value)) {
    return value.map((item) => (typeof item === "string" ? optionLabel(question, item) : String(item))).join("、");
  }
  return optionLabel(question, value);
}

export function renderForecastView(forecast, session, runtimeConfig) {
  const selected = forecast.selected_structure;
  const confidenceLabels = { high: "较高", medium: "中等", low: "有限" };
  const strengthLabels = { high: "强", medium: "中", low: "弱" };
  text("forecast-generated-at", forecast.generated_for_date);
  text("forecast-chart", `${selected.hour_label} · ${selected.branch}`);
  text("forecast-mode", "本地确定性时序推演");
  text("forecast-question-display", forecast.question);
  const focusLabels = forecast.domain_forecasts.map((domain) => domain.label).join("、");
  text(
    "forecast-summary-copy",
    `${forecast.scenario.summary} 本次聚焦 ${focusLabels}；推演置信度为${confidenceLabels[forecast.scenario.confidence.level]}，结果不是事件必然发生的概率。`
  );

  listItems("derivative-basis", [
    `工作时辰：${selected.hour_label}（${selected.representative_time}）`,
    `相对支持分：${selected.total_score.toFixed(3)}`,
    `锁定状态：${session.lock.status === "stable" ? "满足稳定门" : "暂定结构"}`,
    "时序口径：公历月份近似季节支，再与工作时支计算关系"
  ], "没有可用结构信息。");
  listItems(
    "initial-basis",
    forecast.initial_conditions
      .filter((fact) => fact.value !== "skip")
      .slice(0, 6)
      .map((fact) => `${fact.label}：${displayValue(runtimeConfig, fact.question_id, fact.value)}`),
    "没有提供现实上下文；情景将保持通用。"
  );
  const events = Object.entries(session.answers.stage_one)
    .filter(([id, value]) => id.startsWith("C") && Array.isArray(value))
    .flatMap(([id, values]) => values.map((event) => (
      `${event.year} · ${findQuestion(runtimeConfig, id)?.title ?? id}${event.description ? ` · ${event.description}` : ""}`
    )));
  listItems("event-basis", events.slice(0, 8), "没有提供可用的年份事件。");

  const timeline = document.getElementById("forecast-timeline-list");
  clear(timeline);
  const headlineWindows = [
    ...forecast.headline_windows.support,
    ...forecast.headline_windows.transition
  ].sort((left, right) => left.start_date.localeCompare(right.start_date));
  headlineWindows.forEach((window) => {
    const isSupport = window.kind === "support";
    const item = make("article", `timeline-window timeline-${window.kind}`);
    const eyebrow = make("div", "window-eyebrow");
    eyebrow.append(
      make("span", "window-kind", isSupport ? "相对支持" : "调整 / 承压"),
      make("span", "report-label", `${window.start_date} — ${window.end_date}`)
    );
    const relation = `工作时支 ${BRANCH_GLYPHS[selected.branch]} 与本月季节支 ${BRANCH_GLYPHS[window.seasonal_branch]} 形成${window.relation_label}`;
    const domainCopy = window.domain_signals
      .map((signal) => `${signal.label}${strengthLabels[signal.strength]}信号`)
      .join("、");
    const sensitivity = window.sensitivity.agreement_count === window.sensitivity.compared_chart_count
      ? `Top ${window.sensitivity.compared_chart_count} 候选同向`
      : `仅 ${window.sensitivity.agreement_count}/${window.sensitivity.compared_chart_count} 候选同向`;
    item.append(
      eyebrow,
      make("h3", "", `${window.month_label} · ${window.relation_label}`),
      make(
        "p",
        "",
        `${relation}。在 ${domainCopy} 上，${isSupport ? "更适合推进、连接资源与确认承诺" : "更容易出现变化、摩擦或被迫调整，重要决定宜留出回旋空间"}。`
      ),
      make("small", "window-sensitivity", sensitivity)
    );
    timeline.append(item);
  });

  const domainList = document.getElementById("forecast-domain-list");
  clear(domainList);
  forecast.domain_forecasts.forEach((domain) => {
    const card = make("article", "domain-forecast-card");
    const heading = make("div", "domain-heading");
    heading.append(
      make("h3", "", domain.label),
      make("span", `confidence-badge confidence-${domain.confidence.level}`, `${confidenceLabels[domain.confidence.level]}置信度`)
    );
    card.append(heading);
    const windows = make("div", "domain-window-pair");
    const support = make("div", "domain-window domain-window-support");
    support.append(make("span", "report-label", "推进窗口"));
    if (domain.support_window) {
      support.append(
        make("strong", "", `${domain.support_window.start_date} — ${domain.support_window.end_date}`),
        make("p", "", `${domain.support_window.relation_label}形成${strengthLabels[domain.support_window.strength]}支持信号，适合主动推进并验证外部响应。`)
      );
    } else support.append(make("p", "", "所选周期内没有出现强支持关系。"));
    const transition = make("div", "domain-window domain-window-transition");
    transition.append(make("span", "report-label", "调整窗口"));
    if (domain.transition_window) {
      transition.append(
        make("strong", "", `${domain.transition_window.start_date} — ${domain.transition_window.end_date}`),
        make("p", "", `${domain.transition_window.relation_label}形成${strengthLabels[domain.transition_window.strength]}变化信号，宜降低不可逆承诺并预留备选路径。`)
      );
    } else transition.append(make("p", "", "所选周期内没有出现强调整关系。"));
    windows.append(support, transition);
    card.append(windows);
    domainList.append(card);
  });
  listItems("forecast-uncertainty-list", [
    ...forecast.limitations,
    "相对分数表示配置规则下的支持度，不是统计概率。",
    `当前推演置信度：${confidenceLabels[forecast.scenario.confidence.level]}（${forecast.scenario.confidence.score.toFixed(3)}）；它表达证据与候选一致程度，不是命中率。`
  ], "请保留对不确定性的判断。");
}
