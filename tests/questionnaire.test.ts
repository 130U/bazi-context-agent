import test from "node:test";
import assert from "node:assert/strict";
import { loadQuestionBank } from "../src/config.ts";
import { getNextQuestion, getQuestionsByLayer, isQuestionVisible, validateAnswer } from "../src/questionnaire.ts";
import type { Question } from "../src/types.ts";

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

test("answer validation accepts prefer_not_to_say without treating it as illegal", () => {
  const bank = loadQuestionBank();
  const chartSex = getQuestionsByLayer(bank, "birth_input").find((question) => question.id === "A6_chart_sex");
  assert.ok(chartSex);

  const result = validateAnswer(chartSex, "prefer_not_to_say");

  assert.equal(result.valid, true);
  assert.equal(result.skipped, true);
  assert.equal(result.normalized, "prefer_not_to_say");
});

test("answer validation checks year_event structure directly", () => {
  const question: Question = {
    id: "test_year_event",
    title: "test",
    inputType: "year_event",
    required: true
  };

  const valid = validateAnswer(question, { year: 2020, event_type: "major_turning", description: "turning point" });
  const validWithoutDescription = validateAnswer(question, { year: 2021, event_type: "education" });
  const missingType = validateAnswer(question, { year: 2020, description: "missing type" });
  const badYear = validateAnswer(question, { year: 1800, event_type: "major_turning" });

  assert.equal(valid.valid, true);
  assert.deepEqual(valid.normalized, { year: 2020, event_type: "major_turning", description: "turning point" });
  assert.equal(validWithoutDescription.valid, true);
  assert.equal(missingType.valid, false);
  assert.equal(badYear.valid, false);
});

test("answer validation checks year_event_list structure and max item count", () => {
  const bank = loadQuestionBank();
  const majorYears = getQuestionsByLayer(bank, "event_backtest").find((question) => question.id === "C1_major_turning_years");
  assert.ok(majorYears);

  const valid = validateAnswer(majorYears, [
    { year: 2010, event_type: "major_turning" },
    { year: 2015, event_type: "education", description: "exam" },
    { year: 2020, event_type: "migration" }
  ]);
  const invalidYear = validateAnswer(majorYears, [{ year: 1800, event_type: "major_turning" }]);
  const tooMany = validateAnswer(majorYears, [
    { year: 2010, event_type: "major_turning" },
    { year: 2012, event_type: "education" },
    { year: 2014, event_type: "career" },
    { year: 2016, event_type: "relationship" }
  ]);

  assert.equal(valid.valid, true);
  assert.equal(Array.isArray(valid.normalized), true);
  assert.equal(invalidYear.valid, false);
  assert.ok(invalidYear.errors.includes("invalid_year_event"));
  assert.equal(tooMany.valid, false);
  assert.ok(tooMany.errors.includes("too_many_items"));
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
