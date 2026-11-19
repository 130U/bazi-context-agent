import { EARTHLY_BRANCHES, type BranchRelation, type EarthlyBranch } from "./types.ts";

const SIX_HARMONY = new Set(["Zi-Chou", "Yin-Hai", "Mao-Xu", "Chen-You", "Si-Shen", "Wu-Wei"]);
const HARMS = new Set(["Zi-Wei", "Chou-Wu", "Yin-Si", "Mao-Chen", "Shen-Hai", "You-Xu"]);
const TRIADS: EarthlyBranch[][] = [
  ["Shen", "Zi", "Chen"],
  ["Hai", "Mao", "Wei"],
  ["Yin", "Wu", "Xu"],
  ["Si", "You", "Chou"]
];

function canonicalPair(a: EarthlyBranch, b: EarthlyBranch): string {
  return [a, b].sort((left, right) => EARTHLY_BRANCHES.indexOf(left) - EARTHLY_BRANCHES.indexOf(right)).join("-");
}

export function getYearBranch(year: number): EarthlyBranch {
  const index = ((year - 4) % 12 + 12) % 12;
  return EARTHLY_BRANCHES[index];
}

export function getBranchRelations(a: EarthlyBranch, b: EarthlyBranch): BranchRelation[] {
  const relations: BranchRelation[] = [];
  const diff = (EARTHLY_BRANCHES.indexOf(a) - EARTHLY_BRANCHES.indexOf(b) + 12) % 12;
  if (a === b) relations.push("same_branch");
  if (diff === 6) relations.push("clash");
  if (SIX_HARMONY.has(canonicalPair(a, b))) relations.push("six_harmony");
  if (HARMS.has(canonicalPair(a, b))) relations.push("harm");
  if (TRIADS.some((group) => group.includes(a) && group.includes(b))) relations.push("triad_same_group");
  return relations;
}
