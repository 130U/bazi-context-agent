import test from "node:test";
import assert from "node:assert/strict";
import { loadQuestionBank, loadScoringConfig } from "../src/config.ts";

test("question bank loads required stages", () => {
  const bank = loadQuestionBank();
  const stageIds = bank.stages.map((stage) => stage.id);

  assert.deepEqual(stageIds, ["birth_input", "symbol_prior", "event_backtest", "context_box"]);
  assert.ok(bank.stages.every((stage) => stage.questions.length > 0));
});

test("scoring weights load and keep AI disabled before ranking", () => {
  const config = loadScoringConfig();

  assert.equal(config.candidate_score_weights.event_timing_fit, 0.55);
  assert.equal(config.candidate_score_weights.symbol_prior_fit, 0.15);
  assert.equal(config.contradiction_penalty_enabled, true);
  assert.equal(config.ai_allowed_before_candidate_ranking, false);
});
