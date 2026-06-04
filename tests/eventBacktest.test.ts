import test from "node:test";
import assert from "node:assert/strict";
import { getBranchRelations, getYearBranch, scoreEventBacktest } from "../src/eventBacktest.ts";
import type { CandidateChart, LifeEvent } from "../src/types.ts";

const candidate: CandidateChart = {
  candidate_id: "candidate_Zi",
  branch: "Zi",
  hour_name_cn: "子时",
  hour_group: "G1_zi_wu_mao_you",
  source_reasons: ["test"],
  symbol_prior_fit: 0.5,
  birth_record_plausibility: 1,
  boundary_flags: {},
  missing_information: []
};

test("year branch and relation scoring are deterministic", () => {
  assert.equal(getYearBranch(2020), "Zi");
  assert.deepEqual(getBranchRelations("Zi", "Wu"), ["clash"]);
  assert.deepEqual(getBranchRelations("Zi", "Chou"), ["six_harmony"]);
});

test("event backtest returns stable per-candidate interface", () => {
  const events: LifeEvent[] = [{ year: 2020, type: "education" }, { year: 2026, type: "migration" }];
  const result = scoreEventBacktest([candidate], events);
  assert.equal(result.length, 1);
  assert.equal(result[0].candidate_id, "candidate_Zi");
  assert.equal(result[0].per_event_scores.length, 2);
  assert.match(result[0].warning, /deterministic stub/);
});
