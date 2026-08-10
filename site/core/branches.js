import { validClockTime } from "./shared.js";

export const BRANCHES = ["Zi", "Chou", "Yin", "Mao", "Chen", "Si", "Wu", "Wei", "Shen", "You", "Xu", "Hai"];

export const BRANCH_LABELS = {
  Zi: "子时",
  Chou: "丑时",
  Yin: "寅时",
  Mao: "卯时",
  Chen: "辰时",
  Si: "巳时",
  Wu: "午时",
  Wei: "未时",
  Shen: "申时",
  You: "酉时",
  Xu: "戌时",
  Hai: "亥时"
};

export const REPRESENTATIVE_TIMES = {
  Zi: "00:30",
  Chou: "02:00",
  Yin: "04:00",
  Mao: "06:00",
  Chen: "08:00",
  Si: "10:00",
  Wu: "12:00",
  Wei: "14:00",
  Shen: "16:00",
  You: "18:00",
  Xu: "20:00",
  Hai: "22:00"
};

const GROUP_BRANCHES = {
  G1_zi_wu_mao_you: new Set(["Zi", "Wu", "Mao", "You"]),
  G2_yin_shen_si_hai: new Set(["Yin", "Shen", "Si", "Hai"]),
  G3_chen_xu_chou_wei: new Set(["Chen", "Xu", "Chou", "Wei"])
};

const SIX_HARMONY = new Set(["Zi-Chou", "Yin-Hai", "Mao-Xu", "Chen-You", "Si-Shen", "Wu-Wei"]);
const HARMS = new Set(["Zi-Wei", "Chou-Wu", "Yin-Si", "Mao-Chen", "Shen-Hai", "You-Xu"]);
const TRIADS = [
  new Set(["Shen", "Zi", "Chen"]),
  new Set(["Hai", "Mao", "Wei"]),
  new Set(["Yin", "Wu", "Xu"]),
  new Set(["Si", "You", "Chou"])
];

export function branchForTime(value) {
  if (!validClockTime(value)) return null;
  const hour = Number(value.split(":")[0]);
  if (hour === 23 || hour === 0) return "Zi";
  return BRANCHES[Math.floor((hour + 1) / 2)];
}

export function branchGroup(branch) {
  return Object.entries(GROUP_BRANCHES).find(([, members]) => members.has(branch))?.[0] ?? null;
}

export function wrapBranchIndex(index) {
  return ((index % BRANCHES.length) + BRANCHES.length) % BRANCHES.length;
}

function pairKey(a, b) {
  return [a, b].sort((left, right) => BRANCHES.indexOf(left) - BRANCHES.indexOf(right)).join("-");
}

export function branchRelations(a, b) {
  const relations = [];
  const diff = (BRANCHES.indexOf(a) - BRANCHES.indexOf(b) + BRANCHES.length) % BRANCHES.length;
  if (a === b) relations.push("same_branch");
  if (diff === BRANCHES.length / 2) relations.push("clash");
  if (SIX_HARMONY.has(pairKey(a, b))) relations.push("six_harmony");
  if (HARMS.has(pairKey(a, b))) relations.push("harm");
  if (TRIADS.some((triad) => triad.has(a) && triad.has(b))) relations.push("triad_same_group");
  return relations;
}

export function yearBranch(year) {
  return BRANCHES[((year - 4) % BRANCHES.length + BRANCHES.length) % BRANCHES.length];
}
