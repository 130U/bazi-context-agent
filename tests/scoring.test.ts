import test from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { generateCandidateCharts } from "../src/candidateGeneration.ts";
import { loadScoringConfig } from "../src/config.ts";
import { rankCandidates } from "../src/ranking.ts";
import { scoreSymbolPrior } from "../src/symbolPrior.ts";
import type { BirthInput, ContextFact, LifeEvent, SymbolAnswer } from "../src/types.ts";

const scoringConfig = loadScoringConfig();

const birthInput: BirthInput = {
  birthDate: "1990-01-01",
  birthplace: "demo",
  recordedTime: "22:35",
  uncertaintyRange: "adjacent_1_shichen",
  boundaryFlags: ["near_midnight"],
  chartSex: "female"
};

test("symbol prior scoring is deterministic", () => {
  const answers: SymbolAnswer[] = [
    { questionId: "B1_hair_whorl", answerId: "one_centered" },
    { questionId: "B4_little_finger_length", answerId: "above" }
  ];

  const first = scoreSymbolPrior(answers, birthInput, scoringConfig);
  const second = scoreSymbolPrior(answers, birthInput, scoringConfig);

  assert.deepEqual(first, second);
  assert.equal(first[0].group, "G1_zi_wu_mao_you");
  assert.equal(first[0].prior, 1);
});

test("fetal order scoring follows chart sex rule", () => {
  const priors = scoreSymbolPrior([{ questionId: "B2_fetal_order", answerId: "1" }], birthInput, scoringConfig);
  const strongest = [...priors].sort((a, b) => b.prior - a.prior)[0];

  assert.equal(strongest.group, "G2_yin_shen_si_hai");
  assert.equal(strongest.prior, 1);
});

test("candidate ranking outputs top 3 with score formula", () => {
  const answers: SymbolAnswer[] = [
    { questionId: "B1_hair_whorl", answerId: "one_offset" },
    { questionId: "B2_fetal_order", answerId: "1" },
    { questionId: "B4_little_finger_length", answerId: "aligned" }
  ];
  const events: LifeEvent[] = [{ year: 2015, type: "education" }, { year: 2021, type: "career" }];
  const facts: ContextFact[] = [{ id: "current_identity", value: "demo", source: "user_answer", confidence: 0.8, factType: "known_user_fact" }];
  const priors = scoreSymbolPrior(answers, birthInput, scoringConfig);
  const candidates = generateCandidateCharts(birthInput, priors, scoringConfig);
  const ranked = rankCandidates(candidates, priors, events, facts, scoringConfig);

  assert.equal(ranked.length, 3);
  assert.ok(ranked[0].totalScore >= ranked[1].totalScore);
  assert.ok(ranked.every((score) => score.evidence.length > 0));
  assert.ok(ranked.every((score) => Array.isArray(score.contradictions)));
  assert.ok(ranked.every((score) => Array.isArray(score.missing_information)));
});

test("scoring modules do not import or call AI providers", () => {
  const root = fileURLToPath(new URL("../src", import.meta.url));
  const forbidden = ["openai", "anthropic", "@ai-sdk", "langchain", "gemini"];

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

  for (const token of forbidden) {
    assert.equal(source.includes(token), false, `found forbidden provider token: ${token}`);
  }
});
