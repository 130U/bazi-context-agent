import test from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { extname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createBaziUiServer } from "../src/server.ts";

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

test("server can start and close", async () => {
  await withServer(async (baseUrl) => {
    const response = await fetch(`${baseUrl}/`);
    assert.equal(response.status, 200);
  });
});

test("home page returns HTML with five-step flow", async () => {
  await withServer(async (baseUrl) => {
    const response = await fetch(`${baseUrl}/`);
    const html = await response.text();
    assert.match(response.headers.get("content-type") ?? "", /text\/html/);
    assert.match(html, /BaZi Context Agent/);
    for (const step of ["birth_input", "symbol_prior", "event_backtest", "context_box", "ranking_result", "prediction_result"]) {
      assert.match(html, new RegExp(step));
    }
    assert.match(html, /Symbol prior is weak/);
  });
});

test("questionnaire API returns four layers", async () => {
  await withServer(async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/questionnaire`);
    const payload = await response.json();
    assert.deepEqual(payload.layers, ["birth_input", "symbol_prior", "event_backtest", "context_box"]);
    assert.equal(payload.questions.stages.length, 4);
  });
});

test("symbol API returns G1 G2 G3 labels", async () => {
  await withServer(async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/symbol-prior`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        birth_input: { chart_sex: "female" },
        answers: [{ question_id: "B1_hair_whorl", value: "one_offset" }]
      })
    });
    const payload = await response.json();
    assert.equal(payload.G1.label, "子午卯酉");
    assert.equal(payload.G2.label, "寅申巳亥");
    assert.equal(payload.G3.label, "辰戌丑未");
    assert.ok(payload.evidence.length > 0);
  });
});

test("candidate API returns two to six candidates", async () => {
  await withServer(async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/candidates`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        birth_input: {
          birth_date: "1998-05-10",
          birth_place: "Shanghai, China",
          recorded_time: "22:50",
          uncertainty_range: "auto",
          boundary_flags: ["near_hour_boundary", "near_zi_hour"],
          chart_sex: "female"
        }
      })
    });
    const payload = await response.json();
    assert.ok(payload.candidates.length >= 2);
    assert.ok(payload.candidates.length <= 6);
  });
});

test("ranking API returns top 3 and evidence fields", async () => {
  await withServer(async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/ranking`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        birth_input: {
          birth_date: "1998-05-10",
          birth_place: "Shanghai, China",
          recorded_time: "22:50",
          uncertainty_range: "auto",
          boundary_flags: ["near_hour_boundary", "near_zi_hour"],
          chart_sex: "female"
        },
        symbol_answers: [{ question_id: "B1_hair_whorl", value: "one_offset" }],
        life_events: [{ year: 2018, event_type: "education", description: "fictional event" }],
        context_facts: [{ field: "desired_direction", value: "fictional technology direction", confidence: 0.5 }]
      })
    });
    const payload = await response.json();
    assert.equal(payload.top_candidates.length, 3);
    for (const candidate of payload.top_candidates) assert.equal(typeof candidate.confidence, "number");
    assert.ok(Array.isArray(payload.evidence_table));
    assert.ok(Array.isArray(payload.contradictions));
    assert.ok(Array.isArray(payload.missing_information));
    assert.ok(Array.isArray(payload.context_box_preview));
    assert.equal(payload.ranking_context_policy, "context_box_preview_only_not_used_for_ranking");
    assert.equal(payload.context_facts_used_for_ranking, 0);
  });
});

