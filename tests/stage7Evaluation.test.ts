import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { buildHoldoutSnapshot } from "../src/holdoutBuilder.ts";
import { runLeakageGuard } from "../src/leakageGuard.ts";
import { buildAllModeInputs } from "../src/evaluationModes.ts";
import { comparePair, scoreModeOutput } from "../src/forecastJudge.ts";
import { runBenchmark } from "../src/benchmarkRunner.ts";
import { createBaziUiServer } from "../src/server.ts";
import type { EvalCase, EvaluationModeId, ModeOutput } from "../src/evalTypes.ts";

function fixture<T>(name: string): T {
  return JSON.parse(readFileSync(fileURLToPath(new URL(`../fixtures/${name}`, import.meta.url)), "utf8")) as T;
}

function evalCases(): EvalCase[] {
  return fixture<{ cases: EvalCase[] }>("stage7_eval_cases.sample.json").cases;
}

function firstCase(): EvalCase {
  return evalCases()[0];
}

function modeOutput(mode: EvaluationModeId, prediction: string, confidence = 0.8): ModeOutput {
  return {
    mode,
    case_id: firstCase().case_id,
    domain_forecasts: [
      {
        domain: "education",
        prediction,
        confidence,
        occurred: true,
        year: 2019
      }
    ],
    known_facts_used: mode === "A_derivative_only" ? [] : ["initial_value"],
    derivative_signals_used: mode === "B_initial_value_only" ? [] : ["derivative_profile"],
    initial_value_adjustments: mode === "A_derivative_only" ? [] : ["context_baseline"],
    policy: {
      provider: "deterministic_mock",
      ai_used_for_ranking: false,
      ai_used_for_rectification: false,
      real_network_used: false
    }
  };
}

