import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { generateCandidateHours } from "../src/candidateGeneration.ts";
import { loadScoringConfig } from "../src/config.ts";
import { scoreEventBacktest } from "../src/eventBacktest.ts";
import { createOpenAiPredictionProvider, type OpenAiChatClient } from "../src/openaiPredictionProvider.ts";
import { getPredictionProviderConfig } from "../src/predictionProviderConfig.ts";
import { runPredictionWithConfiguredProvider } from "../src/predictionProvider.ts";
import { cloneRankingSnapshot } from "../src/predictionPolicy.ts";
import { validatePredictionResult } from "../src/predictionResultValidator.ts";
import { rankCandidates } from "../src/ranking.ts";
import { scoreSymbolPrior } from "../src/symbolPrior.ts";
import type { BirthInput, LifeEvent, SymbolAnswer } from "../src/types.ts";
import type { PredictionRequest, PredictionResult, RankingSnapshot } from "../src/predictionTypes.ts";

function fixtureRequest(): PredictionRequest {
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
  const lifeEvents: LifeEvent[] = [{ year: 2021, type: "career", description: "fictional career event" }];
  const prior = scoreSymbolPrior({ answers, chartSex: birthInput.chartSex, scoringConfig });
  const candidates = generateCandidateHours(birthInput, prior, scoringConfig);
  const eventBacktests = scoreEventBacktest(candidates, lifeEvents);
  const ranking = rankCandidates({ candidates, symbol_prior_result: prior, event_backtest_results: eventBacktests, contextFacts: [], scoringConfig });
  const rankingSnapshot: RankingSnapshot = {
    top_candidate_id: ranking.top_candidate_id,
    top_3: ranking.top_3,
    evidence_table: ranking.evidence_table,
    contradictions: ranking.contradictions,
    missing_information: ranking.missing_information,
    should_not_force_single_hour: ranking.should_not_force_single_hour,
    warning: ranking.warning,
    weights_used: ranking.weights_used
  };
  return {
    question: "What career direction fits this context?",
    domain: "career",
    rankingSnapshot,
    contextBox: [{ id: "desired_direction", value: "fictional product strategy path", source: "user_answer", confidence: 0.8, factType: "known_user_fact" }],
    lifeEvents
  };
}

function validOpenAiResult(request: PredictionRequest): PredictionResult {
  return {
    domain: request.domain ?? "general",
    conclusion: "Fake OpenAI result based on a frozen ranking snapshot.",
    known_facts: [{ fact: "desired_direction: fictional product strategy path", source: "user_answer", confidence: 0.8 }],
    chart_signals: [{ signal: "top candidate snapshot retained", source_candidate_id: request.rankingSnapshot.top_3[0].candidate.candidate_id, confidence: request.rankingSnapshot.top_3[0].confidence }],
    context_adjustments: [{ adjustment: "Use context after ranking only.", basis: ["context_box"] }],
    prediction: { answer: "Fake provider response for tests only.", confidence: 0.62, timeframe: "fake" },
    confidence: 0.62,
    uncertainty: ["fake client only"],
    next_questions: ["Which outcome matters most?"],
    policy: {
      ai_used_for_ranking: false,
      ranking_modified_by_ai: false,
      provider: "openai",
      output_schema_validated: true
    }
  };
}

test("Stage 4B provider selection defaults to mock", () => {
  assert.equal(getPredictionProviderConfig({}).provider, "mock");
  assert.equal(getPredictionProviderConfig({ PREDICTION_PROVIDER: "mock" }).provider, "mock");
});

test("Stage 4B provider selection routes openai only when key is present", () => {
  const config = getPredictionProviderConfig({
    PREDICTION_PROVIDER: "openai",
    OPENAI_API_KEY: "test-key-only",
    OPENAI_MODEL: "fake-model"
  });
  assert.equal(config.requestedProvider, "openai");
  assert.equal(config.provider, "openai");
  assert.equal(config.model, "fake-model");
});

test("Stage 4B provider selection handles openai without key safely", () => {
  const config = getPredictionProviderConfig({ PREDICTION_PROVIDER: "openai" });
  assert.equal(config.requestedProvider, "openai");
  assert.equal(config.provider, "mock");
  assert.equal(config.configError?.code, "PROVIDER_CONFIG_ERROR");
});

