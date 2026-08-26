import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { generateCandidateHours } from "../src/candidateGeneration.ts";
import { loadScoringConfig } from "../src/config.ts";
import { normalizeContextBox } from "../src/contextBox.ts";
import { scoreEventBacktest } from "../src/eventBacktest.ts";
import { mockPredictionProvider } from "../src/mockPredictionProvider.ts";
import { classifyPredictionDomain } from "../src/predictionDomain.ts";
import { cloneRankingSnapshot } from "../src/predictionPolicy.ts";
import { buildPredictionReport } from "../src/reportBuilder.ts";
import { reportToMarkdown } from "../src/reportMarkdown.ts";
import { assertNoExportSecrets, redactForExport } from "../src/reportRedaction.ts";
import { rankCandidates } from "../src/ranking.ts";
import { createBaziUiServer } from "../src/server.ts";
import { scoreSymbolPrior } from "../src/symbolPrior.ts";
import type { BirthInput, LifeEvent, SymbolAnswer } from "../src/types.ts";
import type { PredictionRequest, PredictionResult, RankingSnapshot } from "../src/predictionTypes.ts";

async function withServer<T>(run: (baseUrl: string) => Promise<T>): Promise<T> {
  const server = createBaziUiServer();
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  if (!address || typeof address === "string") throw new Error("Test server did not expose a TCP address.");
  const baseUrl = `http://127.0.0.1:${address.port}`;
  try {
    return await run(baseUrl);
  } finally {
    await new Promise<void>((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
  }
}

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
  const lifeEvents: LifeEvent[] = [
    { year: 2018, type: "education", description: "fictional education event" },
    { year: 2021, type: "career", description: "fictional career event" }
  ];
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
    domain: classifyPredictionDomain("career direction"),
    rankingSnapshot,
    contextBox: normalizeContextBox([{ field: "desired_direction", value: "fictional product strategy path", confidence: 0.8 }]),
    lifeEvents
  };
}

function fixtureReportInput(exportFormat: "json" | "markdown" = "json") {
  const request = fixtureRequest();
  const predictionResult = mockPredictionProvider.predict(request);
  return { request, predictionResult, exportFormat };
}

test("report builder outputs complete Stage 4C schema", () => {
  const { request, predictionResult } = fixtureReportInput();
  const report = buildPredictionReport({
    rankingSnapshot: request.rankingSnapshot,
    contextBox: request.contextBox,
    predictionResult,
    exportFormat: "json",
    generatedAt: "2026-06-06T12:00:00.000Z"
  });

  for (const field of [
    "report_id",
    "generated_at",
    "version",
    "ranking_snapshot_summary",
    "selected_candidate_summary",
    "context_box_summary",
    "prediction_result",
    "policy",
    "privacy_notice",
    "export_metadata"
  ]) {
    assert.ok(field in report, `missing report field: ${field}`);
  }
  assert.equal(report.policy.ai_used_for_ranking, false);
  assert.equal(report.policy.ranking_modified_by_ai, false);
  assert.equal(report.policy.context_box_used_for_ranking, false);
  assert.equal(report.policy.context_box_used_for_prediction, true);
  assert.equal(report.policy.api_key_exported, false);
  assert.equal(report.policy.raw_provider_payload_exported, false);
});

test("report builder redacts API keys and raw provider payloads", () => {
  const { request, predictionResult } = fixtureReportInput();
  const dirtyPrediction = {
    ...predictionResult,
    raw_provider_request: { api_key: "sk-" + "a".repeat(24), prompt: "hidden" },
    raw_provider_response: { text: "hidden" },
    process_env: { ["OPENAI" + "_API_KEY"]: "sk-" + "b".repeat(24) }
  } as PredictionResult & Record<string, unknown>;

  const report = buildPredictionReport({
    rankingSnapshot: request.rankingSnapshot,
    contextBox: request.contextBox,
    predictionResult: dirtyPrediction,
    exportFormat: "json"
  });
  const serialized = JSON.stringify(report);
  assertNoExportSecrets(report);
  assert.equal(serialized.includes("sk-" + "a".repeat(24)), false);
  assert.equal(serialized.includes("sk-" + "b".repeat(24)), false);
  assert.equal(serialized.includes("raw_provider_request"), false);
  assert.equal(serialized.includes("raw_provider_response"), false);
  assert.equal(serialized.includes("process_env"), false);
});

test("report redaction covers current OpenAI GitHub and bearer token forms", () => {
  const tokens = [
    `sk-proj-${"a".repeat(24)}`,
    `github_pat_${"b".repeat(24)}`,
    `ghp_${"c".repeat(24)}`,
    `Bearer ${"d".repeat(24)}`
  ];
  const redacted = redactForExport({ notes: tokens });
  const serialized = JSON.stringify(redacted);
  for (const token of tokens) assert.equal(serialized.includes(token), false);
  assertNoExportSecrets(redacted);
});

