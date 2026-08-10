import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createRuntimeConfig } from "../scripts/buildPublicConfig.ts";
import {
  answerQuestion,
  buildLocalForecast,
  createSession,
  getNextQuestion,
  getStageOneQuestions,
  lockWorkingChart,
  normalizeIntake,
  scoreSession
} from "../site/engine.js";

const runtimePath = fileURLToPath(new URL("../site/data/runtime-config.json", import.meta.url));
const enginePath = fileURLToPath(new URL("../site/engine.js", import.meta.url));

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
  assert.equal(first.scenario.mode, "degraded_context_planning_scenario");
  assert.match(first.scenario.summary, /not a calculated fate prediction/i);
  assert.equal(first.policy.ai_used_for_ranking, false);
  assert.equal(first.policy.ai_used_for_forecast, false);
});

test("engine keeps hostile text as data and has no DOM, HTML, network, or AI provider path", () => {
  const config = runtimeConfig();
  const locked = lockWorkingChart(completeStageOne(config), config);
  const hostile = '<img src=x onerror="globalThis.pwned=true">';
  const withContext = answerQuestion(locked, "D7_inner_preferred_direction", hostile, config);
  const forecast = buildLocalForecast(withContext, { current_date: "2026-08-10" }, config);
  const source = readFileSync(enginePath, "utf8");

  assert.equal(forecast.initial_conditions[0].value, hostile);
  for (const forbidden of [/innerHTML/, /outerHTML/, /document\./, /fetch\s*\(/, /XMLHttpRequest/, /WebSocket/, /openai/i, /anthropic/i]) {
    assert.equal(forbidden.test(source), false, `engine source matched forbidden pattern ${forbidden}`);
  }
});
