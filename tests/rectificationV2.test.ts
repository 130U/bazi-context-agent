import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { applyDefaultChartProtection } from "../src/defaultChartProtection.ts";
import { scoreEventTimingFit } from "../src/eventTimingFit.ts";
import { loadRectificationWeights, RECTIFICATION_WEIGHTS_SOURCE } from "../src/rectificationConfig.ts";
import { runRectificationV2 } from "../src/rectificationV2.ts";
import { createBaziUiServer } from "../src/server.ts";
import type { CandidateRectificationScore, RectificationV2Request } from "../src/rectificationTypes.ts";

const fixture = JSON.parse(readFileSync(fileURLToPath(new URL("../fixtures/stage5d_rectification_input.json", import.meta.url)), "utf8")) as RectificationV2Request;

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function protectionScore(candidate_id: string, chart_role: "default" | "candidate", total_score: number, highMatches = 0): CandidateRectificationScore {
  return {
    candidate_id,
    chart_role,
    total_score,
    confidence: 0.8,
    components: {
      recorded_time_prior: chart_role === "default" ? 0.95 : 0.6,
      event_timing_fit: total_score,
      symbol_prior_fit: 0.5,
      chart_profile_fit: 0.7,
      contradiction_penalty: 0
    },
    weighted_components: {
      recorded_time_prior: 0.2,
      event_timing_fit: 0.4,
      symbol_prior_fit: 0.05,
      chart_profile_fit: 0.07
    },
    evidence: [],
    contradictions: [],
    missing_information: [],
    warnings: [],
    high_importance_event_matches: highMatches
  };
}

