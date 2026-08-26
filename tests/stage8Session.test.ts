import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { buildForecastInput } from "../src/forecastInputBuilder.ts";
import { buildPrivacyNotice } from "../src/privacyNotice.ts";
import { exportSession, exportSessionJson } from "../src/sessionExport.ts";
import { importSession, importSessionWithoutOverwriting } from "../src/sessionImport.ts";
import { containsSensitiveValue, redactSessionForExport, redactString } from "../src/sessionRedaction.ts";
import { BrowserLocalSessionStore, MemorySessionStore } from "../src/sessionStore.ts";
import { validateSessionState, type SessionExport, type SessionState, type StorageLike } from "../src/sessionTypes.ts";
import { clearAllLocalData, deleteFact, getForecastVisibleContextFacts, hideFactFromExport, hideFactFromForecast } from "../src/userControls.ts";
import { createBaziUiServer } from "../src/server.ts";
import type { ForecastInputBuildRequest } from "../src/forecastInputTypes.ts";

function fixture<T>(name: string): T {
  return JSON.parse(readFileSync(fileURLToPath(new URL(`../fixtures/${name}`, import.meta.url)), "utf8")) as T;
}

function sessionFixture(): SessionState {
  return fixture("stage8_session.mock.json");
}

function forecastRequest(): ForecastInputBuildRequest {
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

test("Stage 8 SessionState fixture validates", () => {
  const validation = validateSessionState(sessionFixture());

  assert.equal(validation.valid, true);
  assert.equal(sessionFixture().privacy_metadata.local_only, true);
  assert.equal(sessionFixture().privacy_metadata.cloud_sync_enabled, false);
});

test("Stage 8 MemorySessionStore and BrowserLocalSessionStore save load and clear", () => {
  const session = sessionFixture();
  const memory = new MemorySessionStore();
  memory.save(session);
  assert.deepEqual(memory.load()?.session_id, session.session_id);
  memory.clear();
  assert.equal(memory.load(), null);

  const backing = new Map<string, string>();
  const storage: StorageLike = {
    getItem: (key) => backing.get(key) ?? null,
    setItem: (key, value) => void backing.set(key, value),
    removeItem: (key) => void backing.delete(key)
  };
  const browser = new BrowserLocalSessionStore(storage, "test-session");
  browser.save(session);
  assert.equal(browser.load()?.session_id, session.session_id);
  browser.clear();
  assert.equal(browser.load(), null);
});

test("Stage 8 export redacts hidden facts secrets env content and local paths", () => {
  const session = sessionFixture();
  session.context_box.push({
    fact_id: "secret_001",
    category: "identity",
    field: "local_secret",
    value: "OPENAI_API_KEY=sk-test-placeholder .env=private C:/Users/theod/private/file.txt",
    source: "test",
    visibility: { use_in_forecast: true, include_in_export: true, include_in_report: true },
    deleted_at: null
  });
  const exported = exportSession(session, "2026-06-07T00:00:00.000Z");
  const text = JSON.stringify(exported);

  assert.equal(text.includes("private health detail"), false);
  assert.equal(text.includes("sk-test-placeholder"), false);
  assert.equal(text.includes("C:/Users/theod/private"), false);
  assert.equal(exported.redaction_metadata.secrets_included, false);
  assert.equal(exported.redaction_metadata.redacted_fields_count > 0, true);
});

test("Stage 8 import rejects malformed JSON secrets and unsupported schema without overwriting current session", () => {
  const current = sessionFixture();
  assert.equal(importSession("{bad json").error?.code, "MALFORMED_JSON");
  assert.equal(importSession({ schema_version: "old", session: current }).error?.code, "UNSUPPORTED_SCHEMA");
  assert.equal(importSession({ schema_version: "stage8.session_export.v1", session_id: "x", exported_at: "now", session: { ...current, context_box: [{ value: "sk-test-placeholder" }] } }).error?.code, "SECRET_DETECTED");

  const invalid = importSessionWithoutOverwriting(current, "{bad json");
  assert.equal(invalid.result.ok, false);
  assert.equal(invalid.session.session_id, current.session_id);
});

test("Stage 8 delete hide and clear controls update session safely", async () => {
  const session = sessionFixture();
  const hiddenForecast = hideFactFromForecast(session, "family_001");
  assert.equal(hiddenForecast.context_box.find((fact) => fact.fact_id === "family_001")?.visibility.use_in_forecast, false);

  const hiddenExport = hideFactFromExport(session, "family_001");
  assert.equal(hiddenExport.context_box.find((fact) => fact.fact_id === "family_001")?.visibility.include_in_export, false);

  const deleted = deleteFact(session, "family_001", "2026-06-07T00:00:00.000Z");
  const deletedFact = deleted.context_box.find((fact) => fact.fact_id === "family_001");
  assert.equal(deletedFact?.value, null);
  assert.equal(deleted.user_controls.deleted_fact_ids.includes("family_001"), true);

  const store = new MemorySessionStore();
  store.save(session);
  const cleared = await clearAllLocalData(store, session, "2026-06-07T00:00:00.000Z") as SessionState;
  assert.equal(store.load(), null);
  assert.equal(cleared.context_box.length, 0);
  assert.equal(cleared.privacy_metadata.last_cleared_at, "2026-06-07T00:00:00.000Z");
});

test("Stage 8 hide_from_forecast excludes fact from ForecastInput without changing builder semantics", () => {
  const session = hideFactFromForecast(sessionFixture(), "family_001");
  const request = forecastRequest();
  const input = buildForecastInput({
    ...request,
    context_box: getForecastVisibleContextFacts(session)
  });
  const fields = input.initial_value.context_facts.map((fact) => fact.field);

  assert.equal(fields.includes("parental_education"), false);
  assert.equal(fields.includes("private_detail"), true);
});

test("Stage 8 hide_from_export and deleted values are redacted from export", () => {
  const hidden = hideFactFromExport(sessionFixture(), "family_001");
  const deleted = deleteFact(hidden, "health_001", "2026-06-07T00:00:00.000Z");
  const redacted = redactSessionForExport(deleted, "2026-06-07T00:00:00.000Z");
  const exportedText = JSON.stringify(redacted.session);

  assert.equal(exportedText.includes("highly_educated"), false);
  assert.equal(exportedText.includes("private health detail"), false);
  assert.equal(redacted.session.context_box.find((fact) => fact.fact_id === "health_001")?.value, null);
});

test("Stage 8 redaction catches API-key-like strings and local paths", () => {
  assert.equal(containsSensitiveValue("OPENAI_API_KEY=sk-test-placeholder"), true);
  assert.equal(containsSensitiveValue(`sk-proj-${"a".repeat(24)}`), true);
  assert.equal(containsSensitiveValue(`github_pat_${"b".repeat(24)}`), true);
  assert.equal(containsSensitiveValue(`ghp_${"c".repeat(24)}`), true);
  assert.equal(containsSensitiveValue(`Bearer ${"d".repeat(24)}`), true);
  assert.equal(redactString("C:/Users/theod/private/file.txt").value, "[REDACTED:local_path]");
});

test("Stage 8 privacy notice and canonical public privacy controls are present", async () => {
  assert.ok(buildPrivacyNotice().includes("local-first"));
  assert.ok(buildPrivacyNotice().includes("no server-side data store"));

  await withServer(async (baseUrl) => {
    const html = await fetch(`${baseUrl}/`).then((response) => response.text());
    for (const text of ["仅在当前标签页", "退出并清除", "导出会话 JSON", "不会把出生资料", "当前公开版本没有账户"]) {
      assert.equal(html.includes(text), true, `missing UI text: ${text}`);
    }
    assert.equal(html.includes("localStorage.setItem"), false);
  });
});

test("Stage 8 source does not modify ranking rectification forecast semantics or introduce systems", () => {
  const files = [
    "../src/sessionTypes.ts",
    "../src/sessionStore.ts",
    "../src/sessionRedaction.ts",
    "../src/sessionExport.ts",
    "../src/sessionImport.ts",
    "../src/userControls.ts",
    "../src/privacyNotice.ts"
  ];
  for (const file of files) {
    const source = readFileSync(fileURLToPath(new URL(file, import.meta.url)), "utf8").toLowerCase();
    for (const token of ["rankcandidates", "runrectificationv2", "runfutureforecast", "openaiPredictionProvider", "runPredictionWithConfiguredProvider", "createOpenAiPredictionProvider"]) {
      assert.equal(source.includes(token), false, `${file} contains forbidden token ${token}`);
    }
  }

  const exported = exportSessionJson(sessionFixture());
  const parsed = JSON.parse(exported) as SessionExport;
  assert.equal(parsed.schema_version, "stage8.session_export.v1");
  assert.equal(parsed.redaction_metadata.secrets_included, false);
});
