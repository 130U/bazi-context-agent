import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { buildForecastInput, ForecastInputBuildError } from "../src/forecastInputBuilder.ts";
import { validateForecastInput } from "../src/forecastInputValidator.ts";
import { createBaziUiServer } from "../src/server.ts";

function fixture<T>(name: string): T {
  return JSON.parse(readFileSync(fileURLToPath(new URL(`../fixtures/${name}`, import.meta.url)), "utf8")) as T;
}

function baseRequest(): any {
  return fixture("stage5e_forecast_input_request.json");
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

test("Stage 5E valid request builds ForecastInput", () => {
  const request = baseRequest();
  const input = buildForecastInput(request);

  assert.equal(input.schema_version, "stage5e.v1");
  assert.equal(input.current_date, request.current_date);
  assert.equal(input.forecast_request.forecast_horizon, "1_year");
  assert.deepEqual(input.forecast_request.forecast_domains, ["career", "wealth"]);
  assert.equal(input.selected_chart.chart_id, request.selected_chart.chart_id);
  assert.equal(input.derivative_function.profile_id, request.derivative_profile.profile_id);
  assert.equal(input.boundaries.ai_used_to_build_forecast_input, false);
  assert.equal(input.boundaries.ai_allowed_in_stage6_forecast, true);
  assert.equal(input.boundaries.context_box_used_for_rectification, false);
  assert.equal(input.boundaries.secrets_included, false);

  const validation = validateForecastInput(input);
  assert.equal(validation.valid, true, validation.errors.join("; "));
});

test("Stage 5E required request fields return clear errors", () => {
  const request = baseRequest();
  assert.throws(() => buildForecastInput({ ...request, selected_chart: undefined }), (error) => error instanceof ForecastInputBuildError && error.code === "MISSING_SELECTED_CHART");
  assert.throws(() => buildForecastInput({ ...request, derivative_profile: undefined }), (error) => error instanceof ForecastInputBuildError && error.code === "MISSING_DERIVATIVE_PROFILE");
  assert.throws(() => buildForecastInput({ ...request, user_question: "" }), (error) => error instanceof ForecastInputBuildError && error.code === "MISSING_USER_QUESTION");
});

test("Stage 5E rejects invalid horizon and domain", () => {
  const request = baseRequest();
  assert.throws(() => buildForecastInput({ ...request, forecast_horizon: "99_years" }), (error) => error instanceof ForecastInputBuildError && error.code === "INVALID_FORECAST_HORIZON");
  assert.throws(() => buildForecastInput({ ...request, forecast_domains: ["career", "forbidden_domain"] }), (error) => error instanceof ForecastInputBuildError && error.code === "INVALID_FORECAST_DOMAIN");
});

test("Stage 5E separates derivative function from initial value", () => {
  const request = baseRequest();
  const input = buildForecastInput(request);

  assert.equal(input.derivative_function.profile_id, request.derivative_profile.profile_id);
  assert.equal(input.initial_value.context_facts.length, request.context_box.length);
  assert.equal(input.initial_value.known_life_events.length, request.known_life_events.length);
  assert.equal(JSON.stringify(input.derivative_function).includes("context_box"), false);
  assert.equal(JSON.stringify(input.selected_chart).includes("context_box"), false);
});

test("Stage 5E emits provenance and keeps known facts out of prediction fields", () => {
  const input = buildForecastInput(baseRequest());

  assert.ok(input.data_provenance.some((item) => item.field_path === "derivative_function" && item.source === "bazi_derived_profile"));
  assert.ok(input.data_provenance.some((item) => item.field_path === "initial_value.context_facts" && item.source === "context_box"));
  assert.ok(input.data_provenance.some((item) => item.field_path === "initial_value.known_life_events" && item.source === "known_life_events"));
  assert.equal("prediction" in input, false);
  assert.ok(input.warnings.some((warning) => warning.includes("does not generate future predictions")));
});

test("Stage 5E does not mutate selected_chart or rectification_result", () => {
  const request = baseRequest();
  const selectedBefore = JSON.parse(JSON.stringify(request.selected_chart));
  const rectificationBefore = JSON.parse(JSON.stringify(request.rectification_result));

  buildForecastInput(request);

  assert.deepEqual(request.selected_chart, selectedBefore);
  assert.deepEqual(request.rectification_result, rectificationBefore);
});

test("Stage 5E validator rejects secrets", () => {
  const input = buildForecastInput(baseRequest());
  const withSecret = {
    ...input,
    initial_value: {
      ...input.initial_value,
      context_facts: [
        ...input.initial_value.context_facts,
        {
          fact_id: "secret",
          category: "debug",
          field: "key",
          value: "OPENAI_API_KEY",
          source: "test",
          confidence: 1,
          fact_type: "direct_fact"
        }
      ]
    }
  };

  const validation = validateForecastInput(withSecret);
  assert.equal(validation.valid, false);
  assert.ok(validation.errors.some((error) => error.includes("secrets")));
});

test("Stage 5E API returns ForecastInput and metadata", async () => {
  await withServer(async (baseUrl) => {
    const request = baseRequest();
    const beforeSelected = JSON.parse(JSON.stringify(request.selected_chart));
    const beforeRectification = JSON.parse(JSON.stringify(request.rectification_result));
    const response = await fetch(`${baseUrl}/api/forecast-input`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(request)
    });
    const payload = await response.json();

    assert.equal(response.status, 200);
    assert.equal(payload.metadata.stage, "5E");
    assert.equal(payload.metadata.ai_used, false);
    assert.equal(payload.metadata.ready_for_stage6, true);
    assert.equal(payload.forecast_input.schema_version, "stage5e.v1");
    assert.equal(payload.forecast_input.boundaries.ranking_modified, false);
    assert.equal(payload.forecast_input.boundaries.rectification_modified, false);
    assert.deepEqual(request.selected_chart, beforeSelected);
    assert.deepEqual(request.rectification_result, beforeRectification);
  });
});

test("Stage 5E API returns clear validation errors", async () => {
  await withServer(async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/forecast-input`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ...baseRequest(), derivative_profile: undefined })
    });
    const payload = await response.json();

    assert.equal(response.status, 400);
    assert.equal(payload.error.code, "MISSING_DERIVATIVE_PROFILE");
  });
});

test("Stage 5E forecast input path does not call ranking rectification prediction or providers", () => {
  const builder = readFileSync(fileURLToPath(new URL("../src/forecastInputBuilder.ts", import.meta.url)), "utf8");
  const validator = readFileSync(fileURLToPath(new URL("../src/forecastInputValidator.ts", import.meta.url)), "utf8");
  const server = readFileSync(fileURLToPath(new URL("../src/server.ts", import.meta.url)), "utf8");
  const routeStart = server.indexOf('url.pathname === "/api/forecast-input"');
  const routeEnd = server.indexOf('url.pathname === "/api/prediction"', routeStart);
  const route = server.slice(routeStart, routeEnd);

  for (const source of [builder, route]) {
    for (const token of ["rankCandidates", "runRectificationV2(", "runPredictionWithConfiguredProvider", "createOpenAi", "OPENAI_API_KEY", "ANTHROPIC_API_KEY"]) {
      assert.equal(source.includes(token), false, `found forbidden token: ${token}`);
    }
  }
  for (const token of ["rankCandidates", "runRectificationV2(", "runPredictionWithConfiguredProvider", "createOpenAi"]) {
    assert.equal(validator.includes(token), false, `found forbidden token: ${token}`);
  }
});
