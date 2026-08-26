import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { runFutureForecast } from "../src/futureForecastEngine.ts";
import { buildFutureForecastPromptInput } from "../src/futureForecastPromptBuilder.ts";
import { validateFutureForecastResult } from "../src/futureForecastSchema.ts";
import { createMockFutureForecastProvider } from "../src/mockFutureForecastProvider.ts";
import { createBaziUiServer } from "../src/server.ts";
import type { ForecastInput } from "../src/forecastInputTypes.ts";
import type { FutureForecastResult } from "../src/futureForecastTypes.ts";

function fixture<T>(name: string): T {
  return JSON.parse(readFileSync(fileURLToPath(new URL(`../fixtures/${name}`, import.meta.url)), "utf8")) as T;
}

function forecastInput(): ForecastInput {
  return fixture("stage6_forecast_input.json");
}

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

test("Stage 6 ForecastInput fixture loads and validates", () => {
  const input = forecastInput();
  assert.equal(input.schema_version, "stage5e.v1");
  assert.equal(input.boundaries.ai_used_to_build_forecast_input, false);
  assert.equal(input.boundaries.ai_allowed_in_stage6_forecast, true);
  assert.ok(input.forecast_request.forecast_domains.includes("personal_growth" as never));
});

test("Stage 6 prompt builder separates known facts derivative signals and adjustments", () => {
  const prompt = buildFutureForecastPromptInput(forecastInput());

  assert.ok(prompt.initial_value_facts.length > 0);
  assert.ok(prompt.derivative_signals.length > 0);
  assert.ok(prompt.initial_value_adjustments.length > 0);
  assert.equal(prompt.initial_value_facts.some((fact) => fact.source === "context_box"), true);
  assert.equal(prompt.derivative_signals.every((signal) => signal.source === "BaziDerivedProfile"), true);
});

test("Stage 6 mock provider returns full schema", async () => {
  const input = forecastInput();
  const prompt = buildFutureForecastPromptInput(input);
  const provider = createMockFutureForecastProvider();
  const result = await provider.forecast({ forecast_input: input, options: { provider: "mock" } }, prompt);

  assert.equal(result.schema_version, "stage6.v1");
  assert.ok(result.executive_summary.length > 0);
  assert.ok(result.domain_forecasts.length > 0);
  assert.ok(Array.isArray(result.timeline_windows));
  assert.ok(Array.isArray(result.opportunity_windows));
  assert.ok(Array.isArray(result.risk_windows));
  assert.ok(Array.isArray(result.recommended_actions));
  assert.ok(Array.isArray(result.uncertainty));
  assert.ok(Array.isArray(result.known_facts_used));
  assert.ok(Array.isArray(result.derivative_signals_used));
  assert.ok(Array.isArray(result.initial_value_adjustments));
  assert.equal(result.policy.provider, "mock");
  assert.equal(result.policy.ai_used_for_ranking, false);
  assert.equal(result.policy.ai_used_for_rectification, false);
  assert.equal(result.policy.selected_chart_modified, false);
  assert.equal(result.policy.output_schema_validated, true);
  assert.equal(validateFutureForecastResult(result).valid, true);
});

test("Stage 6 engine does not mutate ForecastInput selected chart or derivative profile", async () => {
  const input = forecastInput();
  const before = JSON.parse(JSON.stringify(input));
  const result = await runFutureForecast({ forecast_input: input, options: { provider: "mock" } });

  assert.equal(result.policy.provider, "mock");
  assert.deepEqual(input, before);
  assert.deepEqual(input.selected_chart, before.selected_chart);
  assert.deepEqual(input.derivative_function, before.derivative_function);
  assert.deepEqual(input.rectification_summary, before.rectification_summary);
});

test("Stage 6 result keeps known facts separate from forecasts", async () => {
  const result = await runFutureForecast({ forecast_input: forecastInput() });
  const forecastText = result.domain_forecasts.map((item) => item.forecast).join("\n");

  assert.ok(result.known_facts_used.length > 0);
  assert.ok(result.derivative_signals_used.length > 0);
  assert.ok(result.initial_value_adjustments.length > 0);
  assert.equal(result.known_facts_used.some((fact) => forecastText.includes(fact.fact)), false);
});

test("Stage 6 schema validator rejects missing fields policy violations and secrets", () => {
  const valid = fixture<FutureForecastResult>("stage6_future_forecast_result.mock.json");
  assert.equal(validateFutureForecastResult(valid).valid, true);
  assert.equal(validateFutureForecastResult({ ...valid, executive_summary: undefined }).valid, false);
  assert.equal(validateFutureForecastResult({ ...valid, policy: { ...valid.policy, ai_used_for_ranking: true } }).valid, false);
  assert.equal(validateFutureForecastResult({ ...valid, executive_summary: "OPENAI_API_KEY" }).valid, false);
});

test("Stage 6 API rejects missing ForecastInput", async () => {
  await withServer(async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/future-forecast`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({})
    });
    const payload = await response.json();
    assert.equal(response.status, 400);
    assert.equal(payload.error.code, "MISSING_FORECAST_INPUT");
  });
});

test("Stage 6 API returns FutureForecastResult", async () => {
  await withServer(async (baseUrl) => {
    const input = forecastInput();
    const before = JSON.parse(JSON.stringify(input));
    const response = await fetch(`${baseUrl}/api/future-forecast`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ forecast_input: input, options: { provider: "mock" } })
    });
    const payload = await response.json();

    assert.equal(response.status, 200);
    assert.equal(payload.metadata.stage, "6");
    assert.equal(payload.metadata.schema_validated, true);
    assert.equal(payload.metadata.ai_used_for_ranking, false);
    assert.equal(payload.metadata.ai_used_for_rectification, false);
    assert.equal(payload.forecast_result.schema_version, "stage6.v1");
    assert.equal(payload.forecast_result.policy.provider, "mock");
    assert.deepEqual(input, before);
  });
});

test("Stage 6 path does not call ranking rectification forecast-input or real network", () => {
  const engine = readFileSync(fileURLToPath(new URL("../src/futureForecastEngine.ts", import.meta.url)), "utf8");
  const provider = readFileSync(fileURLToPath(new URL("../src/mockFutureForecastProvider.ts", import.meta.url)), "utf8");
  const prompt = readFileSync(fileURLToPath(new URL("../src/futureForecastPromptBuilder.ts", import.meta.url)), "utf8");
  const server = readFileSync(fileURLToPath(new URL("../src/server.ts", import.meta.url)), "utf8");
  const routeStart = server.indexOf('url.pathname === "/api/future-forecast"');
  const routeEnd = server.indexOf('url.pathname === "/api/prediction"', routeStart);
  const route = server.slice(routeStart, routeEnd);

  for (const source of [engine, provider, prompt, route]) {
    for (const token of ["rankCandidates", "runRectificationV2(", "buildForecastInput(", "runPredictionWithConfiguredProvider", "fetch(", "https://", "OPENAI_API_KEY", "ANTHROPIC_API_KEY"]) {
      assert.equal(source.includes(token), false, `found forbidden token: ${token}`);
    }
  }
});
