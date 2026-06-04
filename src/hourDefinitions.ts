import { EARTHLY_BRANCHES, type EarthlyBranch, type HourDefinition, type HourGroupId } from "./types.ts";

export const BRANCH_TO_GROUP: Record<EarthlyBranch, HourGroupId> = {
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

export const GROUP_LABELS: Record<HourGroupId, string> = {
  G1_zi_wu_mao_you: "Zi/Wu/Mao/You",
  G2_yin_shen_si_hai: "Yin/Shen/Si/Hai",
  G3_chen_xu_chou_wei: "Chen/Xu/Chou/Wei"
};

export const HOUR_DEFINITIONS: HourDefinition[] = [
  { branch: "Zi", hourNameCn: "子时", hourNameEn: "Zi hour", startHour: 23, endHour: 1, group: "G1_zi_wu_mao_you" },
  { branch: "Chou", hourNameCn: "丑时", hourNameEn: "Chou hour", startHour: 1, endHour: 3, group: "G3_chen_xu_chou_wei" },
  { branch: "Yin", hourNameCn: "寅时", hourNameEn: "Yin hour", startHour: 3, endHour: 5, group: "G2_yin_shen_si_hai" },
  { branch: "Mao", hourNameCn: "卯时", hourNameEn: "Mao hour", startHour: 5, endHour: 7, group: "G1_zi_wu_mao_you" },
  { branch: "Chen", hourNameCn: "辰时", hourNameEn: "Chen hour", startHour: 7, endHour: 9, group: "G3_chen_xu_chou_wei" },
  { branch: "Si", hourNameCn: "巳时", hourNameEn: "Si hour", startHour: 9, endHour: 11, group: "G2_yin_shen_si_hai" },
  { branch: "Wu", hourNameCn: "午时", hourNameEn: "Wu hour", startHour: 11, endHour: 13, group: "G1_zi_wu_mao_you" },
  { branch: "Wei", hourNameCn: "未时", hourNameEn: "Wei hour", startHour: 13, endHour: 15, group: "G3_chen_xu_chou_wei" },
  { branch: "Shen", hourNameCn: "申时", hourNameEn: "Shen hour", startHour: 15, endHour: 17, group: "G2_yin_shen_si_hai" },
  { branch: "You", hourNameCn: "酉时", hourNameEn: "You hour", startHour: 17, endHour: 19, group: "G1_zi_wu_mao_you" },
  { branch: "Xu", hourNameCn: "戌时", hourNameEn: "Xu hour", startHour: 19, endHour: 21, group: "G3_chen_xu_chou_wei" },
  { branch: "Hai", hourNameCn: "亥时", hourNameEn: "Hai hour", startHour: 21, endHour: 23, group: "G2_yin_shen_si_hai" }
];

export function wrapBranchIndex(index: number): number {
  return (index + EARTHLY_BRANCHES.length) % EARTHLY_BRANCHES.length;
}

export function getHourDefinition(branch: EarthlyBranch): HourDefinition {
  const found = HOUR_DEFINITIONS.find((definition) => definition.branch === branch);
  if (!found) throw new Error(`Unknown earthly branch: ${branch}`);
  return found;
}

export function getHourGroupBranches(group: HourGroupId): EarthlyBranch[] {
  return EARTHLY_BRANCHES.filter((branch) => BRANCH_TO_GROUP[branch] === group);
}

export function getHourBranchForTime(time: string): EarthlyBranch | null {
  const match = time.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return null;
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  if (!Number.isInteger(hour) || !Number.isInteger(minute) || hour < 0 || hour > 23 || minute < 0 || minute > 59) return null;
  if (hour === 23 || hour === 0) return "Zi";
  return EARTHLY_BRANCHES[Math.floor((hour + 1) / 2) % 12];
}
