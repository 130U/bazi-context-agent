import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { getBaziEngineAdapter, getStaticBaziAdapter } from "../src/baziAdapterFactory.ts";
import { REQUIRED_BAZI_DERIVED_PROFILE_FIELDS, validateBaziDerivedProfile } from "../src/baziEngineAdapter.ts";
import { LunarJavascriptAdapter } from "../src/lunarJavascriptAdapter.ts";
import { StaticBaziAdapter } from "../src/staticBaziAdapter.ts";
import { generateCandidateHours } from "../src/candidateGeneration.ts";
import { loadScoringConfig } from "../src/config.ts";
import { scoreEventBacktest } from "../src/eventBacktest.ts";
import { rankCandidates } from "../src/ranking.ts";
import { scoreSymbolPrior } from "../src/symbolPrior.ts";
import type { BirthInput, LifeEvent, SymbolAnswer } from "../src/types.ts";
import type { FixedPillars } from "../src/baziTypes.ts";

const fixture = JSON.parse(readFileSync(fileURLToPath(new URL("../fixtures/stage5b_fixed_pillars.json", import.meta.url)), "utf8")) as {
  chart_id: string;
  fixed_pillars: FixedPillars;
};

function rankingShape() {
  const scoringConfig = loadScoringConfig();
  const birthInput: BirthInput = {
    birthDate: "1998-05-10",
    birthplace: "Shanghai, China",
    recordedTime: "22:50",
    uncertaintyRange: "auto",
    boundaryFlags: ["near_hour_boundary", "near_zi_hour"],
    chartSex: "female"
  };
  const answers: SymbolAnswer[] = [{ questionId: "B1_hair_whorl", answerId: "one_offset" }];
  const events: LifeEvent[] = [{ year: 2018, type: "education", description: "fictional event" }];
  const prior = scoreSymbolPrior({ answers, chartSex: birthInput.chartSex, scoringConfig });
  const candidates = generateCandidateHours(birthInput, prior, scoringConfig);
  const eventResults = scoreEventBacktest(candidates, events);
  const ranking = rankCandidates({ candidates, symbol_prior_result: prior, event_backtest_results: eventResults, scoringConfig });
  return {
    ids: ranking.top_3.map((item) => item.candidate.candidate_id),
    scores: ranking.top_3.map((item) => item.totalScore),
    confidence: ranking.top_3.map((item) => item.confidence),
    evidence: ranking.evidence_table
  };
}

test("StaticBaziAdapter derives a BaziDerivedProfile from fixed pillars", () => {
  const adapter = new StaticBaziAdapter();
  const profile = adapter.deriveFromFixedPillars(fixture.fixed_pillars, { sourceChartId: fixture.chart_id });

  assert.equal(profile.source_chart_id, fixture.chart_id);
  assert.deepEqual(profile.pillars, fixture.fixed_pillars);
  assert.equal(profile.day_master, fixture.fixed_pillars.day.stem);
  assert.deepEqual(profile.source_libraries, ["static-adapter"]);
  assert.equal(profile.calculation_mode, "fixed_pillars");
  assert.deepEqual(validateBaziDerivedProfile(profile), []);
});

test("BaziDerivedProfile exposes every required top-level field", () => {
  const profile = getStaticBaziAdapter().deriveFromFixedPillars(fixture.fixed_pillars, { sourceChartId: fixture.chart_id });
  for (const field of REQUIRED_BAZI_DERIVED_PROFILE_FIELDS) assert.ok(field in profile, `missing ${field}`);
});

test("missing derived data uses empty arrays and warnings instead of crashing", () => {
  const profile = getStaticBaziAdapter().deriveFromFixedPillars(fixture.fixed_pillars, { sourceChartId: fixture.chart_id });
  assert.deepEqual(profile.ten_gods, []);
  assert.deepEqual(profile.hidden_stems, []);
  assert.deepEqual(profile.nayin, []);
  assert.deepEqual(profile.stars, []);
  assert.deepEqual(profile.shensha, []);
  assert.deepEqual(profile.relations.clashes, []);
  assert.ok(profile.warnings.length >= 2);
});

test("adapter output does not include context_box facts", () => {
  const profile = getStaticBaziAdapter().deriveFromFixedPillars(fixture.fixed_pillars, { sourceChartId: fixture.chart_id });
  const serialized = JSON.stringify(profile).toLowerCase();
  for (const token of ["context_box", "parental", "highest education", "desired_direction", "recent anxiety"]) {
    assert.equal(serialized.includes(token), false, `adapter leaked ${token}`);
  }
});

test("adapter modules do not import AI providers or read API keys", () => {
  const files = [
    "../src/baziTypes.ts",
    "../src/baziEngineAdapter.ts",
    "../src/staticBaziAdapter.ts",
    "../src/lunarJavascriptAdapter.ts",
    "../src/baziAdapterFactory.ts"
  ];
  const source = files.map((path) => readFileSync(fileURLToPath(new URL(path, import.meta.url)), "utf8").toLowerCase()).join("\n");
  for (const pattern of [
    /from\s+["'][^"']*openai/,
    /import\(["'][^"']*openai/,
    /from\s+["'][^"']*anthropic/,
    /import\(["'][^"']*anthropic/,
    /from\s+["'][^"']*@ai-sdk/,
    /import\(["'][^"']*@ai-sdk/,
    /from\s+["'][^"']*langchain/,
    /import\(["'][^"']*langchain/,
    /from\s+["'][^"']*llamaindex/,
    /import\(["'][^"']*llamaindex/,
    /from\s+["'][^"']*gemini/,
    /import\(["'][^"']*gemini/,
    /process\.env/,
    /openai_api_key/,
    /anthropic_api_key/
  ]) {
    assert.equal(pattern.test(source), false, `adapter source matches forbidden pattern: ${pattern}`);
  }
});

test("adapter factory falls back to StaticBaziAdapter when lunar dependency is absent", async () => {
  const adapter = await getBaziEngineAdapter();
  assert.ok(adapter instanceof StaticBaziAdapter || adapter instanceof LunarJavascriptAdapter);
  if (adapter instanceof StaticBaziAdapter) assert.equal(adapter.source_library, "static-adapter");
});

test("LunarJavascriptAdapter wrapper is safe when dependency is unavailable", async () => {
  const adapter = new LunarJavascriptAdapter();
  if (!(await adapter.isAvailable())) {
    await assert.rejects(
      () => adapter.deriveFromRecordedBirthTime({ date: "1998-05-10", time: "22:30", timezone: "Asia/Shanghai", certainty: "exact" }),
      /lunar-javascript is not installed/
    );
  }
  const profile = adapter.deriveFromFixedPillars(fixture.fixed_pillars, { sourceChartId: fixture.chart_id });
  assert.ok(profile.source_libraries.includes("static-adapter"));
  assert.deepEqual(validateBaziDerivedProfile(profile), []);
});

test("adding adapter modules does not change ranking output", () => {
  const before = rankingShape();
  getStaticBaziAdapter().deriveFromFixedPillars(fixture.fixed_pillars, { sourceChartId: fixture.chart_id });
  const after = rankingShape();
  assert.deepEqual(after, before);
});
