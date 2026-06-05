import test from "node:test";
import assert from "node:assert/strict";
import { generateCandidateHours } from "../src/candidateGeneration.ts";
import { loadPredictionOutputSchemaConfig, loadScoringConfig } from "../src/config.ts";
import { normalizeContextBox } from "../src/contextBox.ts";
import { scoreEventBacktest } from "../src/eventBacktest.ts";
import { mockPredictionProvider } from "../src/mockPredictionProvider.ts";
import { classifyPredictionDomain } from "../src/predictionDomain.ts";
import { cloneRankingSnapshot } from "../src/predictionPolicy.ts";
import { rankCandidates } from "../src/ranking.ts";
import { scoreSymbolPrior } from "../src/symbolPrior.ts";
import type { BirthInput, LifeEvent, SymbolAnswer } from "../src/types.ts";
import type { PredictionRequest, RankingSnapshot } from "../src/predictionTypes.ts";

function rankingSnapshot(): { snapshot: RankingSnapshot; lifeEvents: LifeEvent[] } {
  const scoringConfig = loadScoringConfig();
  const birthInput: BirthInput = {
    birthDate: "1998-05-10",
    birthplace: "Shanghai, China",
    recordedTime: "22:50",
    uncertaintyRange: "auto",
    boundaryFlags: ["near_hour_boundary", "near_zi_hour"],
    chartSex: "female"
  };
  const answers: SymbolAnswer[] = [
    { questionId: "B1_hair_whorl", answerId: "one_offset" },
    { questionId: "B4_little_finger_length", answerId: "aligned" }
  ];
  const lifeEvents: LifeEvent[] = [
    { year: 2018, type: "education", description: "fictional education event" },
    { year: 2021, type: "career", description: "fictional career event" }
  ];
  const prior = scoreSymbolPrior({ answers, chartSex: birthInput.chartSex, scoringConfig });
  const candidates = generateCandidateHours(birthInput, prior, scoringConfig);
  const eventBacktests = scoreEventBacktest(candidates, lifeEvents);
  const ranking = rankCandidates({ candidates, symbol_prior_result: prior, event_backtest_results: eventBacktests, contextFacts: [], scoringConfig });
  return {
    snapshot: {
      top_candidate_id: ranking.top_candidate_id,
      top_3: ranking.top_3,
      evidence_table: ranking.evidence_table,
      contradictions: ranking.contradictions,
      missing_information: ranking.missing_information,
      should_not_force_single_hour: ranking.should_not_force_single_hour,
      warning: ranking.warning,
      weights_used: ranking.weights_used
    },
    lifeEvents
  };
}

function request(contextValue: string): PredictionRequest {
  const { snapshot, lifeEvents } = rankingSnapshot();
  return {
    question: "What career direction fits this context?",
    domain: classifyPredictionDomain("career direction"),
    rankingSnapshot: snapshot,
    contextBox: normalizeContextBox([{ field: "desired_direction", value: contextValue, confidence: 0.8 }]),
    lifeEvents
  };
}

test("prediction domain classifier is deterministic and config backed", () => {
  assert.equal(classifyPredictionDomain("career and job direction"), "career");
  assert.equal(classifyPredictionDomain("money and income question"), "wealth");
  assert.equal(classifyPredictionDomain("unclassified broad question"), "general");
  assert.equal(classifyPredictionDomain("career and job direction"), classifyPredictionDomain("career and job direction"));
});

test("mock provider returns complete Stage 4A schema", () => {
  const result = mockPredictionProvider.predict(request("fictional technology path"));
  const schema = loadPredictionOutputSchemaConfig();
  for (const field of schema.required ?? []) assert.ok(field in result, `missing ${field}`);
  assert.equal(result.policy.ai_used_for_ranking, false);
  assert.equal(result.policy.ranking_modified_by_ai, false);
  assert.equal(result.policy.provider, "mock");
  assert.equal(result.policy.output_schema_validated, true);
  assert.ok(result.confidence >= 0);
  assert.ok(result.confidence <= 1);
  assert.ok(result.prediction.confidence >= 0);
  assert.ok(result.prediction.confidence <= 1);
  assert.ok(result.known_facts.length > 0);
  assert.ok(result.chart_signals.length > 0);
  assert.ok(result.context_adjustments.length > 0);
});

test("mock provider does not mutate rankingSnapshot", () => {
  const predictionRequest = request("fictional research path");
  const before = cloneRankingSnapshot(predictionRequest.rankingSnapshot);
  mockPredictionProvider.predict(predictionRequest);
  assert.deepEqual(predictionRequest.rankingSnapshot, before);
});

test("context box can change prediction while ranking snapshot stays fixed", () => {
  const first = request("fictional technology path");
  const second: PredictionRequest = {
    ...first,
    contextBox: normalizeContextBox([{ field: "desired_direction", value: "fictional public service path", confidence: 0.8 }])
  };
  const snapshotBefore = cloneRankingSnapshot(first.rankingSnapshot);
  const firstResult = mockPredictionProvider.predict(first);
  const secondResult = mockPredictionProvider.predict(second);
  assert.notEqual(firstResult.prediction.answer, secondResult.prediction.answer);
  assert.deepEqual(first.rankingSnapshot, snapshotBefore);
  assert.deepEqual(second.rankingSnapshot, snapshotBefore);
});
