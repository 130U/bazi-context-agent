import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import type { QuestionBank, ScoringConfig } from "./types.ts";

function readJson<T>(relativePath: string): T {
  const url = new URL(relativePath, import.meta.url);
  return JSON.parse(readFileSync(fileURLToPath(url), "utf8")) as T;
}

export function loadQuestionBank(): QuestionBank {
  return readJson<QuestionBank>("../configs/question_bank.v1.json");
}

export function loadScoringConfig(): ScoringConfig {
  return readJson<ScoringConfig>("../configs/scoring_weights.v1.json");
}
