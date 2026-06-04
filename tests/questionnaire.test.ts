import test from "node:test";
import assert from "node:assert/strict";
import { loadQuestionBank } from "../src/config.ts";
import { getNextQuestion, getQuestionsByLayer, isQuestionVisible, validateAnswer } from "../src/questionnaire.ts";

test("questionnaire engine reads four layers in order", () => {
  const bank = loadQuestionBank();
  assert.deepEqual(bank.stages.map((stage) => stage.id), ["birth_input", "symbol_prior", "event_backtest", "context_box"]);
  assert.equal(getQuestionsByLayer(bank, "symbol_prior")[0].id, "B1_hair_whorl");
});

test("answer validation rejects illegal option and long short text", () => {
  const bank = loadQuestionBank();
  const hairWhorl = getQuestionsByLayer(bank, "symbol_prior").find((question) => question.id === "B1_hair_whorl");
  const birthplace = getQuestionsByLayer(bank, "birth_input").find((question) => question.id === "A2_birthplace");
  assert.ok(hairWhorl);
  assert.ok(birthplace);
  assert.equal(validateAnswer(hairWhorl, "not_an_option").valid, false);
  assert.equal(validateAnswer(birthplace, "x".repeat(51)).valid, false);
});

test("condition questions visibility works", () => {
  const bank = loadQuestionBank();
  const career = getQuestionsByLayer(bank, "event_backtest").find((question) => question.id === "C7_career_years");
  const childbearing = getQuestionsByLayer(bank, "event_backtest").find((question) => question.id === "C8_childbearing_years");
  assert.ok(career);
  assert.ok(childbearing);
  assert.equal(isQuestionVisible(career, { D6_current_identity: "student" }), false);
  assert.equal(isQuestionVisible(career, { D6_current_identity: "professional" }), true);
  assert.equal(isQuestionVisible(childbearing, { childbearing_applicable: false }), false);
  assert.equal(isQuestionVisible(childbearing, { childbearing_applicable: true }), true);
});

test("getNextQuestion skips invisible conditional questions", () => {
  const bank = loadQuestionBank();
  const answers = Object.fromEntries(bank.stages.flatMap((stage) => stage.questions.map((question) => [question.id, "skip"])));
  delete answers.C7_career_years;
  delete answers.C8_childbearing_years;
  assert.equal(getNextQuestion({ bank, answers }), null);
});