async function withServer<T>(run: (baseUrl: string) => Promise<T>): Promise<T> {
  const server = createBaziUiServer();
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  if (!address || typeof address === "string") throw new Error("Test server did not expose a TCP address.");
  try {
    return await run(`http://127.0.0.1:${address.port}`);
  } finally {
    await new Promise<void>((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
  }
}

test("rectification v2 reads every weight from the canonical scoring config", () => {
  const weights = loadRectificationWeights();
  assert.equal(weights.version, "rectification.v2");
  assert.match(RECTIFICATION_WEIGHTS_SOURCE, /scoring_weights\.v1\.json/);
  assert.deepEqual(weights.candidate_rectification_score_weights, {
    recorded_time_prior: 0.35,
    event_timing_fit: 0.45,
    symbol_prior_fit: 0.1,
    chart_profile_fit: 0.1
  });
  assert.equal(weights.context_box_allowed_for_rectification, false);
  assert.equal(weights.ai_allowed_for_rectification, false);
});

test("Stage 5D EventTimingFit exposes required fields without crashing on missing enrichment", () => {
  const result = scoreEventTimingFit(
    {
      ...fixture.default_chart,
      derived_profile: {
        ...fixture.default_chart.derived_profile!,
        annual_fortunes: [],
        luck_cycles: []
      }
    },
    fixture.life_events
  );
  assert.equal(result.candidate_id, fixture.default_chart.chart_id);
  assert.equal(typeof result.event_timing_fit, "number");
  assert.ok(Array.isArray(result.event_scores));
  assert.ok(Array.isArray(result.matched_rules));
  assert.ok(Array.isArray(result.contradictions));
  assert.ok(Array.isArray(result.missing_information));
  assert.ok(result.missing_information.includes("annual_fortunes"));
  assert.ok(result.warnings.length > 0);
});

test("Stage 5D RectificationResultV2 scores default and candidates with components and evidence table", () => {
  const result = runRectificationV2(fixture);
  assert.equal(result.metadata.stage, "5D");
  assert.equal(result.metadata.ai_used, false);
  assert.equal(result.metadata.context_box_used_for_rectification, false);
  assert.equal(result.metadata.ranking_modified_by_ai, false);
  assert.equal(result.metadata.weights_source, RECTIFICATION_WEIGHTS_SOURCE);
  assert.ok(result.scores.some((score) => score.chart_role === "default"));
  assert.ok(result.scores.some((score) => score.chart_role === "candidate"));
  for (const score of result.scores) {
    assert.equal(typeof score.total_score, "number");
    assert.equal(typeof score.confidence, "number");
    assert.equal(typeof score.components.recorded_time_prior, "number");
    assert.equal(typeof score.components.event_timing_fit, "number");
    assert.equal(typeof score.components.symbol_prior_fit, "number");
    assert.equal(typeof score.components.chart_profile_fit, "number");
    assert.equal(typeof score.components.contradiction_penalty, "number");
    assert.ok(Array.isArray(score.evidence));
  }
  assert.ok(result.evidence_table.length >= result.scores.length);
  assert.ok(result.default_chart_protection.default_chart_id);
});

test("Stage 5D default protection thresholds are deterministic", () => {
  const defaultScore = protectionScore("default_chart", "default", 0.7);
  assert.equal(applyDefaultChartProtection([defaultScore, protectionScore("candidate", "candidate", 0.9, 3)], 2).recommendation, "insufficient_evidence");
  assert.equal(applyDefaultChartProtection([defaultScore, protectionScore("candidate", "candidate", 0.74, 3)], 3).recommendation, "use_default_chart");
  assert.equal(applyDefaultChartProtection([defaultScore, protectionScore("candidate", "candidate", 0.82, 3)], 3).recommendation, "default_protected_uncertain");
  const preferred = applyDefaultChartProtection([protectionScore("default_chart", "default", 0.65), protectionScore("candidate", "candidate", 0.84, 3)], 4);
  assert.equal(preferred.recommendation, "candidate_preferred");
  assert.equal(preferred.override_allowed, true);
});

test("Stage 5D context_box does not affect rectification result", () => {
  const first = runRectificationV2({ ...clone(fixture), context_box: [{ field: "parent", value: "doctor" }] });
  const second = runRectificationV2({ ...clone(fixture), context_box: [{ field: "desired_direction", value: "film" }] });
  const stableShape = (result: ReturnType<typeof runRectificationV2>) => ({
    selected_chart_id: result.selected_chart_id,
    recommendation: result.recommendation,
    scores: result.scores.map((score) => ({
      candidate_id: score.candidate_id,
      total_score: score.total_score,
      components: score.components,
      confidence: score.confidence
    })),
    evidence_table: result.evidence_table,
    metadata: result.metadata
  });
  assert.deepEqual(stableShape(first), stableShape(second));
  assert.equal(first.metadata.context_box_used_for_rectification, false);
});

test("Stage 5D API validates default_chart and returns metadata", async () => {
  await withServer(async (baseUrl) => {
    const missing = await fetch(`${baseUrl}/api/rectification-v2`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ candidates: [], life_events: [] })
    });
    const missingPayload = await missing.json();
    assert.equal(missing.status, 400);
    assert.equal(missingPayload.error.code, "MISSING_DEFAULT_CHART");

    const response = await fetch(`${baseUrl}/api/rectification-v2`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(fixture)
    });
    const payload = await response.json();
    assert.equal(response.status, 200);
    assert.equal(payload.metadata.stage, "5D");
    assert.equal(payload.metadata.ai_used, false);
    assert.equal(payload.metadata.context_box_used_for_rectification, false);
    assert.equal(payload.metadata.ranking_modified_by_ai, false);
    assert.equal(payload.result.metadata.ai_used, false);
    assert.ok(Array.isArray(payload.result.scores));
  });
});

test("Stage 5D rectification path does not import providers, read keys, or call ranking/prediction", () => {
  const files = [
    "../src/rectificationTypes.ts",
    "../src/rectificationConfig.ts",
    "../src/rectificationEvidence.ts",
    "../src/eventTimingFit.ts",
    "../src/defaultChartProtection.ts",
    "../src/rectificationV2.ts"
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
    /process\.env/,
    /openai_api_key/,
    /anthropic_api_key/,
    /rankcandidates/,
    /runprediction/,
    /createopenai/
  ]) {
    assert.equal(pattern.test(source), false, `Stage 5D source matched forbidden pattern: ${pattern}`);
  }
});
