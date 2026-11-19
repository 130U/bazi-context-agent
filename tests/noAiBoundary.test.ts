import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

test("candidate ranking path has no AI provider import or calls", () => {
  const root = fileURLToPath(new URL("../src", import.meta.url));
  const forbidden = ["openai", "anthropic", "llm", "model provider", "@ai-sdk", "langchain", "llamaindex", "gemini", "openai_api_key", "anthropic_api_key", "predictionprovider"];
  const rankingPathFiles = [
    "branchRelations.ts",
    "candidateGeneration.ts",
    "eventBacktest.ts",
    "hourDefinitions.ts",
    "ranking.ts",
    "symbolPrior.ts"
  ];

  const source = rankingPathFiles
    .map((file) => join(root, file))
    .map((path) => readFileSync(path, "utf8").toLowerCase())
    .join("\n");

  for (const token of forbidden) assert.equal(source.includes(token), false, `found forbidden provider token: ${token}`);
});
