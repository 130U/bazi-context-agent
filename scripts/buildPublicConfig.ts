import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const REPOSITORY_ROOT = fileURLToPath(new URL("../", import.meta.url));
const QUESTION_BANK_PATH = resolve(REPOSITORY_ROOT, "configs/question_bank.json");
const SCORING_WEIGHTS_PATH = resolve(REPOSITORY_ROOT, "configs/scoring_weights.json");
export const PUBLIC_RUNTIME_CONFIG_PATH = resolve(REPOSITORY_ROOT, "site/data/runtime-config.json");

// The browser reads only these parts; the research API's scoring surfaces stay out of the published file.
const BROWSER_QUESTION_BANK_KEYS = ["adaptive_policy", "context_policy", "stages"];
const BROWSER_SCORING_KEYS = ["symbol_prior_question_scores", "fetal_order_rules", "browser_rectification"];

function readJson(path: string): Record<string, unknown> {
  return JSON.parse(readFileSync(path, "utf8")) as Record<string, unknown>;
}

function pick(source: Record<string, unknown>, keys: string[], path: string): Record<string, unknown> {
  return Object.fromEntries(keys.map((key) => {
    if (source[key] === undefined) throw new Error(`${path} is missing ${key}.`);
    return [key, source[key]];
  }));
}

export function createRuntimeConfig() {
  return {
    schema_version: "public-runtime-config.v1",
    source_files: ["configs/question_bank.json", "configs/scoring_weights.json"],
    question_bank: pick(readJson(QUESTION_BANK_PATH), BROWSER_QUESTION_BANK_KEYS, "configs/question_bank.json"),
    scoring_weights: pick(readJson(SCORING_WEIGHTS_PATH), BROWSER_SCORING_KEYS, "configs/scoring_weights.json")
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
