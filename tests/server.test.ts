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
    for (const step of ["birth_input", "symbol_prior", "event_backtest", "context_box", "ranking_result"]) {
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
  });
});

test("server source has no provider imports or calls", () => {
  const source = readFileSync(fileURLToPath(new URL("../src/server.ts", import.meta.url)), "utf8").toLowerCase();
  for (const token of ["openai", "anthropic", "llm", "model provider", "@ai-sdk", "langchain", "llamaindex", "gemini", "openai_api_key"]) {
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
});
