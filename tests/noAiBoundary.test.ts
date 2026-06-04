import test from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

test("candidate ranking path has no AI provider import or calls", () => {
  const root = fileURLToPath(new URL("../src", import.meta.url));
  const forbidden = ["openai", "anthropic", "llm", "model provider", "@ai-sdk", "langchain", "llamaindex", "gemini", "openai_api_key"];

  function files(dir: string): string[] {
    return readdirSync(dir).flatMap((entry) => {
      const path = join(dir, entry);
      return statSync(path).isDirectory() ? files(path) : [path];
    });
  }

  const source = files(root)
    .filter((path) => path.endsWith(".ts"))
    .map((path) => readFileSync(path, "utf8").toLowerCase())
    .join("\n");

  for (const token of forbidden) assert.equal(source.includes(token), false, `found forbidden provider token: ${token}`);
});
