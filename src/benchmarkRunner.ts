import { buildHoldoutSnapshot } from "./holdoutBuilder.ts";
import { buildAllModeInputs, createDeterministicModeOutput, EVALUATION_MODES } from "./evaluationModes.ts";
import { comparePair, scoreModeOutput } from "./forecastJudge.ts";
import { runLeakageGuard } from "./leakageGuard.ts";
import type { BenchmarkResult, BenchmarkRunnerInput, EvalCaseResult, EvaluationModeId, ForecastEvalScore, ModeOutput, PairwiseResult } from "./evalTypes.ts";

function emptyModeScores(): Record<EvaluationModeId, { average_total_score: number; case_count: number }> {
  return Object.fromEntries(EVALUATION_MODES.map((mode) => [mode, { average_total_score: 0, case_count: 0 }])) as Record<EvaluationModeId, { average_total_score: number; case_count: number }>;
}

function aggregateModeScores(caseResults: EvalCaseResult[]): Record<EvaluationModeId, { average_total_score: number; case_count: number }> {
  const scores = emptyModeScores();
  for (const mode of EVALUATION_MODES) {
    const modeScores = caseResults.flatMap((result) => result.scores.filter((score) => score.mode === mode));
    scores[mode] = {
      average_total_score: Number((modeScores.reduce((sum, item) => sum + item.total_score, 0) / Math.max(1, modeScores.length)).toFixed(4)),
      case_count: modeScores.length
    };
  }
  return scores;
}

function pairwiseForScores(scores: ForecastEvalScore[]): PairwiseResult[] {
  const byMode = new Map(scores.map((score) => [score.mode, score]));
  const pairs: Array<[EvaluationModeId, EvaluationModeId]> = [
    ["D_selected_chart_plus_initial_value_full_system", "A_derivative_only"],
    ["D_selected_chart_plus_initial_value_full_system", "B_initial_value_only"],
    ["D_selected_chart_plus_initial_value_full_system", "C_default_chart_plus_initial_value"],
    ["A_derivative_only", "B_initial_value_only"],
    ["C_default_chart_plus_initial_value", "A_derivative_only"],
    ["C_default_chart_plus_initial_value", "B_initial_value_only"]
  ];
  return pairs.flatMap(([a, b]) => {
    const scoreA = byMode.get(a);
    const scoreB = byMode.get(b);
    return scoreA && scoreB ? [comparePair(scoreA, scoreB)] : [];
  });
}

function aggregateWinRates(caseResults: EvalCaseResult[]): Record<string, number> {
  const pairKeys: Record<string, [EvaluationModeId, EvaluationModeId]> = {
    D_over_A: ["D_selected_chart_plus_initial_value_full_system", "A_derivative_only"],
    D_over_B: ["D_selected_chart_plus_initial_value_full_system", "B_initial_value_only"],
    D_over_C: ["D_selected_chart_plus_initial_value_full_system", "C_default_chart_plus_initial_value"]
  };
  return Object.fromEntries(
    Object.entries(pairKeys).map(([key, [winnerMode, loserMode]]) => {
      const pairs = caseResults.flatMap((result) => result.pairwise_results.filter((pair) => pair.pair[0] === winnerMode && pair.pair[1] === loserMode));
      const wins = pairs.filter((pair) => pair.winner === winnerMode).length;
      return [key, Number((wins / Math.max(1, pairs.length)).toFixed(4))];
    })
  );
}

function conclusion(caseCount: number, modeScores: BenchmarkResult["mode_scores"]): BenchmarkResult["conclusion"] {
  if (caseCount < 30) return "insufficient_data";
  const d = modeScores.D_selected_chart_plus_initial_value_full_system.average_total_score;
  const beatsAll = d > modeScores.A_derivative_only.average_total_score && d > modeScores.B_initial_value_only.average_total_score && d > modeScores.C_default_chart_plus_initial_value.average_total_score;
  return beatsAll ? "full_system_supported" : "full_system_not_supported";
}

export function runBenchmark(input: BenchmarkRunnerInput): BenchmarkResult {
  const caseResults: EvalCaseResult[] = input.cases.map((evalCase) => {
    const snapshot = buildHoldoutSnapshot(evalCase);
    const modeInputs = buildAllModeInputs(evalCase, snapshot);
    const mode_input_leakage_results = Object.fromEntries(EVALUATION_MODES.map((mode) => [mode, runLeakageGuard(modeInputs[mode], evalCase)])) as EvalCaseResult["mode_input_leakage_results"];
    const outputs = Object.fromEntries(
      EVALUATION_MODES.map((mode) => {
        const explicit = input.mode_outputs?.[evalCase.case_id]?.[mode] as ModeOutput | undefined;
        return [mode, explicit ?? input.mode_runner?.(modeInputs[mode], evalCase) ?? createDeterministicModeOutput(modeInputs[mode])];
      })
    ) as Record<EvaluationModeId, ModeOutput>;
    const leakage_results = Object.fromEntries(EVALUATION_MODES.map((mode) => [mode, runLeakageGuard(outputs[mode], evalCase)])) as EvalCaseResult["leakage_results"];
    const scores = EVALUATION_MODES.map((mode) => scoreModeOutput(evalCase, outputs[mode]));
    const pairwise_results = pairwiseForScores(scores);
    const valid = snapshot.valid && Object.values(mode_input_leakage_results).every((result) => result.passed) && Object.values(leakage_results).every((result) => result.passed);
    return {
      case_id: evalCase.case_id,
      scores,
      pairwise_results,
      mode_input_leakage_results,
      leakage_results,
      valid,
      warnings: [
        ...snapshot.warnings,
        ...Object.values(mode_input_leakage_results).flatMap((leakage) => leakage.violations.map((item) => item.message)),
        ...scores.flatMap((score) => score.notes)
      ]
    };
  });

  const mode_scores = aggregateModeScores(caseResults);
  const leakageViolations = caseResults.reduce(
    (sum, result) =>
      sum +
      Object.values(result.mode_input_leakage_results).reduce((inner, leakage) => inner + leakage.violations.length, 0) +
      Object.values(result.leakage_results).reduce((inner, leakage) => inner + leakage.violations.length, 0),
    0
  );
  const benchmarkConclusion = conclusion(input.cases.length, mode_scores);
  return {
    benchmark_id: `benchmark_stage7_${input.cases.length}_${Date.now()}`,
    schema_version: "stage7.v1",
    case_count: input.cases.length,
    mode_scores,
    pairwise_win_rates: aggregateWinRates(caseResults),
    leakage_summary: {
      violations: leakageViolations,
      invalid_cases: caseResults.filter((result) => !result.valid).length
    },
    conclusion: benchmarkConclusion,
    case_results: caseResults,
    warnings: benchmarkConclusion === "insufficient_data" ? ["Sample is too small to support the product claim."] : []
  };
}
