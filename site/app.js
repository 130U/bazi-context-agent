import {
  answerQuestion,
  buildLocalForecast,
  createSession,
  getNextQuestion,
  lockWorkingChart,
  scoreSession,
  validateRuntimeConfig
} from "./engine.js";
import { clear, make, text } from "./ui/dom.js";
import { renderForecastView } from "./ui/forecast-view.js";
import { BRANCH_GLYPHS, HORIZON_MONTHS, PURPOSES } from "./ui/labels.js";
import { clearKnownStorage } from "./ui/privacy.js";

const MAX_RUNTIME_CONFIG_BYTES = 100_000;

const els = {
  intakeForm: document.getElementById("intake-form"),
  intakeError: document.getElementById("intake-error"),
  questionForm: document.getElementById("question-form"),
  contextForm: document.getElementById("context-form"),
  forecastForm: document.getElementById("forecast-form"),
  toast: document.getElementById("toast"),
  privacyDialog: document.getElementById("privacy-dialog")
};

let runtimeConfig = null;
let session = null;
let forecast = null;
let currentQuestion = null;
let currentContextQuestion = null;
let previousCandidateScores = new Map();
let toastTimer = 0;

function showView(name) {
  document.querySelectorAll("[data-view]").forEach((view) => {
    const active = view.dataset.view === name;
    view.hidden = !active;
    view.classList.toggle("is-active", active);
  });
  const stageTwo = ["context", "forecast-intake", "forecast"].includes(name);
  document.querySelectorAll("[data-phase-link]").forEach((link) => {
    const active = link.dataset.phaseLink === (stageTwo ? "stage2" : "stage1");
    link.classList.toggle("is-active", active);
    if (active) link.setAttribute("aria-current", "step");
    else link.removeAttribute("aria-current");
  });
  const stageTwoButton = document.querySelector('[data-phase-link="stage2"]');
  if (stageTwoButton) stageTwoButton.disabled = !session?.lock;
  window.scrollTo({ top: 0, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
}

function showToast(message) {
  window.clearTimeout(toastTimer);
  els.toast.textContent = message;
  els.toast.classList.add("is-visible");
  toastTimer = window.setTimeout(() => els.toast.classList.remove("is-visible"), 2800);
}

function setCertainty(value) {
  const radio = els.intakeForm.querySelector(`input[name="certainty"][value="${value}"]`);
  if (radio) radio.checked = true;
  updateTimeVisibility();
}

function updateTimeVisibility() {
  const certainty = els.intakeForm.querySelector('input[name="certainty"]:checked')?.value;
  const wrapper = document.querySelector("[data-time-fields]");
  const input = document.getElementById("birth-time");
  const hidden = certainty === "unsure";
  wrapper.hidden = hidden;
  input.required = !hidden;
  if (hidden) input.value = "";
}

function renderQuestionForm(form, question, savedValue) {
  clear(form);
  form.dataset.questionId = question.id;
  const type = question.inputType;

  if (type === "single_choice" || type === "multi_choice") {
    const options = make("div", "answer-options");
    const selected = Array.isArray(savedValue) ? new Set(savedValue) : new Set([savedValue]);
    (question.options ?? []).forEach((option) => {
      const id = typeof option === "string" ? option : option.id;
      const labelText = typeof option === "string" ? option : option.label;
      const label = make("label", "answer-option");
      const input = document.createElement("input");
      input.type = type === "single_choice" ? "radio" : "checkbox";
      input.name = "answer";
      input.value = id;
      input.checked = selected.has(id);
      label.append(input, make("span", "", labelText));
      options.append(label);
    });
    form.append(options);
  } else if (type === "year_event_list") {
    const editor = make("div", "event-editor");
    editor.dataset.maxItems = String(question.maxItems ?? 3);
    const existing = Array.isArray(savedValue) && savedValue.length ? savedValue : [{ year: "", description: "" }];
    existing.forEach((item) => addEventRow(editor, item));
    const add = make("button", "secondary-button event-add", "＋ 添加另一个年份");
    add.type = "button";
    add.addEventListener("click", () => {
      if (editor.querySelectorAll(".event-row").length < Number(editor.dataset.maxItems)) addEventRow(editor, {});
      if (editor.querySelectorAll(".event-row").length >= Number(editor.dataset.maxItems)) add.disabled = true;
    });
    form.append(editor, add);
  } else {
    const stack = make("div", "answer-input-stack");
    const input = type === "short_text" ? document.createElement("textarea") : document.createElement("input");
    input.name = "answer";
    input.value = typeof savedValue === "string" ? savedValue : "";
    if (type === "date") input.type = "date";
    else if (type === "time_or_range") input.type = "time";
    else {
      input.rows = 4;
      input.maxLength = question.maxLength ?? 500;
      input.placeholder = "可以简短回答；不知道或不愿回答也可以跳过。";
    }
    stack.append(input);
    form.append(stack);
  }
  const error = make("div", "answer-error");
  error.setAttribute("role", "alert");
  form.append(error);
}

function addEventRow(editor, item = {}) {
  const row = make("div", "event-row");
  const year = document.createElement("input");
  year.type = "number";
  year.className = "event-year";
  year.inputMode = "numeric";
  year.min = "1900";
  year.max = String(new Date().getFullYear());
  year.placeholder = "年份";
  year.value = item.year ?? "";
  year.setAttribute("aria-label", "事件年份");
  const description = document.createElement("input");
  description.type = "text";
  description.className = "event-description";
  description.maxLength = 120;
  description.placeholder = "发生了什么（可选）";
  description.value = item.description ?? "";
  description.setAttribute("aria-label", "事件说明");
  const remove = make("button", "event-remove", "×");
  remove.type = "button";
  remove.setAttribute("aria-label", "移除这个事件");
  remove.addEventListener("click", () => row.remove());
  row.append(year, description, remove);
  editor.append(row);
}

function readQuestionValue(form, question) {
  if (question.inputType === "single_choice") return form.querySelector('input[name="answer"]:checked')?.value ?? "";
  if (question.inputType === "multi_choice") return [...form.querySelectorAll('input[name="answer"]:checked')].map((input) => input.value);
  if (question.inputType === "year_event_list") {
    return [...form.querySelectorAll(".event-row")]
      .map((row) => ({
        year: row.querySelector(".event-year").value,
        description: row.querySelector(".event-description").value.trim(),
        event_type: question.eventType,
        importance: "medium"
      }))
      .filter((item) => item.year)
      .map((item) => ({ ...item, year: Number(item.year) }));
  }
  return form.querySelector('[name="answer"]')?.value.trim() ?? "";
}

function renderCandidates() {
  const list = document.getElementById("candidate-list");
  clear(list);
  const candidates = session?.candidates?.slice(0, 5) ?? [];
  const maximum = Math.max(...candidates.map((candidate) => candidate.total_score), 1);
  candidates.forEach((candidate, index) => {
    const row = make("div", "candidate-row");
    row.append(make("span", "candidate-rank", String(index + 1).padStart(2, "0")));
    const copy = make("div", "candidate-copy");
    const title = make("div", "candidate-title");
    title.append(make("strong", "", candidate.hour_label), make("span", "", candidate.representative_time));
    const track = make("div", "candidate-track");
    const bar = document.createElement("span");
    bar.style.width = `${Math.max(4, (candidate.total_score / maximum) * 100)}%`;
    track.append(bar);
    copy.append(title, track);
    row.append(copy, make("strong", "candidate-score", candidate.total_score.toFixed(3)));
    list.append(row);
  });

  text("candidate-count", String(session?.candidates?.length ?? 0));
  const eventCount = Object.entries(session?.answers?.stage_one ?? {})
    .filter(([id, value]) => id.startsWith("C") && Array.isArray(value))
    .reduce((sum, [, value]) => sum + value.length, 0);
  text("event-count", String(eventCount));
  const maximumQuestions = session?.stage_one?.maximum_questions ?? 17;
  text("evidence-coverage", `${Math.round(((session?.stage_one?.question_count ?? 0) / maximumQuestions) * 100)}%`);

  const deltas = candidates.slice(0, 3).map((candidate) => {
    const previous = previousCandidateScores.get(candidate.candidate_id);
    const delta = previous === undefined ? 0 : candidate.total_score - previous;
    return `${candidate.hour_label} ${delta >= 0 ? "+" : ""}${delta.toFixed(3)}`;
  });
  text("evidence-delta", deltas.length ? deltas.join(" · ") : "首轮基线已建立。");
  previousCandidateScores = new Map((session?.candidates ?? []).map((candidate) => [candidate.candidate_id, candidate.total_score]));
}

function renderStageOne() {
  currentQuestion = getNextQuestion(session, runtimeConfig);
  if (!currentQuestion || currentQuestion.id.startsWith("D")) {
    renderReview();
    return;
  }
  const [purpose, help] = PURPOSES[currentQuestion.id[0]] ?? PURPOSES.B;
  text("question-purpose", purpose);
  text("question-title", currentQuestion.title);
  text("question-help", help);
  const count = session.stage_one.question_count;
  const max = session.stage_one.maximum_questions;
  text("question-counter", `证据问题 ${Math.min(count + 1, max)} / ${max}`);
  text("question-stage-label", currentQuestion.id.startsWith("C") ? "重大年份回测" : "建立弱先验");
  const progress = document.querySelector(".progress-track");
  progress.setAttribute("aria-valuemax", String(max));
  progress.setAttribute("aria-valuenow", String(count));
  document.getElementById("question-progress-bar").style.width = `${(count / max) * 100}%`;
  text("reasoning-copy", count ? "上一项证据已计入。确定性引擎已重新比较候选。" : "候选时辰已建立。下一题将补充配置顺序中的证据。");
  renderQuestionForm(els.questionForm, currentQuestion, session.answers.stage_one[currentQuestion.id]);
  renderCandidates();
  showView("questions");
  document.getElementById("question-title").focus?.({ preventScroll: true });
}

function submitStageOne(valueOverride) {
  if (!currentQuestion) return;
  const error = els.questionForm.querySelector(".answer-error");
  try {
    const value = valueOverride ?? readQuestionValue(els.questionForm, currentQuestion);
    if (currentQuestion.required && (value === "" || (Array.isArray(value) && !value.length))) {
      error.textContent = "请回答这一题，或选择“暂不回答”。";
      return;
    }
    session = answerQuestion(session, currentQuestion.id, value || "skip", runtimeConfig);
    renderStageOne();
  } catch (problem) {
    error.textContent = problem.message;
  }
}

function reopenStageOne(questionId) {
  if (!questionId || session.lock) return;
  const draft = structuredClone(session);
  delete draft.answers.stage_one[questionId];
  draft.stage_one.asked_question_ids = draft.stage_one.asked_question_ids.filter((id) => id !== questionId);
  draft.stage_one.question_count = draft.stage_one.asked_question_ids.length;
  session = scoreSession(draft, runtimeConfig);
  renderStageOne();
}

function renderReview() {
  const top = session.candidates[0];
  const stable = session.stage_one.stable;
  text("selected-branch-glyph", BRANCH_GLYPHS[top.branch] ?? top.branch);
  text("selected-branch-name", `${top.hour_label} · ${top.branch}`);
  text("selected-window", `候选代表时间 ${top.representative_time} · 来源 ${top.source === "unknown_symmetric" ? "十二时辰对称比较" : "记录时间及相邻边界"}`);
  text("selected-confidence", `${Math.round(top.total_score * 100)} / 100`);
  text("selected-gap", session.stage_one.score_margin?.toFixed(3) ?? "—");
  text("selected-answers", `${session.stage_one.question_count} 题`);
  const badge = document.getElementById("stability-badge");
  badge.textContent = stable ? "达到稳定门" : "暂定结构";
  badge.classList.toggle("is-stable", stable);
  text("review-intro", stable
    ? "当前答案已满足配置中的题数、事件覆盖与领先差条件；仍然是本次会话的工作结构，不是客观真值。"
    : "已达到问题上限，但证据还不足以形成稳定领先。你可以带着暂定结构进入敏感性更高的 Stage 2。"
  );

  const candidateContainer = document.getElementById("review-candidates");
  clear(candidateContainer);
  session.candidates.slice(0, 3).forEach((candidate) => {
    const card = make("article", "candidate-review-card");
    const glyph = make("span", "branch", BRANCH_GLYPHS[candidate.branch] ?? candidate.branch);
    const details = make("div");
    details.append(make("strong", "", candidate.hour_label));
    details.append(make("p", "", `记录 ${candidate.components.birth_record.toFixed(2)} · 传统线索 ${candidate.components.symbol_prior.toFixed(2)} · 事件 ${candidate.components.event_backtest.toFixed(2)}`));
    card.append(glyph, details, make("strong", "", candidate.total_score.toFixed(3)));
    candidateContainer.append(card);
  });

  const reasons = document.getElementById("stability-reasons");
  clear(reasons);
  [
    `已完成 ${session.stage_one.question_count} / ${session.stage_one.maximum_questions} 个配置问题。`,
    `有内容的事件类别：${session.stage_one.event_answer_count ?? 0}；事件分量是最高权重。`,
    `Top 1 领先差 ${session.stage_one.score_margin?.toFixed(3) ?? "0.000"}。`,
    stable ? "满足稳定门，可以锁定工作结构。" : "未满足全部稳定门；锁定后会明确标记 provisional。"
  ].forEach((reason) => reasons.append(make("li", "", reason)));
  showView("review");
}

function renderContext() {
  currentContextQuestion = getNextQuestion(session, runtimeConfig);
  if (!currentContextQuestion) {
    showView("forecast-intake");
    return;
  }
  const ordered = runtimeConfig.question_bank.context_policy.question_order;
  const answered = Object.keys(session.answers.context).length;
  text("context-counter", `现实问题 ${answered + 1} / ${ordered.length}`);
  text("context-question-title", currentContextQuestion.title);
  text("context-question-help", PURPOSES.D[1]);
  renderQuestionForm(els.contextForm, currentContextQuestion, session.answers.context[currentContextQuestion.id]);
  showView("context");
}

function submitContext(valueOverride) {
  if (!currentContextQuestion) return;
  const error = els.contextForm.querySelector(".answer-error");
  try {
    const value = valueOverride ?? readQuestionValue(els.contextForm, currentContextQuestion);
    session = answerQuestion(session, currentContextQuestion.id, value || "skip", runtimeConfig);
    renderContext();
  } catch (problem) {
    error.textContent = problem.message;
  }
}

function previousContext() {
  const ids = runtimeConfig.question_bank.context_policy.question_order.filter((id) => session.answers.context[id] !== undefined);
  const questionId = ids.at(-1);
  if (!questionId) return;
  delete session.answers.context[questionId];
  renderContext();
}

function renderForecast(request) {
  forecast = buildLocalForecast(session, request, runtimeConfig);
  renderForecastView(forecast, session, runtimeConfig);
  showView("forecast");
}

function exportSession() {
  const payload = { exported_at: new Date().toISOString(), session, forecast };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "bazi-context-session.json";
  link.click();
  URL.revokeObjectURL(url);
}

function clearSensitiveDom() {
  els.intakeForm.reset();
  els.forecastForm.reset();
  clear(els.questionForm);
  clear(els.contextForm);
  [
    "candidate-list", "review-candidates", "stability-reasons", "evidence-delta",
    "derivative-basis", "initial-basis", "event-basis", "forecast-timeline-list",
    "forecast-domain-list", "forecast-uncertainty-list"
  ].forEach((id) => clear(document.getElementById(id)));
  [
    "question-title", "context-question-title", "forecast-question-display", "forecast-summary-copy",
    "forecast-generated-at", "forecast-chart", "forecast-error", "selected-branch-name", "selected-window",
    "selected-confidence", "selected-gap", "selected-answers", "selected-branch-glyph", "candidate-count",
    "event-count", "evidence-coverage", "question-counter", "context-counter"
  ].forEach((id) => text(id, ""));
  if (els.privacyDialog.open) els.privacyDialog.close();
  updateTimeVisibility();
}

function purgeSessionData() {
  session = null;
  forecast = null;
  currentQuestion = null;
  currentContextQuestion = null;
  previousCandidateScores = new Map();
  clearSensitiveDom();
}

function resetSession() {
  clearKnownStorage();
  purgeSessionData();
  showView("welcome");
  showToast("本次会话已从当前标签页清除。");
}

function bindEvents() {
  els.intakeForm.addEventListener("change", (event) => {
    if (event.target.name === "certainty") updateTimeVisibility();
  });
  els.intakeForm.addEventListener("submit", (event) => {
    event.preventDefault();
    els.intakeError.textContent = "";
    const data = new FormData(els.intakeForm);
    const certainty = data.get("certainty");
    if (!data.get("birthDate") || !data.get("birthplace") || !certainty || !data.get("chartSex")) {
      els.intakeError.textContent = "请填写出生日期、地点、时间确定程度和传统排盘用性别。";
      return;
    }
    if (certainty !== "unsure" && !data.get("recordedTime")) {
      els.intakeError.textContent = "请填写记忆中的时间，或选择 Unsure。";
      return;
    }
    session = createSession(runtimeConfig, {
      birth_date: data.get("birthDate"),
      birthplace: data.get("birthplace"),
      recorded_time: certainty === "unsure" ? "unsure" : data.get("recordedTime"),
      uncertainty_range: certainty === "exact" ? "recorded_only" : certainty === "approximate" ? "adjacent_1_shichen" : "full_day",
      boundary_flags: data.getAll("boundaryFlags"),
      chart_sex: data.get("chartSex")
    });
    renderStageOne();
  });

  els.forecastForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const question = document.getElementById("forecast-question").value.trim();
    if (!question) {
      text("forecast-error", "请写下一个希望观察的问题。");
      return;
    }
    text("forecast-error", "");
    const horizon = els.forecastForm.querySelector('input[name="horizon"]:checked')?.value ?? "12_months";
    renderForecast({ question, horizon_months: HORIZON_MONTHS[horizon], current_date: new Date().toISOString().slice(0, 10) });
  });

  document.addEventListener("click", (event) => {
    const trigger = event.target.closest("[data-action]");
    if (!trigger) return;
    const action = trigger.dataset.action;
    if (action === "begin") { showView("intake"); setCertainty("approximate"); }
    if (action === "back-welcome" || action === "home" || action === "exit-session") resetSession();
    if (action === "submit-answer") submitStageOne();
    if (action === "skip-question") submitStageOne("skip");
    if (action === "previous-question") reopenStageOne(session?.stage_one?.asked_question_ids?.at(-1));
    if (action === "toggle-evidence") {
      const delta = document.getElementById("evidence-delta");
      delta.hidden = !delta.hidden;
      trigger.setAttribute("aria-expanded", String(!delta.hidden));
      trigger.querySelector("span").textContent = delta.hidden ? "＋" : "−";
    }
    if (action === "review-answers") reopenStageOne(session?.stage_one?.asked_question_ids?.at(-1));
    if (action === "lock-chart") {
      try { session = lockWorkingChart(session, runtimeConfig); renderContext(); }
      catch (problem) { showToast(problem.message); }
    }
    if (action === "submit-context") submitContext();
    if (action === "skip-context") submitContext("skip");
    if (action === "previous-context") previousContext();
    if (action === "new-forecast") showView("forecast-intake");
    if (action === "export-session") exportSession();
    if (action === "print-report") window.print();
    if (action === "open-privacy") els.privacyDialog.showModal();
  });
}

