import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createDefaultChart, generateCandidateChartsV2 } from "../src/chartGenerationStage5C.ts";
import { createBaziUiServer } from "../src/server.ts";
import { StaticBaziAdapter } from "../src/staticBaziAdapter.ts";
import type { BaziDerivationOptions, BaziDerivedProfile, BaziEngineAdapter, FixedPillars, RecordedBirthTime } from "../src/baziTypes.ts";

const fixedPillars: FixedPillars = {
  year: { stem: "Wu", branch: "Yin" },
  month: { stem: "Ding", branch: "Si" },
  day: { stem: "Ding", branch: "Si" },
  hour: { stem: "Xin", branch: "Hai" }
};

function recorded(overrides: Partial<RecordedBirthTime> = {}): RecordedBirthTime {
  return {
    calendar_type: "solar",
    birth_date: "1998-05-10",
    date: "1998-05-10",
    birth_time: "22:30",
    time: "22:30",
    timezone: "Asia/Shanghai",
    certainty: "exact_to_minute",
    boundary_flags: [],
    assumptions: ["fictional_stage5c_fixture"],
    ...overrides
  };
}

class FailingAdapter implements BaziEngineAdapter {
  adapter_id = "failing-adapter";
  source_library = "failing-test-adapter";
  supports_recorded_birth_time = true;
  supports_birth_datetime = true;
  supports_fixed_pillars = true;
  supports_luck_cycles = false;
  supports_annual_fortunes = false;

  deriveFromRecordedBirthTime(_input: RecordedBirthTime, _options?: BaziDerivationOptions): BaziDerivedProfile {
    throw new Error("intentional adapter failure");
  }

  deriveFromFixedPillars(_input: FixedPillars, _options?: BaziDerivationOptions): BaziDerivedProfile {
    throw new Error("intentional adapter failure");
  }
}