async function withServer<T>(run: (baseUrl: string) => Promise<T>): Promise<T> {
  const server = createBaziUiServer();
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  assert.equal(typeof address, "object");
  assert.ok(address);
  const baseUrl = `http://127.0.0.1:${address.port}`;
  try {
    return await run(baseUrl);
  } finally {
    await new Promise<void>((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
  }
}

test("Stage 7 eval case fixture loads and validates core fields", () => {
  const cases = evalCases();

  assert.ok(cases.length >= 2);
  assert.equal(cases[0].schema_version, "stage7.v1");
  assert.ok(cases[0].hidden_targets.length > 0);
  assert.ok(cases[0].cutoff_date);
});

test("Stage 7 holdout builder removes hidden target fields terms and post-cutoff events", () => {
  const evalCase: EvalCase = {
    ...firstCase(),
    allowed_inputs: {
      ...firstCase().allowed_inputs,
      highest_education: "Stanford MBA",
      known_life_events: [
        { year: 2014, event_type: "education", description: "allowed" },
        { year: 2019, event_type: "education", description: "post cutoff target" }
      ]
    }
  };
  const snapshot = buildHoldoutSnapshot(evalCase);

  assert.equal("highest_education" in snapshot.allowed_inputs, false);
  assert.equal(JSON.stringify(snapshot.allowed_inputs).includes("Stanford"), false);
  assert.equal(snapshot.redaction_metadata.removed_post_cutoff_events, 1);
  assert.equal(snapshot.redaction_metadata.hidden_targets_removed, true);
});

test("Stage 7 leakage guard catches direct and temporal leakage", () => {
  const evalCase = firstCase();
  const direct = runLeakageGuard({ note: "elite graduate education by 2019" }, evalCase);
  const temporal = runLeakageGuard({ known_life_events: [{ year: 2019, event_type: "education" }] }, evalCase);
  const metadata = runLeakageGuard({ mode_metadata: { hidden_target_hint: "elite graduate education by 2019" } }, evalCase);

  assert.equal(direct.passed, false);
  assert.equal(direct.violations.some((item) => item.type === "direct"), true);
  assert.equal(temporal.passed, false);
  assert.equal(temporal.violations.some((item) => item.type === "temporal"), true);
  assert.equal(metadata.passed, false);
  assert.equal(metadata.violations.some((item) => item.type === "metadata"), true);
});

test("Stage 7 mode builder creates A/B/C/D with required exclusions", () => {
  const evalCase = firstCase();
  const snapshot = buildHoldoutSnapshot(evalCase);
  const modes = buildAllModeInputs(evalCase, snapshot);

  assert.deepEqual(Object.keys(modes).sort(), [
    "A_derivative_only",
    "B_initial_value_only",
    "C_default_chart_plus_initial_value",
    "D_selected_chart_plus_initial_value_full_system"
  ].sort());
  assert.equal("initial_value" in modes.A_derivative_only, false);
  assert.equal("derivative_profile" in modes.B_initial_value_only, false);
  assert.equal(modes.C_default_chart_plus_initial_value.metadata.uses_default_chart, true);
  assert.equal(modes.D_selected_chart_plus_initial_value_full_system.metadata.uses_selected_chart, true);
  assert.equal(JSON.stringify(modes).includes("elite graduate education by 2019"), false);
});

test("Stage 7 deterministic judge scores exact target match and penalizes leakage", () => {
  const evalCase = firstCase();
  const clean = modeOutput("D_selected_chart_plus_initial_value_full_system", "graduate school likely with overseas path", 0.82);
  const leaking = modeOutput("D_selected_chart_plus_initial_value_full_system", "elite graduate education by 2019", 0.99);
  const cleanScore = scoreModeOutput(evalCase, clean);
  const leakingScore = scoreModeOutput(evalCase, leaking);

  assert.ok(cleanScore.domain_accuracy > 0);
  assert.equal(cleanScore.time_window_overlap, 1);
  assert.equal(cleanScore.directional_correctness, 1);
  assert.ok(leakingScore.leakage_penalty > 0);
  assert.ok(leakingScore.total_score < cleanScore.total_score);
});

test("Stage 7 pairwise comparison chooses the higher score with tie threshold", () => {
  const a = scoreModeOutput(firstCase(), modeOutput("A_derivative_only", "education pressure", 0.4));
  const d = scoreModeOutput(firstCase(), modeOutput("D_selected_chart_plus_initial_value_full_system", "graduate school likely with overseas path", 0.9));
  const pair = comparePair(d, a);

  assert.equal(pair.winner, "D_selected_chart_plus_initial_value_full_system");
  assert.ok(pair.score_delta > 0);
});

test("Stage 7 benchmark runner aggregates mode scores win rates and insufficient data", () => {
  const result = runBenchmark({
    cases: [firstCase()],
    mode_outputs: {
      [firstCase().case_id]: {
        A_derivative_only: modeOutput("A_derivative_only", "education pressure", 0.4),
        B_initial_value_only: modeOutput("B_initial_value_only", "graduate education likely", 0.65),
        C_default_chart_plus_initial_value: modeOutput("C_default_chart_plus_initial_value", "graduate education likely", 0.7),
        D_selected_chart_plus_initial_value_full_system: modeOutput("D_selected_chart_plus_initial_value_full_system", "graduate school likely with overseas path", 0.9)
      }
    }
  });

  assert.equal(result.schema_version, "stage7.v1");
  assert.equal(result.case_count, 1);
  assert.ok(result.mode_scores.D_selected_chart_plus_initial_value_full_system.average_total_score > 0);
  assert.equal(result.pairwise_win_rates.D_over_A, 1);
  assert.equal(result.conclusion, "insufficient_data");
  assert.ok(result.warnings.some((item) => item.includes("too small")));
});

test("Stage 7 benchmark runner checks mode inputs with leakage guard", () => {
  const evalCase: EvalCase = {
    ...firstCase(),
    hidden_targets: [
      {
        ...firstCase().hidden_targets[0],
        target_id: "mode_metadata_leak",
        label: "A_derivative_only",
        unacceptable_leakage_terms: ["A_derivative_only"]
      }
    ]
  };
  const result = runBenchmark({ cases: [evalCase] });
  const caseResult = result.case_results[0];

  assert.equal(caseResult.mode_input_leakage_results.A_derivative_only.passed, false);
  assert.equal(caseResult.valid, false);
  assert.ok(result.leakage_summary.violations > 0);
  assert.equal(result.leakage_summary.invalid_cases, 1);
});

test("Stage 7 benchmark API is offline and returns BenchmarkResult", async () => {
  await withServer(async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/benchmark`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ cases: [firstCase()] })
    });
    const payload = await response.json();

    assert.equal(response.status, 200);
    assert.equal(payload.metadata.stage, "7");
    assert.equal(payload.metadata.ai_used, false);
    assert.equal(payload.metadata.ranking_modified, false);
    assert.equal(payload.metadata.rectification_modified, false);
    assert.equal(payload.benchmark_result.schema_version, "stage7.v1");
  });
});

test("Stage 7 source does not call real AI provider or mutate ranking paths", () => {
  const files = [
    "../src/evalTypes.ts",
    "../src/evalCaseSchema.ts",
    "../src/holdoutBuilder.ts",
    "../src/leakageGuard.ts",
    "../src/evaluationModes.ts",
    "../src/forecastJudge.ts",
    "../src/benchmarkRunner.ts"
  ];

  for (const file of files) {
    const source = readFileSync(fileURLToPath(new URL(file, import.meta.url)), "utf8");
    for (const token of ["runPredictionWithConfiguredProvider", "runFutureForecast", "rankCandidates", "runRectificationV2", "OPENAI_API_KEY", "ANTHROPIC_API_KEY", "fetch(", "https://"]) {
      assert.equal(source.includes(token), false, `${file} contains forbidden token ${token}`);
    }
  }
});