async function loadRuntimeConfig() {
  const response = await fetch("./data/runtime-config.json", { cache: "no-store", credentials: "same-origin" });
  if (!response.ok) throw new Error(`runtime config ${response.status}`);
  const advertisedBytes = Number(response.headers.get("content-length"));
  if (Number.isFinite(advertisedBytes) && advertisedBytes > MAX_RUNTIME_CONFIG_BYTES) {
    throw new Error("runtime config exceeds the public size limit");
  }
  const source = await response.text();
  if (new TextEncoder().encode(source).byteLength > MAX_RUNTIME_CONFIG_BYTES) {
    throw new Error("runtime config exceeds the public size limit");
  }
  const config = JSON.parse(source);
  validateRuntimeConfig(config);
  return config;
}

async function start() {
  clearKnownStorage();
  try {
    runtimeConfig = await loadRuntimeConfig();
    bindEvents();
    updateTimeVisibility();
  } catch (problem) {
    console.error(problem);
    showToast("运行配置载入失败；请刷新页面或查看构建状态。");
    document.querySelectorAll("button").forEach((button) => { if (!button.closest("dialog")) button.disabled = true; });
  }
}

window.addEventListener("pagehide", () => {
  clearKnownStorage();
  purgeSessionData();
});

window.addEventListener("pageshow", (event) => {
  if (event.persisted) resetSession();
});

start();