async function withServer<T>(run: (baseUrl: string) => Promise<T>): Promise<T> {
  const server = createBaziUiServer();
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  assert.equal(typeof address, "object");
  assert.ok(address);
  try {
    return await run(`http://127.0.0.1:${address.port}`);
  } finally {
    await new Promise<void>((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
  }
}

test("Stage 5C exact_to_minute generates DefaultChart with derived profile when adapter can use fixed pillars", async () => {
  const chart = await createDefaultChart(recorded({ fixed_pillars: fixedPillars }), new StaticBaziAdapter());
  assert.equal(chart.chart_id, "default_chart");
  assert.equal(chart.chart_role, "default");
  assert.equal(chart.recorded_time_prior_score, 1);
  assert.equal(chart.derived_profile?.day_master, fixedPillars.day.stem);
  assert.deepEqual(chart.derived_profile?.source_libraries, ["static-adapter"]);
});

test("Stage 5C within_1_hour generates default and adjacent candidates", async () => {
  const result = await generateCandidateChartsV2({
    recorded_birth_time: recorded({ certainty: "within_1_hour", fixed_pillars: fixedPillars }),
    adapter: new StaticBaziAdapter()
  });
  const branches = result.candidates.map((candidate) => candidate.hour_branch_key);
  assert.ok(branches.includes("Hai"));
  assert.ok(branches.includes("Xu"));
  assert.ok(branches.includes("Zi"));
  assert.equal(result.metadata.ai_used, false);
  assert.equal(result.metadata.context_box_used, false);
  assert.equal(result.metadata.ranking_performed, false);
});

test("Stage 5C time_range generates candidates across covered branches", async () => {
  const result = await generateCandidateChartsV2({
    recorded_birth_time: recorded({
      certainty: "time_range",
      time_range: { start: "21:00", end: "23:30" },
      boundary_flags: ["near_zi_boundary"],
      fixed_pillars: fixedPillars
    }),
    adapter: new StaticBaziAdapter()
  });
  const branches = new Set(result.candidates.map((candidate) => candidate.hour_branch_key));
  assert.ok(branches.has("Hai"));
  assert.ok(branches.has("Zi"));
  assert.ok(branches.has("Chou"));
});

test("Stage 5C part_of_day generates corresponding branch candidates", async () => {
  const result = await generateCandidateChartsV2({
    recorded_birth_time: recorded({
      certainty: "part_of_day",
      birth_time: undefined,
      time: undefined,
      part_of_day: "morning",
      fixed_pillars: fixedPillars
    }),
    adapter: new StaticBaziAdapter()
  });
  const branches = new Set(result.candidates.map((candidate) => candidate.hour_branch_key));
  assert.ok(branches.has("Mao"));
  assert.ok(branches.has("Chen"));
  assert.ok(branches.has("Si"));
});

test("Stage 5C unknown_time generates full-day candidates", async () => {
  const result = await generateCandidateChartsV2({
    recorded_birth_time: recorded({
      certainty: "unknown_time",
      birth_time: undefined,
      time: undefined,
      fixed_pillars: fixedPillars
    }),
    adapter: new StaticBaziAdapter()
  });
  assert.equal(result.candidates.length, 12);
});

test("Stage 5C boundary flags expand Zi hour and adjacent hour candidates", async () => {
  const zi = await generateCandidateChartsV2({
    recorded_birth_time: recorded({ birth_time: "23:05", time: "23:05", boundary_flags: ["near_zi_hour"], fixed_pillars: fixedPillars }),
    adapter: new StaticBaziAdapter()
  });
  const ziBranches = new Set(zi.candidates.map((candidate) => candidate.hour_branch_key));
  assert.ok(ziBranches.has("Hai"));
  assert.ok(ziBranches.has("Zi"));
  assert.ok(ziBranches.has("Chou"));

  const boundary = await generateCandidateChartsV2({
    recorded_birth_time: recorded({ birth_time: "08:59", time: "08:59", boundary_flags: ["near_hour_boundary"], fixed_pillars: fixedPillars }),
    adapter: new StaticBaziAdapter()
  });
  const boundaryBranches = new Set(boundary.candidates.map((candidate) => candidate.hour_branch_key));
  assert.ok(boundaryBranches.has("Mao"));
  assert.ok(boundaryBranches.has("Chen"));
  assert.ok(boundaryBranches.has("Si"));
});

test("Stage 5C near_solar_term returns warning stub", async () => {
  const result = await generateCandidateChartsV2({
    recorded_birth_time: recorded({ boundary_flags: ["near_solar_term"], fixed_pillars: fixedPillars }),
    adapter: new StaticBaziAdapter()
  });
  assert.ok(result.generation_summary.warnings.some((warning) => warning.includes("near_solar_term_stub")));
});

test("Stage 5C adapter failure returns warnings and does not fatal", async () => {
  const result = await generateCandidateChartsV2({
    recorded_birth_time: recorded({ fixed_pillars: fixedPillars }),
    adapter: new FailingAdapter()
  });
  assert.equal(result.default_chart.derived_profile, undefined);
  assert.ok(result.generation_summary.warnings.some((warning) => warning.includes("intentional adapter failure")));
  assert.ok(result.candidates.length >= 1);
});

test("Stage 5C generation source does not read context_box or call AI providers", () => {
  const source = readFileSync(fileURLToPath(new URL("../src/chartGenerationStage5C.ts", import.meta.url)), "utf8").toLowerCase();
  for (const pattern of [
    /contextbox/,
    /contextfacts/,
    /normalizecontext/,
    /from\s+["'][^"']*openai/,
    /import\(["'][^"']*openai/,
    /from\s+["'][^"']*anthropic/,
    /import\(["'][^"']*anthropic/,
    /from\s+["'][^"']*@ai-sdk/,
    /import\(["'][^"']*@ai-sdk/,
    /process\.env/,
    /rankcandidates/,
    /runprediction/
  ]) {
    assert.equal(pattern.test(source), false, `Stage 5C generator matched forbidden pattern: ${pattern}`);
  }
});

test("Stage 5C APIs return metadata and do not perform ranking", async () => {
  await withServer(async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/default-chart`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ recorded_birth_time: recorded({ fixed_pillars: fixedPillars }) })
    });
    const defaultPayload = await response.json();
    assert.equal(response.status, 200);
    assert.equal(defaultPayload.default_chart.chart_role, "default");
    assert.equal(defaultPayload.metadata.ai_used, false);
    assert.equal(defaultPayload.metadata.context_box_used, false);
    assert.equal(defaultPayload.metadata.ranking_performed, false);
    assert.equal(defaultPayload.metadata.stage, "5C");

    const candidatesResponse = await fetch(`${baseUrl}/api/candidate-charts-v2`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ recorded_birth_time: recorded({ certainty: "within_1_hour", fixed_pillars: fixedPillars }) })
    });
    const candidatePayload = await candidatesResponse.json();
    assert.equal(candidatesResponse.status, 200);
    assert.ok(candidatePayload.candidates.length >= 3);
    assert.equal(candidatePayload.metadata.ai_used, false);
    assert.equal(candidatePayload.metadata.context_box_used, false);
    assert.equal(candidatePayload.metadata.ranking_performed, false);
  });
});
