import { HOUR_GROUPS, type ChartSex, type EvidenceItem, type HourGroupId, type HourGroupPrior, type HourGroupPriorMap, type HourGroupPriorResult, type SymbolAnswer, type SymbolPriorInput } from "./types.ts";
import { GROUP_LABELS } from "./hourDefinitions.ts";

function zeroScores(): HourGroupPriorMap {
  return { G1_zi_wu_mao_you: 0, G2_yin_shen_si_hai: 0, G3_chen_xu_chou_wei: 0 };
}

export function normalizeHourGroupScores(raw: HourGroupPriorMap, uniformPrior: number): HourGroupPriorMap {
  const total = HOUR_GROUPS.reduce((sum, group) => sum + raw[group], 0);
  if (total <= 0) return { G1_zi_wu_mao_you: uniformPrior, G2_yin_shen_si_hai: uniformPrior, G3_chen_xu_chou_wei: uniformPrior };
  return {
    G1_zi_wu_mao_you: raw.G1_zi_wu_mao_you / total,
    G2_yin_shen_si_hai: raw.G2_yin_shen_si_hai / total,
    G3_chen_xu_chou_wei: raw.G3_chen_xu_chou_wei / total
  };
}

function normalizeAnswers(answers: SymbolPriorInput["answers"]): SymbolAnswer[] {
  if (Array.isArray(answers)) return answers;
  return Object.entries(answers)
    .filter(([, value]) => typeof value === "string")
    .map(([questionId, answerId]) => ({ questionId, answerId: String(answerId) }));
}

function fetalOrder(answerId: string): number | null {
  if (answerId === "5_plus") return 5;
  const parsed = Number(answerId);
  return Number.isInteger(parsed) ? parsed : null;
}

function addScore(
  raw: HourGroupPriorMap,
  evidence: EvidenceItem[],
  group: HourGroupId,
  value: number,
  questionId: string,
  answerId: string,
  reason: string
): void {
  raw[group] += value;
  evidence.push({ code: "symbol_prior", message: `${questionId}:${answerId}:${group}:${reason}`, value });
}

function scoreFetalOrder(
  raw: HourGroupPriorMap,
  evidence: EvidenceItem[],
  chartSex: ChartSex,
  rules: SymbolPriorInput["scoringConfig"]["fetal_order_rules"],
  matchScore: number,
  answer: SymbolAnswer,
  missing: string[]
): void {
  if (chartSex === "prefer_not_to_say") {
    missing.push("traditional chart sex for fetal-order scoring");
    return;
  }
  const order = fetalOrder(answer.answerId);
  if (!order) return;
  for (const group of HOUR_GROUPS) {
    if (rules[chartSex]?.[group]?.includes(order)) {
      addScore(raw, evidence, group, matchScore, answer.questionId, answer.answerId, `fetal order matched ${chartSex} chart-sex rule`);
    }
  }
}

export function scoreSymbolPrior(inputOrAnswers: SymbolPriorInput | SymbolAnswer[], birthInput?: { chartSex: ChartSex }, scoringConfig?: SymbolPriorInput["scoringConfig"]): HourGroupPriorResult {
  const input: SymbolPriorInput = Array.isArray(inputOrAnswers)
    ? { answers: inputOrAnswers, chartSex: birthInput?.chartSex ?? "prefer_not_to_say", scoringConfig: scoringConfig as SymbolPriorInput["scoringConfig"] }
    : inputOrAnswers;
  const answers = normalizeAnswers(input.answers);
  const raw_scores = zeroScores();
  const evidence: EvidenceItem[] = [];
  const missing_information: string[] = [];

  for (const answer of answers) {
    const configured = input.scoringConfig.symbol_prior_question_scores[answer.questionId]?.[answer.answerId] ?? {};
    for (const group of HOUR_GROUPS) {
      const value = configured[group] ?? 0;
      if (value > 0) addScore(raw_scores, evidence, group, value, answer.questionId, answer.answerId, "configured traditional symbol supports this hour group");
    }
    if (answer.questionId === "B2_fetal_order") {
      scoreFetalOrder(
        raw_scores,
        evidence,
        input.chartSex,
        input.scoringConfig.fetal_order_rules,
        input.scoringConfig.symbol_prior_policy.fetal_order_match_score,
        answer,
        missing_information
      );
    }
  }

  if (evidence.length === 0) missing_information.push("usable symbol prior answers");
  const prior = normalizeHourGroupScores(raw_scores, input.scoringConfig.legacy_ranking.uniform_group_prior);
  const entries: HourGroupPrior[] = HOUR_GROUPS.map((group) => ({
    group,
    label: GROUP_LABELS[group],
    prior: Number(prior[group].toFixed(input.scoringConfig.symbol_prior_policy.normalization_precision_digits)),
    evidence: evidence.filter((item) => item.message.includes(`:${group}:`))
  }));

  return {
    prior: {
      G1_zi_wu_mao_you: entries[0].prior,
      G2_yin_shen_si_hai: entries[1].prior,
      G3_chen_xu_chou_wei: entries[2].prior
    },
    raw_scores,
    entries,
    evidence,
    missing_information: [...new Set(missing_information)],
    warning: "Symbol evidence is weak and cannot determine birth hour alone."
  };
}
