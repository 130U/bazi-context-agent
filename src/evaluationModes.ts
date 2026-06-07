import type { EvalCase, EvaluationModeId, HoldoutSnapshot, ModeInput, ModeOutput } from "./evalTypes.ts";

export const EVALUATION_MODES: EvaluationModeId[] = [
  "A_derivative_only",
  "B_initial_value_only",
  "C_default_chart_plus_initial_value",
  "D_selected_chart_plus_initial_value_full_system"
];

function objectValue(snapshot: HoldoutSnapshot, key: string): Record<string, unknown> | undefined {
  const value = snapshot.allowed_inputs[key];
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : undefined;
}

function arrayValue(snapshot: HoldoutSnapshot, key: string): unknown[] {
  const value = snapshot.allowed_inputs[key];
  return Array.isArray(value) ? value : [];
}

export function buildModeInput(evalCase: EvalCase, snapshot: HoldoutSnapshot, mode: EvaluationModeId): ModeInput {
  const derivative = objectValue(snapshot, "derivative_profile");
  const defaultDerivative = objectValue(snapshot, "default_derivative_profile") ?? derivative;
  const selectedDerivative = objectValue(snapshot, "selected_derivative_profile") ?? derivative;
  const initialValue = objectValue(snapshot, "initial_value") ?? {
    context_facts: arrayValue(snapshot, "context_box"),
    known_life_events: arrayValue(snapshot, "known_life_events")
  };
  const base = {
    mode,
    case_id: evalCase.case_id,
    forecast_horizon: evalCase.forecast_horizon,
    target_domains: evalCase.target_domains,
    user_question: typeof snapshot.allowed_inputs.user_question === "string" ? snapshot.allowed_inputs.user_question : undefined,
    known_life_events: arrayValue(snapshot, "known_life_events")
  };

  if (mode === "A_derivative_only") {
    return {
      ...base,
      derivative_profile: selectedDerivative,
      selected_derivative_profile: selectedDerivative,
      selected_chart: objectValue(snapshot, "selected_chart"),
      metadata: {
        uses_derivative_function: true,
        uses_initial_value: false,
        uses_default_chart: false,
        uses_selected_chart: true,
        hidden_target_included: false
      }
    };
  }
  if (mode === "B_initial_value_only") {
    return {
      ...base,
      initial_value: initialValue,
      metadata: {
        uses_derivative_function: false,
        uses_initial_value: true,
        uses_default_chart: false,
        uses_selected_chart: false,
        hidden_target_included: false
      }
    };
  }
  if (mode === "C_default_chart_plus_initial_value") {
    return {
      ...base,
      derivative_profile: defaultDerivative,
      default_derivative_profile: defaultDerivative,
      initial_value: initialValue,
      default_chart: objectValue(snapshot, "default_chart"),
      metadata: {
        uses_derivative_function: true,
        uses_initial_value: true,
        uses_default_chart: true,
        uses_selected_chart: false,
        hidden_target_included: false
      }
    };
  }
  return {
    ...base,
    derivative_profile: selectedDerivative,
    selected_derivative_profile: selectedDerivative,
    initial_value: initialValue,
    selected_chart: objectValue(snapshot, "selected_chart"),
    metadata: {
      uses_derivative_function: true,
      uses_initial_value: true,
      uses_default_chart: false,
      uses_selected_chart: true,
      hidden_target_included: false
    }
  };
}

export function buildAllModeInputs(evalCase: EvalCase, snapshot: HoldoutSnapshot): Record<EvaluationModeId, ModeInput> {
  return Object.fromEntries(EVALUATION_MODES.map((mode) => [mode, buildModeInput(evalCase, snapshot, mode)])) as Record<EvaluationModeId, ModeInput>;
}

export function createDeterministicModeOutput(input: ModeInput): ModeOutput {
  const boost = input.mode === "D_selected_chart_plus_initial_value_full_system" ? 0.18 : input.mode === "C_default_chart_plus_initial_value" ? 0.12 : input.mode === "B_initial_value_only" ? 0.07 : 0;
  return {
    mode: input.mode,
    case_id: input.case_id,
    domain_forecasts: input.target_domains.map((domain) => ({
      domain,
      prediction: `${domain} outlook uses ${input.metadata.uses_derivative_function ? "derivative signals" : "no derivative signals"} and ${input.metadata.uses_initial_value ? "initial value" : "no initial value"}.`,
      confidence: Math.min(0.9, 0.5 + boost),
      occurred: true
    })),
    known_facts_used: input.metadata.uses_initial_value ? ["initial_value"] : [],
    derivative_signals_used: input.metadata.uses_derivative_function ? ["derivative_profile"] : [],
    initial_value_adjustments: input.metadata.uses_initial_value ? ["context_baseline"] : [],
    policy: {
      provider: "deterministic_mock",
      ai_used_for_ranking: false,
      ai_used_for_rectification: false,
      real_network_used: false
    }
  };
}
