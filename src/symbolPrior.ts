import { HOUR_GROUPS, type BirthInput, type EvidenceItem, type HourGroupId, type HourGroupPrior, type ScoringConfig, type SymbolAnswer } from "./types.ts";

const GROUP_LABELS: Record<HourGroupId, string> = {
  G1_zi_wu_mao_you: "子午卯酉",
  G2_yin_shen_si_hai: "寅申巳亥",
  G3_chen_xu_chou_wei: "辰戌丑未"
};

function normalize(raw: Record<HourGroupId, number>): Record<HourGroupId, number> {
  const total = HOUR_GROUPS.reduce((sum, group) => sum + raw[group], 0);
  if (total <= 0) {
    return {
      G1_zi_wu_mao_you: 1 / 3,
      G2_yin_shen_si_hai: 1 / 3,
      G3_chen_xu_chou_wei: 1 / 3
    };
  }
  return {
    G1_zi_wu_mao_you: raw.G1_zi_wu_mao_you / total,
    G2_yin_shen_si_hai: raw.G2_yin_shen_si_hai / total,
    G3_chen_xu_chou_wei: raw.G3_chen_xu_chou_wei / total
  };
}

function fetalOrderNumber(answerId: string): number | undefined {
  if (answerId === "5_plus") return 5;
  const parsed = Number(answerId);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export function scoreSymbolPrior(
  answers: SymbolAnswer[],
  birthInput: Pick<BirthInput, "chartSex">,
  scoringConfig: ScoringConfig
): HourGroupPrior[] {
  const raw: Record<HourGroupId, number> = {
    G1_zi_wu_mao_you: 0,
    G2_yin_shen_si_hai: 0,
    G3_chen_xu_chou_wei: 0
  };
  const evidenceByGroup: Record<HourGroupId, EvidenceItem[]> = {
    G1_zi_wu_mao_you: [],
    G2_yin_shen_si_hai: [],
    G3_chen_xu_chou_wei: []
  };

  for (const answer of answers) {
    const configured = scoringConfig.symbol_prior_question_scores[answer.questionId]?.[answer.answerId] ?? {};
    for (const group of HOUR_GROUPS) {
      const value = configured[group] ?? 0;
      if (value > 0) {
        raw[group] += value;
        evidenceByGroup[group].push({
          code: answer.questionId,
          message: `symbol answer ${answer.answerId} contributes weak prior`,
          value
        });
      }
    }

    if (answer.questionId === "B2_fetal_order" && birthInput.chartSex !== "prefer_not_to_say") {
      const order = fetalOrderNumber(answer.answerId);
      const rules = scoringConfig.fetal_order_rules[birthInput.chartSex];
      if (order !== undefined && rules) {
        for (const group of HOUR_GROUPS) {
          if (rules[group]?.includes(order)) {
            raw[group] += 1;
            evidenceByGroup[group].push({
              code: "B2_fetal_order",
              message: `fetal order ${answer.answerId} matched ${birthInput.chartSex} chart rule`,
              value: 1
            });
          }
        }
      }
    }
  }

  const normalized = normalize(raw);
  return HOUR_GROUPS.map((group) => ({
    group,
    label: GROUP_LABELS[group],
    prior: normalized[group],
    evidence: evidenceByGroup[group]
  }));
}