test("configured provider validates default mock output", async () => {
  const output = await runPredictionWithConfiguredProvider(fixtureRequest(), { env: {} });
  assert.equal(output.error, undefined);
  assert.equal(output.result?.policy.provider, "mock");
  assert.equal(output.result?.policy.output_schema_validated, true);
});

test("OpenAI provider uses fake client without real network", async () => {
  const request = fixtureRequest();
  let calls = 0;
  const fakeClient: OpenAiChatClient = async () => {
    calls += 1;
    return { choices: [{ message: { content: JSON.stringify(validOpenAiResult(request)) } }] };
  };
  const provider = createOpenAiPredictionProvider({ apiKey: "test-key-only", model: "fake-model", client: fakeClient });
  const before = cloneRankingSnapshot(request.rankingSnapshot);
  const result = await provider.predict(request);

  assert.equal(calls, 1);
  assert.equal(result.policy.provider, "openai");
  assert.deepEqual(request.rankingSnapshot, before);
});

test("configured provider runs fake OpenAI and validates output", async () => {
  const request = fixtureRequest();
  const fakeClient: OpenAiChatClient = async () => validOpenAiResult(request);
  const before = cloneRankingSnapshot(request.rankingSnapshot);
  const output = await runPredictionWithConfiguredProvider(request, {
    env: { PREDICTION_PROVIDER: "openai", OPENAI_API_KEY: "test-key-only", OPENAI_MODEL: "fake-model" },
    openAiClient: fakeClient
  });

  assert.equal(output.error, undefined);
  assert.equal(output.result?.policy.provider, "openai");
  assert.equal(output.result?.policy.output_schema_validated, true);
  assert.deepEqual(request.rankingSnapshot, before);
});

test("configured provider rejects invalid fake OpenAI output", async () => {
  const output = await runPredictionWithConfiguredProvider(fixtureRequest(), {
    env: { PREDICTION_PROVIDER: "openai", OPENAI_API_KEY: "test-key-only" },
    openAiClient: async () => ({ conclusion: "missing required fields" })
  });

  assert.equal(output.error?.code, "PROVIDER_OUTPUT_INVALID");
});

test("prediction result validator accepts valid output and rejects invalid output", () => {
  const request = fixtureRequest();
  assert.equal(validatePredictionResult(validOpenAiResult(request), "openai").policy.output_schema_validated, true);
  assert.throws(() => validatePredictionResult({ ...validOpenAiResult(request), confidence: 2 }, "openai"), /invalid_prediction_output/);
  assert.throws(() => validatePredictionResult({ ...validOpenAiResult(request), known_facts: [{ source: "user_answer" }] }, "openai"), /known_facts\.fact/);
  assert.throws(() => validatePredictionResult({ ...validOpenAiResult(request), chart_signals: [{ signal: "x", confidence: 0.5 }] }, "openai"), /chart_signals\.source_candidate_id/);
  assert.throws(() => validatePredictionResult({ ...validOpenAiResult(request), context_adjustments: [{ adjustment: "x", basis: [1] }] }, "openai"), /context_adjustments\.basis/);
});

test("repo contains no real env file, real key, or forbidden provider framework", () => {
  const root = fileURLToPath(new URL("..", import.meta.url));
  assert.equal(existsSync(join(root, ".env")), false);
  assert.equal(existsSync(join(root, ".env.local")), false);
  const pkg = readFileSync(join(root, "package.json"), "utf8").toLowerCase();
  for (const token of ["langchain", "llamaindex", "@ai-sdk"]) assert.equal(pkg.includes(token), false);

  function files(dir: string): string[] {
    if (!existsSync(dir)) return [];
    return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
      const path = join(dir, entry.name);
      return entry.isDirectory() ? files(path) : [path];
    });
  }

  const source = [
    ...files(join(root, "src")),
    ...files(join(root, "docs")),
    ...files(join(root, "prompts")),
    ...files(join(root, "pm_checklists")),
    ...files(join(root, "configs")),
    ...files(join(root, "examples"))
  ].map((path) => readFileSync(path, "utf8")).join("\n");
  assert.equal(/sk-[A-Za-z0-9]{20,}/.test(source), false);
  assert.equal(/gho_[A-Za-z0-9]{20,}/.test(source), false);
  const keyLines = source.split(/\r?\n/).filter((line) => line.startsWith("OPENAI_API_KEY="));
  assert.equal(keyLines.some((line) => line.trim() !== "OPENAI_API_KEY="), false);
});
