import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const REPOSITORY_ROOT = fileURLToPath(new URL("../", import.meta.url));
const QUESTION_BANK_PATH = resolve(REPOSITORY_ROOT, "configs/question_bank.v1.json");
const SCORING_WEIGHTS_PATH = resolve(REPOSITORY_ROOT, "configs/scoring_weights.v1.json");
export const PUBLIC_RUNTIME_CONFIG_PATH = resolve(REPOSITORY_ROOT, "site/data/runtime-config.json");

function readJson(path: string): unknown {
  return JSON.parse(readFileSync(path, "utf8"));
}

export function createRuntimeConfig() {
  return {
    schema_version: "public-runtime-config.v1",
    source_files: ["configs/question_bank.v1.json", "configs/scoring_weights.v1.json"],
    question_bank: readJson(QUESTION_BANK_PATH),
    scoring_weights: readJson(SCORING_WEIGHTS_PATH)
  };
}

export function buildPublicConfig(outputPath = PUBLIC_RUNTIME_CONFIG_PATH): string {
  const payload = `${JSON.stringify(createRuntimeConfig(), null, 2)}\n`;
  mkdirSync(dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, payload, "utf8");
  return outputPath;
}

export function checkPublicConfig(outputPath = PUBLIC_RUNTIME_CONFIG_PATH): string {
  const expected = `${JSON.stringify(createRuntimeConfig(), null, 2)}\n`;
  const published = readFileSync(outputPath, "utf8").replace(/\r\n?/g, "\n");
  if (published !== expected) {
    throw new Error("site/data/runtime-config.json is stale; run npm run build:site.");
  }
  return outputPath;
}

const invokedPath = process.argv[1] ? resolve(process.argv[1]) : "";
if (invokedPath === fileURLToPath(import.meta.url)) {
  const outputPath = process.argv.includes("--check") ? checkPublicConfig() : buildPublicConfig();
  process.stdout.write(`${outputPath}\n`);
}
