import test from "node:test";
import assert from "node:assert/strict";
import { generateCandidateHours } from "../src/candidateGeneration.ts";
import { loadScoringConfig } from "../src/config.ts";
import { scoreEventBacktest } from "../src/eventBacktest.ts";
import { rankCandidates } from "../src/ranking.ts";
import { scoreSymbolPrior } from "../src/symbolPrior.ts";
import type { BirthInput, LifeEvent, SymbolAnswer } from "../src/types.ts";

test("ranking outputs top 3 and uses config weights", () => {
  const scoringConfig = loadScoringConfig();
  const birthInput: BirthInput = {
    birthDate: "1990-01-01",
    birthplace: "demo",
    recordedTime: "22:35",
    uncertaintyRange: "adjacent_1_shichen",
    boundaryFlags: ["near_midnight"],
    chartSex: "female"
  };
  const answers: SymbolAnswer[] = [
    { questionId: "B1_hair_whorl", answerId: "one_offset" },
    { questionId: "B2_fetal_order", answerId: "1" }
  ];
  const events: LifeEvent[] = [{ year: 2020, type: "education" }, { year: 2021, type: "career_transition" }];
  const prior = scoreSymbolPrior({ answers, chartSex: birthInput.chartSex, scoringConfig });
  const candidates = generateCandidateHours(birthInput, prior, scoringConfig);
  const eventResults = scoreEventBacktest(candidates, events);
  const ranking = rankCandidates({ candidates, symbol_prior_result: prior, event_backtest_results: eventResults, scoringConfig });

  assert.equal(ranking.top_3.length, 3);
  assert.deepEqual(ranking.weights_used, scoringConfig.candidate_score_weights);
  assert.ok(ranking.evidence_table.length > 0);
});

test("ranking assigns confidence to each top 3 candidate", () => {
  const scoringConfig = loadScoringConfig();
  const birthInput: BirthInput = {
    birthDate: "1990-01-01",
    birthplace: "demo",
    recordedTime: "22:35",
    uncertaintyRange: "adjacent_1_shichen",
    boundaryFlags: ["near_midnight"],
    chartSex: "female"
  };
  const prior = scoreSymbolPrior({
    answers: [{ questionId: "B1_hair_whorl", answerId: "one_offset" }],
    chartSex: birthInput.chartSex,
    scoringConfig
  });
  const candidates = generateCandidateHours(birthInput, prior, scoringConfig);
  const eventResults = scoreEventBacktest(candidates, [{ year: 2020, type: "education" }]);
  const ranking = rankCandidates({ candidates, symbol_prior_result: prior, event_backtest_results: eventResults, scoringConfig });

  assert.equal(ranking.top_3.length, 3);
  for (const candidate of ranking.top_3) {
    assert.equal(typeof candidate.confidence, "number");
    assert.ok(candidate.confidence >= 0);
    assert.ok(candidate.confidence <= 1);
  }
});