test("prediction API requires rankingSnapshot", async () => {
  await withServer(async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/prediction`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ question: "career direction", contextBox: [] })
    });
    const payload = await response.json();
    assert.equal(response.status, 400);
    assert.equal(payload.error.code, "MISSING_RANKING_SNAPSHOT");
  });
});

test("prediction API returns mock result without mutating rankingSnapshot", async () => {
  await withServer(async (baseUrl) => {
    const rankingResponse = await fetch(`${baseUrl}/api/ranking`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        birth_input: {
          birth_date: "1998-05-10",
          birth_place: "Shanghai, China",
          recorded_time: "22:50",
          uncertainty_range: "auto",
          boundary_flags: ["near_hour_boundary", "near_zi_hour"],
          chart_sex: "female"
        },
        symbol_answers: [{ question_id: "B1_hair_whorl", value: "one_offset" }],
        life_events: [{ year: 2018, event_type: "education", description: "fictional event" }]
      })
    });
    const ranking = await rankingResponse.json();
    const rankingSnapshot = {
      top_candidate_id: ranking.top_candidates[0].candidate.candidate_id,
      top_3: ranking.top_candidates,
      evidence_table: ranking.evidence_table,
      contradictions: ranking.contradictions,
      missing_information: ranking.missing_information,
      should_not_force_single_hour: ranking.should_not_force_single_hour
    };
    const before = JSON.parse(JSON.stringify(rankingSnapshot));
    const predictionResponse = await fetch(`${baseUrl}/api/prediction`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        question: "What career direction fits this context?",
        rankingSnapshot,
        contextBox: [{ field: "desired_direction", value: "fictional technology path", confidence: 0.8 }],
        lifeEvents: [{ year: 2018, event_type: "education", description: "fictional event" }]
      })
    });
    const prediction = await predictionResponse.json();
    assert.equal(predictionResponse.status, 200);
    assert.equal(prediction.policy.provider, "mock");
    assert.equal(prediction.policy.ai_used_for_ranking, false);
    assert.equal(prediction.policy.ranking_modified_by_ai, false);
    assert.ok(Array.isArray(prediction.known_facts));
    assert.ok(Array.isArray(prediction.chart_signals));
    assert.ok(Array.isArray(prediction.context_adjustments));
    assert.equal(typeof prediction.prediction.answer, "string");
    assert.equal(typeof prediction.confidence, "number");
    assert.deepEqual(rankingSnapshot, before);
  });
});

test("context box preview does not affect Round 03 ranking", async () => {
  await withServer(async (baseUrl) => {
    const basePayload = {
      birth_input: {
        birth_date: "1998-05-10",
        birth_place: "Shanghai, China",
        recorded_time: "22:50",
        uncertainty_range: "auto",
        boundary_flags: ["near_hour_boundary", "near_zi_hour"],
        chart_sex: "female"
      },
      symbol_answers: [
        { question_id: "B1_hair_whorl", value: "one_offset" },
        { question_id: "B4_little_finger_length", value: "aligned" }
      ],
      life_events: [
        { year: 2018, event_type: "education", description: "fictional education event" },
        { year: 2021, event_type: "career", description: "fictional career event" }
      ]
    };
    const postRanking = async (contextFacts: unknown[]) => {
      const response = await fetch(`${baseUrl}/api/ranking`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...basePayload, context_facts: contextFacts })
      });
      return response.json();
    };

    const first = await postRanking([{ field: "desired_direction", value: "fictional art path", confidence: 0.1 }]);
    const second = await postRanking([{ field: "desired_direction", value: "fictional finance path", confidence: 0.99 }]);

    const stableShape = (payload: any) => ({
      ids: payload.top_candidates.map((item: any) => item.candidate.candidate_id),
      scores: payload.top_candidates.map((item: any) => item.totalScore),
      confidence: payload.top_candidates.map((item: any) => item.confidence),
      evidenceTable: payload.evidence_table
    });

    assert.deepEqual(stableShape(first), stableShape(second));
    assert.notDeepEqual(first.context_box_preview, second.context_box_preview);
    assert.equal(first.context_facts_used_for_ranking, 0);
    assert.equal(second.context_facts_used_for_ranking, 0);
    assert.equal(first.ranking_context_policy, "context_box_preview_only_not_used_for_ranking");
    assert.equal(second.ranking_context_policy, "context_box_preview_only_not_used_for_ranking");
  });
});

test("server source has no provider imports or calls", () => {
  const source = readFileSync(fileURLToPath(new URL("../src/server.ts", import.meta.url)), "utf8").toLowerCase();
  for (const token of ["openai", "anthropic", "llm", "model provider", "@ai-sdk", "langchain", "llamaindex", "gemini", "openai_api_key", "anthropic_api_key"]) {
    assert.equal(source.includes(token), false, `found forbidden token: ${token}`);
  }
});

test("project does not use heavy frontend framework dependencies or JSX", () => {
  const root = fileURLToPath(new URL("..", import.meta.url));
  const pkg = readFileSync(join(root, "package.json"), "utf8").toLowerCase();
  for (const token of ["react", "next", "vite", "vue", "svelte"]) assert.equal(pkg.includes(token), false, `found dependency token: ${token}`);

  function files(dir: string): string[] {
    return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
      const path = join(dir, entry.name);
      return entry.isDirectory() ? files(path) : [path];
    });
  }

  const sourceFiles = files(join(root, "src"));
  assert.equal(sourceFiles.some((path) => [".tsx", ".jsx"].includes(extname(path))), false);

  const source = sourceFiles.map((path) => readFileSync(path, "utf8").toLowerCase()).join("\n");
  for (const token of ["login", "payment", "database", "sqlite", "postgres", "mysql", "prisma", "stripe"]) {
    assert.equal(source.includes(token), false, `found scope-creep token: ${token}`);
  }
});
