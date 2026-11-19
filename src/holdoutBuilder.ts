import { runLeakageGuard } from "./leakageGuard.ts";
import type { EvalCase, HoldoutSnapshot, LeakageGuardPolicyConfig } from "./evalTypes.ts";

function clone<T>(input: T): T {
  return JSON.parse(JSON.stringify(input)) as T;
}

function removeFields(value: unknown, fields: string[]): unknown {
  if (Array.isArray(value)) return value.map((item) => removeFields(item, fields));
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .filter(([key]) => !fields.includes(key))
        .map(([key, child]) => [key, removeFields(child, fields)])
    );
  }
  return value;
}

function redactTerms(value: unknown, terms: string[]): unknown {
  if (typeof value === "string") {
    return terms.reduce((text, term) => (term ? text.replaceAll(term, "[REDACTED]") : text), value);
  }
  if (Array.isArray(value)) return value.map((item) => redactTerms(item, terms));
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value as Record<string, unknown>).map(([key, child]) => [key, redactTerms(child, terms)]));
  }
  return value;
}

function removePostCutoffEvents(inputs: Record<string, unknown>, cutoffDate: string): { inputs: Record<string, unknown>; removed: number } {
  const cutoffYear = Number(cutoffDate.slice(0, 4));
  let removed = 0;
  const copy = clone(inputs);
  for (const key of ["known_life_events", "life_events", "events"]) {
    const events = copy[key];
    if (!Array.isArray(events)) continue;
    const kept = events.filter((event) => {
      const year = event && typeof event === "object" ? Number((event as Record<string, unknown>).year) : NaN;
      const keep = !Number.isInteger(year) || year <= cutoffYear;
      if (!keep) removed += 1;
      return keep;
    });
    copy[key] = kept;
  }
  return { inputs: copy, removed };
}

export function buildHoldoutSnapshot(evalCase: EvalCase, policy?: LeakageGuardPolicyConfig): HoldoutSnapshot {
  const warnings: string[] = [];
  const redactedFields = evalCase.redaction_policy?.redacted_fields ?? [];
  const redactedTerms = [
    ...(evalCase.redaction_policy?.redacted_terms ?? []),
    ...evalCase.hidden_targets.flatMap((target) => [target.label, ...(target.unacceptable_leakage_terms ?? [])])
  ];

  const withoutFields = removeFields(evalCase.allowed_inputs, redactedFields) as Record<string, unknown>;
  const { inputs: withoutPostCutoff, removed } = removePostCutoffEvents(withoutFields, evalCase.cutoff_date);
  const redacted = redactTerms(withoutPostCutoff, redactedTerms) as Record<string, unknown>;
  const leakage = runLeakageGuard(redacted, evalCase, policy);
  if (!leakage.passed) warnings.push("Holdout input still contains leakage violations.");
  if (evalCase.hidden_targets.length === 0) warnings.push("Eval case has no hidden targets.");

  return {
    case_id: evalCase.case_id,
    cutoff_date: evalCase.cutoff_date,
    forecast_horizon: evalCase.forecast_horizon,
    target_domains: evalCase.target_domains,
    allowed_inputs: leakage.redacted_input,
    redaction_metadata: {
      removed_post_cutoff_events: removed,
      redacted_terms: redactedTerms,
      redacted_fields: redactedFields,
      hidden_targets_removed: true
    },
    valid: leakage.passed && evalCase.hidden_targets.length > 0,
    warnings
  };
}
