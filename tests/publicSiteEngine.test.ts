import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { checkPublicConfig, createRuntimeConfig } from "../scripts/buildPublicConfig.ts";
import {
  answerQuestion,
  buildLocalForecast,
  createSession,
  getNextQuestion,
  getStageOneQuestions,
  lockWorkingChart,
  normalizeIntake,
  scoreSession,
  validateRuntimeConfig
} from "../site/engine.js";

const runtimePath = fileURLToPath(new URL("../site/data/runtime-config.json", import.meta.url));
const enginePath = fileURLToPath(new URL("../site/engine.js", import.meta.url));
const appPath = fileURLToPath(new URL("../site/app.js", import.meta.url));
const indexPath = fileURLToPath(new URL("../site/index.html", import.meta.url));
const stylesPath = fileURLToPath(new URL("../site/styles.css", import.meta.url));
const corePath = fileURLToPath(new URL("../site/core/", import.meta.url));
const privacyPath = fileURLToPath(new URL("../site/ui/privacy.js", import.meta.url));

function runtimeConfig() {
  return JSON.parse(readFileSync(runtimePath, "utf8"));
}

function unsureIntake() {
  return {
    birth_date: "1998-05-10",
    birthplace: "Shanghai",
    recorded_time: "unsure",
    uncertainty_range: "full_day",
    chart_sex: "female"
  };
}

function answerValue(question: { id: string; inputType: string }) {
  return question.inputType === "year_event_list" ? [] : "unknown";
}

function completeStageOne(config: ReturnType<typeof runtimeConfig>) {
  let state = createSession(config, unsureIntake());
  while (state.stage_one.question_count < state.stage_one.maximum_questions) {
    const question = getNextQuestion(state, config);
    assert.ok(question);
    state = answerQuestion(state, question.id, answerValue(question), config);
  }
  return state;
}

test("public runtime config is generated exactly from the two authority configs", () => {
  const generated = createRuntimeConfig();
  const published = runtimeConfig();
  assert.deepEqual(published, generated);
  assert.deepEqual(published.source_files, ["configs/question_bank.v1.json", "configs/scoring_weights.v1.json"]);
});

