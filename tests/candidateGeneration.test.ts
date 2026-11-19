import test from "node:test";
import assert from "node:assert/strict";
import { generateCandidateHours } from "../src/candidateGeneration.ts";
import { loadScoringConfig } from "../src/config.ts";
import { scoreSymbolPrior } from "../src/symbolPrior.ts";
import type { BirthInput, SymbolAnswer } from "../src/types.ts";

const scoringConfig = loadScoringConfig();
const answers: SymbolAnswer[] = [{ questionId: "B1_hair_whorl", answerId: "one_offset" }];
const prior = scoreSymbolPrior({ answers, chartSex: "female", scoringConfig });

test("candidate generation handles recorded time", () => {
  const input: BirthInput = {
    birthDate: "1990-01-01",
    birthplace: "demo",
    recordedTime: "22:35",
    uncertaintyRange: "adjacent_1_shichen",
    boundaryFlags: [],
    chartSex: "female"
  };
  const candidates = generateCandidateHours(input, prior, scoringConfig);
  assert.ok(candidates.length >= 2 && candidates.length <= 6);
  assert.ok(candidates.some((candidate) => candidate.branch === "Hai"));
});

test("candidate generation handles Zi-hour boundary", () => {
  const input: BirthInput = {
    birthDate: "1990-01-01",
    birthplace: "demo",
    recordedTime: "23:10",
    uncertaintyRange: "recorded_only",
    boundaryFlags: ["near_midnight"],
    chartSex: "female"
  };
  const candidates = generateCandidateHours(input, prior, scoringConfig);
  const zi = candidates.find((candidate) => candidate.branch === "Zi");
  assert.ok(zi);
  assert.equal(zi.early_zi, true);
  assert.equal(zi.possible_date_offset, true);
});

test("candidate generation adds adjacent hours for near hour boundary", () => {
  const input: BirthInput = {
    birthDate: "1990-01-01",
    birthplace: "demo",
    recordedTime: "08:55",
    uncertaintyRange: "recorded_only",
    boundaryFlags: ["near_hour_boundary"],
    chartSex: "female"
  };
  const candidates = generateCandidateHours(input, prior, scoringConfig);
  const branches = candidates.map((candidate) => candidate.branch);

  assert.ok(branches.includes("Chen"));
  assert.ok(branches.includes("Mao"));
  assert.ok(branches.includes("Si"));
  assert.ok(candidates.some((candidate) => candidate.source_reasons.includes("adjacent hour from uncertainty or boundary")));
});

test("candidate generation handles unknown time", () => {
  const input: BirthInput = {
    birthDate: "1990-01-01",
    birthplace: "demo",
    uncertaintyRange: "auto",
    boundaryFlags: [],
    chartSex: "female"
  };
  const candidates = generateCandidateHours(input, prior, scoringConfig);
  assert.ok(candidates.length >= 2 && candidates.length <= 6);
  assert.ok(candidates.every((candidate) => candidate.missing_information.includes("recorded birth time")));
});