test("markdown export contains core report sections and is secret-free", () => {
  const { request, predictionResult } = fixtureReportInput("markdown");
  const report = buildPredictionReport({
    rankingSnapshot: request.rankingSnapshot,
    contextBox: request.contextBox,
    predictionResult,
    exportFormat: "markdown"
  });
  const markdown = reportToMarkdown(report);
  for (const section of [
    "# BaZi Context Prediction Report",
    "## Ranking Summary",
    "## Context Box Summary",
    "## Prediction Conclusion",
    "## Provider Status",
    "## Privacy Notice"
  ]) {
    assert.match(markdown, new RegExp(section.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
  assertNoExportSecrets(markdown);
});

test("JSON export is serializable", () => {
  const { request, predictionResult } = fixtureReportInput();
  const report = buildPredictionReport({
    rankingSnapshot: request.rankingSnapshot,
    contextBox: request.contextBox,
    predictionResult,
    exportFormat: "json"
  });
  assert.deepEqual(JSON.parse(JSON.stringify(report)).report_id, report.report_id);
});

test("report API validates required inputs", async () => {
  await withServer(async (baseUrl) => {
    const missingRanking = await fetch(`${baseUrl}/api/report`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ predictionResult: { conclusion: "x" } })
    });
    const missingRankingPayload = await missingRanking.json();
    assert.equal(missingRanking.status, 400);
    assert.equal(missingRankingPayload.error.code, "MISSING_RANKING_SNAPSHOT");

    const { request } = fixtureReportInput();
    const missingPrediction = await fetch(`${baseUrl}/api/report`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ rankingSnapshot: request.rankingSnapshot })
    });
    const missingPredictionPayload = await missingPrediction.json();
    assert.equal(missingPrediction.status, 400);
    assert.equal(missingPredictionPayload.error.code, "MISSING_PREDICTION_RESULT");
  });
});

test("report API returns JSON and markdown without mutating rankingSnapshot", async () => {
  await withServer(async (baseUrl) => {
    const { request, predictionResult } = fixtureReportInput();
    const before = cloneRankingSnapshot(request.rankingSnapshot);
    const jsonResponse = await fetch(`${baseUrl}/api/report`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        rankingSnapshot: request.rankingSnapshot,
        contextBox: request.contextBox,
        predictionResult,
        exportFormat: "json"
      })
    });
    const jsonPayload = await jsonResponse.json();
    assert.equal(jsonResponse.status, 200);
    assert.equal(jsonPayload.format, "json");
    assert.equal(jsonPayload.report.policy.ai_used_for_ranking, false);
    assert.deepEqual(request.rankingSnapshot, before);

    const markdownResponse = await fetch(`${baseUrl}/api/report`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        rankingSnapshot: request.rankingSnapshot,
        contextBox: request.contextBox,
        predictionResult,
        exportFormat: "markdown"
      })
    });
    const markdownPayload = await markdownResponse.json();
    assert.equal(markdownResponse.status, 200);
    assert.equal(markdownPayload.format, "markdown");
    assert.match(markdownPayload.markdown, /BaZi Context Prediction Report/);
    assert.deepEqual(request.rankingSnapshot, before);
    assertNoExportSecrets(jsonPayload);
    assertNoExportSecrets(markdownPayload);
  });
});

test("report API route does not call ranking or prediction providers", () => {
  const source = readFileSync(fileURLToPath(new URL("../src/server.ts", import.meta.url)), "utf8");
  const reportRoute = source.slice(source.indexOf('url.pathname === "/api/report"'));
  assert.ok(reportRoute.length > 0);
  const routeBody = reportRoute.slice(0, reportRoute.indexOf('return error(response, 404'));
  for (const token of ["runDeterministicFlow(", "rankCandidates(", "runPredictionWithConfiguredProvider(", "createOpenAiPredictionProvider("]) {
    assert.equal(routeBody.includes(token), false, `report route should not call ${token}`);
  }
});

test("provider status and report output do not expose env key names or values", async () => {
  await withServer(async (baseUrl) => {
    const home = await fetch(`${baseUrl}/`).then((response) => response.text());
    assert.equal(home.includes("OPENAI_API_KEY"), false);
    assert.equal(/sk-[A-Za-z0-9]{20,}/.test(home), false);

    const { request, predictionResult } = fixtureReportInput();
    const response = await fetch(`${baseUrl}/api/report`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ rankingSnapshot: request.rankingSnapshot, contextBox: request.contextBox, predictionResult })
    });
    const payload = await response.json();
    assertNoExportSecrets(payload);
    assert.equal(JSON.stringify(payload).includes("OPENAI_API_KEY"), false);
  });
});

test("UI HTML contains the canonical forecast report and privacy controls", async () => {
  await withServer(async (baseUrl) => {
    const html = await fetch(`${baseUrl}/`).then((response) => response.text());
    for (const token of [
      'id="forecast-domain-list"',
      'id="forecast-uncertainty-list"',
      'data-action="export-session"',
      'id="privacy-dialog"',
      "校时排名全部在浏览器本地执行，不调用 AI",
      "不会把出生资料、人生事件或报告写入 localStorage",
      "导出内容可能包含你填写的敏感人生事件"
    ]) {
      assert.match(html, new RegExp(token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
    }
  });
});