test("generated config parity is stable across LF and CRLF worktrees", () => {
  const directory = mkdtempSync(join(tmpdir(), "bazi-public-config-"));
  const path = join(directory, "runtime-config.json");
  try {
    const expected = `${JSON.stringify(createRuntimeConfig(), null, 2)}\n`;
    writeFileSync(path, expected.replace(/\n/g, "\r\n"), "utf8");
    assert.equal(checkPublicConfig(path), path);
    writeFileSync(path, expected.replace("public-runtime-config.v1", "stale-runtime-config"), "utf8");
    assert.throws(() => checkPublicConfig(path), /stale/i);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test("public runtime config rejects broken question references and weights", () => {
  const brokenQuestion = runtimeConfig();
  brokenQuestion.question_bank.adaptive_policy.question_order[0] = "missing_question";
  assert.throws(() => validateRuntimeConfig(brokenQuestion), /unknown ordered question/i);

  const brokenWeight = runtimeConfig();
  brokenWeight.scoring_weights.browser_rectification.candidate_component_weights.event_backtest = "0.55";
  assert.throws(() => validateRuntimeConfig(brokenWeight), /invalid candidate component weights/i);
});

test("unsure intake produces twelve symmetric candidates with no Zi default bias", () => {
  const config = runtimeConfig();
  const intake = normalizeIntake(unsureIntake());
  const state = createSession(config, intake);

  assert.equal(intake.time_certainty, "unknown_time");
  assert.equal(state.candidates.length, 12);
  assert.equal(new Set(state.candidates.map((candidate: { branch: string }) => candidate.branch)).size, 12);
  assert.equal(new Set(state.candidates.map((candidate: { source: string }) => candidate.source)).size, 1);
  assert.equal(new Set(state.candidates.map((candidate: { total_score: number }) => candidate.total_score)).size, 1);
  assert.equal(state.candidates.find((candidate: { branch: string }) => candidate.branch === "Zi")?.source, "unknown_symmetric");
});

test("recorded intake produces the recorded branch plus configured neighbors", () => {
  const config = runtimeConfig();
  const state = createSession(config, { ...unsureIntake(), recorded_time: "22:30", uncertainty_range: "auto" });
  assert.equal(state.candidates.length, 3);
  assert.deepEqual(new Set(state.candidates.map((candidate: { branch: string }) => candidate.branch)), new Set(["Xu", "Hai", "Zi"]));
  assert.equal(state.candidates.find((candidate: { branch: string }) => candidate.branch === "Hai")?.source, "recorded");
});

test("adaptive stage asks 15 to 17 B/C questions and permits a provisional operational lock", () => {
  const config = runtimeConfig();
  assert.equal(getStageOneQuestions(config).length, 17);
  let state = createSession(config, unsureIntake());

  for (let index = 0; index < 15; index += 1) {
    const question = getNextQuestion(state, config);
    assert.ok(question);
    assert.match(question.id, /^[BC]/);
    state = answerQuestion(state, question.id, answerValue(question), config);
  }
  assert.equal(state.stage_one.question_count, 15);
  assert.equal(state.stage_one.stable, false);
  assert.ok(getNextQuestion(state, config));
  assert.throws(() => lockWorkingChart(state, config), /not stable/i);

  for (let index = 15; index < 17; index += 1) {
    const question = getNextQuestion(state, config);
    assert.ok(question);
    state = answerQuestion(state, question.id, answerValue(question), config);
  }
  assert.equal(getNextQuestion(state, config), null);
  const locked = lockWorkingChart(state, config);
  assert.equal(locked.lock.status, "provisional");
  assert.equal(locked.lock.policy.ai_used, false);
});

test("B/C answers deterministically re-rank while D context cannot change Stage 1 scores", () => {
  const config = runtimeConfig();
  let state = createSession(config, unsureIntake());
  const initialScores = state.candidates.map((candidate: { candidate_id: string; total_score: number }) => [candidate.candidate_id, candidate.total_score]);
  state = answerQuestion(state, "B1_hair_whorl", "one_offset", config);
  state = answerQuestion(state, "C1_major_turning_years", [{ year: 2020, event_type: "major_turning", importance: "high" }], config);
  const rescored = scoreSession(state, config);
  const repeated = scoreSession(state, config);
  assert.notDeepEqual(rescored.candidates.map((candidate: { candidate_id: string; total_score: number }) => [candidate.candidate_id, candidate.total_score]), initialScores);
  assert.deepEqual(rescored, repeated);

  const lockedBase = lockWorkingChart(completeStageOne(config), config);
  const candidateSnapshot = structuredClone(lockedBase.candidates);
  const selectedSnapshot = structuredClone(lockedBase.lock.selected_chart);
  const withContext = answerQuestion(lockedBase, "D7_inner_preferred_direction", "Build a research product", config);
  assert.deepEqual(withContext.candidates, candidateSnapshot);
  assert.deepEqual(withContext.lock.selected_chart, selectedSnapshot);
});

test("local forecast changes with context and time without changing the locked chart", () => {
  const config = runtimeConfig();
  const locked = lockWorkingChart(completeStageOne(config), config);
  const selectedBefore = structuredClone(locked.lock.selected_chart);
  const firstState = answerQuestion(locked, "D7_inner_preferred_direction", "Research", config);
  const secondState = answerQuestion(locked, "D7_inner_preferred_direction", "Design", config);
  const first = buildLocalForecast(firstState, { current_date: "2026-08-10", horizon_months: 12, question: "What next?" }, config);
  const second = buildLocalForecast(secondState, { current_date: "2027-01-10", horizon_months: 18, question: "What next?" }, config);

  assert.notDeepEqual(first, second);
  assert.deepEqual(first.selected_structure, selectedBefore);
  assert.deepEqual(second.selected_structure, selectedBefore);
  assert.deepEqual(locked.lock.selected_chart, selectedBefore);
  assert.equal(first.forecast_type, "deterministic_branch_cycle_forecast");
  assert.equal(first.scenario.mode, "branch_cycle_forecast");
  assert.match(first.scenario.summary, /未来 12 个月/);
  assert.ok(first.monthly_windows.length >= 12);
  assert.ok(first.headline_windows.support.length > 0);
  assert.ok(first.headline_windows.transition.length > 0);
  assert.ok(first.domain_forecasts.length > 0);
  assert.ok(first.monthly_windows.every((window: { start_date: string; end_date: string }) => (
    window.start_date >= first.horizon.start_date && window.end_date <= first.horizon.end_date
  )));
  assert.ok(first.limitations.every((item: string) => !/planning scenario|规划情景/i.test(item)));
  assert.equal(first.policy.ai_used_for_ranking, false);
  assert.equal(first.policy.ai_used_for_forecast, false);
});

test("future windows are derived from the selected branch and expose chart sensitivity", () => {
  const config = runtimeConfig();
  const locked = lockWorkingChart(completeStageOne(config), config);
  const alternativeState = structuredClone(locked);
  alternativeState.lock.selected_chart = structuredClone(locked.lock.alternatives[0]);
  const request = { current_date: "2026-08-10", horizon_months: 12, question: "未来一年职业与合作如何？" };
  const selectedForecast = buildLocalForecast(locked, request, config);
  const alternativeForecast = buildLocalForecast(alternativeState, request, config);

  assert.notDeepEqual(
    selectedForecast.monthly_windows.map((window: { kind: string }) => window.kind),
    alternativeForecast.monthly_windows.map((window: { kind: string }) => window.kind)
  );
  assert.equal(selectedForecast.domain_forecasts[0].domain_id, "career_growth");
  assert.ok(selectedForecast.domain_forecasts[0].support_window);
  assert.ok(selectedForecast.domain_forecasts[0].transition_window);
  assert.ok(selectedForecast.monthly_windows.every((window: { sensitivity: { compared_chart_count: number } }) => (
    window.sensitivity.compared_chart_count === 3
  )));
  assert.equal(selectedForecast.policy.calendar_basis, "gregorian_month_to_seasonal_branch_approximation");
});

test("forecast horizon clamps month-end dates without rolling into the following month", () => {
  const config = runtimeConfig();
  const locked = lockWorkingChart(completeStageOne(config), config);
  const forecast = buildLocalForecast(locked, {
    current_date: "2026-01-31",
    horizon_months: 1,
    question: "下个月如何？"
  }, config);

  assert.equal(forecast.horizon.end_date, "2026-02-28");
  assert.deepEqual(forecast.monthly_windows.map((window: { start_date: string; end_date: string }) => [window.start_date, window.end_date]), [
    ["2026-01-31", "2026-01-31"],
    ["2026-02-01", "2026-02-28"]
  ]);
});

test("engine keeps hostile text as data and has no DOM, HTML, network, or AI provider path", () => {
  const config = runtimeConfig();
  const locked = lockWorkingChart(completeStageOne(config), config);
  const hostile = '<img src=x onerror="globalThis.pwned=true">';
  const withContext = answerQuestion(locked, "D7_inner_preferred_direction", hostile, config);
  const forecast = buildLocalForecast(withContext, { current_date: "2026-08-10" }, config);
  const source = [
    readFileSync(enginePath, "utf8"),
    ...readdirSync(corePath).filter((name) => name.endsWith(".js")).map((name) => readFileSync(`${corePath}/${name}`, "utf8"))
  ].join("\n");

  assert.equal(forecast.initial_conditions[0].value, hostile);
  for (const forbidden of [/innerHTML/, /outerHTML/, /document\./, /fetch\s*\(/, /XMLHttpRequest/, /WebSocket/, /openai/i, /anthropic/i]) {
    assert.equal(forbidden.test(source), false, `engine source matched forbidden pattern ${forbidden}`);
  }
});

test("public UI removes the ornamental memory cards and renders forecast windows instead of a planning checklist", () => {
  const html = readFileSync(indexPath, "utf8");
  const styles = readFileSync(stylesPath, "utf8");

  assert.doesNotMatch(html, /memory-section|memory-card|你现在记得多少|forecast-action-list/);
  assert.doesNotMatch(styles, /memory-card|orbit-stage|#74462f|#38594d|#374c68/i);
  assert.match(html, /forecast-domain-list/);
  assert.match(html, /未来的支持与调整窗口/);
  assert.match(html, /退出并清除/);
});

test("public session is memory-only and clears only known app storage keys on entry and exit", () => {
  const app = readFileSync(appPath, "utf8");
  const privacy = readFileSync(privacyPath, "utf8");
  const html = readFileSync(indexPath, "utf8");

  for (const forbidden of [
    /localStorage\.(?:setItem|getItem|clear)\s*\(/,
    /sessionStorage\.(?:setItem|getItem|clear)\s*\(/,
    /data-action="save-session"/,
    /data-action="resume"/
  ]) assert.equal(forbidden.test(`${app}\n${privacy}\n${html}`), false, `public UI matched forbidden persistence path ${forbidden}`);

  assert.match(privacy, /localStorage\.removeItem\(key\)/);
  assert.match(privacy, /sessionStorage\.removeItem\(key\)/);
  assert.match(app, /clearKnownStorage\(\);\s*\n\s*try \{/);
  assert.match(app, /addEventListener\("pagehide"/);
  assert.doesNotMatch(`${app}\n${privacy}`, /localStorage\.clear|sessionStorage\.clear/);
  assert.match(html, /不会把出生资料、人生事件或报告写入 localStorage 或 sessionStorage/);
  assert.equal((html.match(/<form[^>]+autocomplete="off"/g) ?? []).length, 4);
});

test("public entry point enforces a restrictive CSP and bounded validated config loading", () => {
  const app = readFileSync(appPath, "utf8");
  const html = readFileSync(indexPath, "utf8");

  assert.match(html, /http-equiv="Content-Security-Policy"/);
  for (const directive of ["default-src 'self'", "object-src 'none'", "base-uri 'none'", "form-action 'self'"]) {
    assert.match(html, new RegExp(directive.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
  assert.match(html, /name="referrer" content="strict-origin-when-cross-origin"/);
  assert.match(app, /MAX_RUNTIME_CONFIG_BYTES/);
  assert.match(app, /validateRuntimeConfig\(config\)/);
  assert.doesNotMatch(html, /<script(?![^>]*\bsrc=)[^>]*>/i);
  assert.doesNotMatch(html, /<[^>]+\son[a-z]+\s*=/i);
});
