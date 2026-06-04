import { HOUR_GROUPS, type BirthInput, type CandidateChart, type HourGroupId, type HourGroupPrior, type ScoringConfig } from "./types.ts";

const BRANCHES = [
  "Zi",
  "Chou",
  "Yin",
  "Mao",
  "Chen",
  "Si",
  "Wu",
  "Wei",
  "Shen",
  "You",
  "Xu",
  "Hai"
] as const;

const BRANCH_TO_GROUP: Record<string, HourGroupId> = {
  Zi: "G1_zi_wu_mao_you",
  Wu: "G1_zi_wu_mao_you",
  Mao: "G1_zi_wu_mao_you",
  You: "G1_zi_wu_mao_you",
  Yin: "G2_yin_shen_si_hai",
  Shen: "G2_yin_shen_si_hai",
  Si: "G2_yin_shen_si_hai",
  Hai: "G2_yin_shen_si_hai",
  Chen: "G3_chen_xu_chou_wei",
  Xu: "G3_chen_xu_chou_wei",
  Chou: "G3_chen_xu_chou_wei",
  Wei: "G3_chen_xu_chou_wei"
};

function recordedBranchIndex(recordedTime?: string): number {
  if (!recordedTime) return 0;
  const hour = Number(recordedTime.split(":")[0]);
  if (!Number.isFinite(hour)) return 0;
  if (hour === 23 || hour === 0) return 0;
  return Math.floor((hour + 1) / 2) % 12;
}

function wrap(index: number): number {
  return (index + BRANCHES.length) % BRANCHES.length;
}

function addCandidate(
  candidates: Map<string, CandidateChart>,
  branchIndex: number,
  source: CandidateChart["source"],
  scoringConfig: ScoringConfig,
  notes: string[]
): void {
  const hourBranch = BRANCHES[wrap(branchIndex)];
  if (candidates.has(hourBranch)) return;
  candidates.set(hourBranch, {
    id: `candidate_${hourBranch}`,
    hourBranch,
    hourGroup: BRANCH_TO_GROUP[hourBranch],
    source,
    birthRecordPlausibility: scoringConfig.birth_record_plausibility[source],
    notes
  });
}

export function generateCandidateCharts(
  birthInput: BirthInput,
  symbolPriors: HourGroupPrior[],
  scoringConfig: ScoringConfig
): CandidateChart[] {
  const candidates = new Map<string, CandidateChart>();
  const recorded = recordedBranchIndex(birthInput.recordedTime);
  const adjacentRange = birthInput.uncertaintyRange === "adjacent_2_shichen" ? 2 : 1;

  addCandidate(candidates, recorded, "recorded", scoringConfig, ["recorded birth time branch"]);
  for (let offset = 1; offset <= adjacentRange; offset += 1) {
    addCandidate(candidates, recorded - offset, "adjacent", scoringConfig, ["adjacent hour from uncertainty range"]);
    addCandidate(candidates, recorded + offset, "adjacent", scoringConfig, ["adjacent hour from uncertainty range"]);
  }

  if (
    birthInput.boundaryFlags.includes("near_midnight") ||
    birthInput.boundaryFlags.includes("near_solar_term") ||
    birthInput.boundaryFlags.includes("near_hour_boundary")
  ) {
    addCandidate(candidates, recorded - 2, "boundary_expanded", scoringConfig, ["expanded because birth input is near a boundary"]);
    addCandidate(candidates, recorded + 2, "boundary_expanded", scoringConfig, ["expanded because birth input is near a boundary"]);
  }

  const strongestGroup = [...symbolPriors].sort((a, b) => b.prior - a.prior)[0]?.group;
  if (strongestGroup && ![...candidates.values()].some((candidate) => candidate.hourGroup === strongestGroup)) {
    const branchIndex = BRANCHES.findIndex((branch) => BRANCH_TO_GROUP[branch] === strongestGroup);
    addCandidate(candidates, branchIndex, "symbol_prior_added", scoringConfig, ["added to cover strongest symbol prior group"]);
  }

  return [...candidates.values()].slice(0, 6);
}
