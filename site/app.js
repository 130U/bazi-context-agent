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
import {
  readIntakeForm,
  readQuestionValue,
  renderIntakeForm,
  renderQuestionForm,
  updateIntakeTimeState,
  validateIntakeForm
} from "./ui/forms.js";
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
let privacyReturnTarget = null;

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
  window.scrollTo({ top: 0, behavior: "auto" });
  const activeView = document.querySelector(`[data-view="${name}"]`);
  const heading = activeView?.querySelector("h1, h2");
  if (heading) {
    heading.tabIndex = -1;
    heading.focus({ preventScroll: true });
  }
}

function showToast(message) {
  window.clearTimeout(toastTimer);
  els.toast.textContent = message;
  els.toast.classList.add("is-visible");
  toastTimer = window.setTimeout(() => els.toast.classList.remove("is-visible"), 2800);
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
    bar.style.transform = `scaleX(${Math.max(0.04, candidate.total_score / maximum)})`;
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
  text("evidence-delta", deltas.length ? deltas.join("；") : "首轮基线已建立。");
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
  document.getElementById("question-progress-bar").style.transform = `scaleX(${count / max})`;
  text("reasoning-copy", count ? "上一项证据已计入。确定性引擎已重新比较候选。" : "候选时辰已建立。下一题将补充配置顺序中的证据。");
  renderQuestionForm(els.questionForm, currentQuestion, session.answers.stage_one[currentQuestion.id]);
  renderCandidates();
  showView("questions");
}

function submitStageOne(valueOverride) {
  if (!currentQuestion) return;
  const error = els.questionForm.querySelector(".answer-error");
  try {
    const value = valueOverride ?? readQuestionValue(els.questionForm, currentQuestion);
    if (currentQuestion.required && (value === "" || (Array.isArray(value) && !value.length))) {
      error.textContent = "请回答这一题，或选择“暂不回答”。";
      const firstControl = els.questionForm.querySelector("input, textarea, select");
      firstControl?.setAttribute("aria-invalid", "true");
      firstControl?.focus();
      return;
    }
    els.questionForm.querySelectorAll("[aria-invalid]").forEach((control) => control.removeAttribute("aria-invalid"));
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
  text("selected-branch-name", top.hour_label);
  text("selected-window", `候选代表时间 ${top.representative_time}，来源：${top.source === "unknown_symmetric" ? "十二时辰对称比较" : "记录时间及相邻边界"}`);
  text("selected-confidence", `${Math.round(top.total_score * 100)} / 100`);
  text("selected-gap", session.stage_one.score_margin?.toFixed(3) ?? "待生成");
  text("selected-answers", `${session.stage_one.question_count} 题`);
  const badge = document.getElementById("stability-badge");
  badge.textContent = stable ? "达到稳定门" : "暂定结构";
  badge.classList.toggle("is-stable", stable);
  text("review-intro", stable
    ? "当前答案已满足配置中的题数、事件覆盖与领先差条件；仍然是本次会话的工作结构，不是客观真值。"
    : "已达到问题上限，但证据还不足以形成稳定领先。你可以带着暂定结构进入现实信息框。"
  );

  const candidateContainer = document.getElementById("review-candidates");
  clear(candidateContainer);
  session.candidates.slice(0, 3).forEach((candidate) => {
    const card = make("article", "candidate-review-card");
    const glyph = make("span", "branch", BRANCH_GLYPHS[candidate.branch] ?? candidate.branch);
    const details = make("div");
    details.append(make("strong", "", candidate.hour_label));
    details.append(make("p", "", `记录 ${candidate.components.birth_record.toFixed(2)}；传统线索 ${candidate.components.symbol_prior.toFixed(2)}；事件 ${candidate.components.event_backtest.toFixed(2)}`));
    card.append(glyph, details, make("strong", "", candidate.total_score.toFixed(3)));
    candidateContainer.append(card);
  });

  const reasons = document.getElementById("stability-reasons");
  clear(reasons);
  [
    `已完成 ${session.stage_one.question_count} / ${session.stage_one.maximum_questions} 个配置问题。`,
    `有内容的事件类别：${session.stage_one.event_answer_count ?? 0}；事件分量是最高权重。`,
    `首位候选领先差 ${session.stage_one.score_margin?.toFixed(3) ?? "0.000"}。`,
    stable ? "满足稳定门，可以锁定工作结构。" : "未满足全部稳定门；锁定后会明确标记为暂定结构。"
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
  if (runtimeConfig) renderIntakeForm(els.intakeForm, runtimeConfig);
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
  els.privacyDialog.addEventListener("cancel", (event) => {
    event.preventDefault();
    els.privacyDialog.close();
  });
  els.privacyDialog.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      event.preventDefault();
      els.privacyDialog.close();
    }
  });
  els.privacyDialog.addEventListener("close", () => {
    privacyReturnTarget?.focus();
    privacyReturnTarget = null;
  });
  els.intakeForm.addEventListener("change", (event) => {
    updateIntakeTimeState(els.intakeForm, event.target);
  });
  els.intakeForm.addEventListener("submit", (event) => {
    event.preventDefault();
    els.intakeError.textContent = "";
    const missingQuestion = validateIntakeForm(els.intakeForm, runtimeConfig);
    if (missingQuestion) {
      els.intakeError.textContent = `请补充“${missingQuestion}”，不确定时可选择配置提供的不确定选项。`;
      return;
    }
    session = createSession(runtimeConfig, readIntakeForm(els.intakeForm));
    renderStageOne();
  });

  els.forecastForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const question = document.getElementById("forecast-question").value.trim();
    if (!question) {
      text("forecast-error", "请写下一个希望观察的问题。");
      document.getElementById("forecast-question").setAttribute("aria-invalid", "true");
      document.getElementById("forecast-question").focus();
      return;
    }
    document.getElementById("forecast-question").removeAttribute("aria-invalid");
    text("forecast-error", "");
    const horizon = els.forecastForm.querySelector('input[name="horizon"]:checked')?.value ?? "12_months";
    renderForecast({ question, horizon_months: HORIZON_MONTHS[horizon], current_date: new Date().toISOString().slice(0, 10) });
  });

  document.addEventListener("click", (event) => {
    const trigger = event.target.closest("[data-action]");
    if (!trigger) return;
    const action = trigger.dataset.action;
    if (action === "begin") showView("intake");
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
    if (action === "open-privacy") {
      privacyReturnTarget = trigger;
      els.privacyDialog.showModal();
    }
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
    renderIntakeForm(els.intakeForm, runtimeConfig);
    bindEvents();
    const beginButton = document.querySelector('[data-action="begin"]');
    beginButton.disabled = false;
    beginButton.removeAttribute("aria-busy");
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
