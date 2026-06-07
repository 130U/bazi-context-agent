import type { EvalCase, LeakageGuardPolicyConfig, LeakageGuardResult, LeakageViolation, LeakageViolationType } from "./evalTypes.ts";

const DEFAULT_POLICY: LeakageGuardPolicyConfig = {
  schema_version: "stage7.v1",
  scan_fields: ["allowed_inputs", "mode_inputs", "forecast_prompt", "forecast_output"],
  violation_types: ["direct", "semantic", "temporal", "metadata"],
  direct_match_case_insensitive: true,
  year_after_cutoff_is_temporal_leakage: true,
  penalty: {
    direct: 1,
    semantic: 0.75,
    temporal: 0.75,
    metadata: 1
  },
  allowed_occurrences: []
};

function clone<T>(input: T): T {
  return JSON.parse(JSON.stringify(input)) as T;
}

function normalize(value: string): string {
  return value.toLocaleLowerCase();
}

function walk(value: unknown, visit: (path: string, value: unknown) => void, path = "$"): void {
  visit(path, value);
  if (Array.isArray(value)) {
    value.forEach((item, index) => walk(item, visit, `${path}[${index}]`));
    return;
  }
  if (value && typeof value === "object") {
    for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
      walk(child, visit, `${path}.${key}`);
    }
  }
}

function stringIncludes(source: string, term: string, caseInsensitive: boolean): boolean {
  if (!term) return false;
  return caseInsensitive ? normalize(source).includes(normalize(term)) : source.includes(term);
}

function violation(type: LeakageViolationType, field_path: string, term: string, message: string, policy: LeakageGuardPolicyConfig): LeakageViolation {
  return {
    type,
    field_path,
    term,
    message,
    penalty: policy.penalty[type] ?? DEFAULT_POLICY.penalty[type]
  };
}

export function redactLeakageTerms<T>(input: T, terms: string[], replacement = "[REDACTED]"): T {
  const copy = clone(input);
  const redactString = (value: string): string => terms.reduce((text, term) => (term ? text.replaceAll(term, replacement) : text), value);
  const redact = (value: unknown): unknown => {
    if (typeof value === "string") return redactString(value);
    if (Array.isArray(value)) return value.map(redact);
    if (value && typeof value === "object") {
      return Object.fromEntries(Object.entries(value as Record<string, unknown>).map(([key, child]) => [key, redact(child)]));
    }
    return value;
  };
  return redact(copy) as T;
}

export function runLeakageGuard<T>(input: T, evalCase: EvalCase, policy: LeakageGuardPolicyConfig = DEFAULT_POLICY): LeakageGuardResult<T> {
  const violations: LeakageViolation[] = [];
  const hiddenLabels = evalCase.hidden_targets.flatMap((target) => [target.label, target.target_id]).filter(Boolean);
  const leakageTerms = evalCase.hidden_targets.flatMap((target) => target.unacceptable_leakage_terms ?? []);
  const cutoffYear = Number(evalCase.cutoff_date.slice(0, 4));

  walk(input, (fieldPath, value) => {
    if (typeof value !== "string" && typeof value !== "number") return;
    const text = String(value);
    for (const term of hiddenLabels) {
      if (stringIncludes(text, term, policy.direct_match_case_insensitive)) {
        violations.push(violation("direct", fieldPath, term, "Hidden target label leaked into allowed input.", policy));
      }
    }
    for (const term of leakageTerms) {
      if (stringIncludes(text, term, policy.direct_match_case_insensitive)) {
        violations.push(violation("semantic", fieldPath, term, "Unacceptable leakage term found.", policy));
      }
    }
    if (/metadata|prompt|input/i.test(fieldPath)) {
      for (const term of [...hiddenLabels, ...leakageTerms]) {
        if (stringIncludes(text, term, policy.direct_match_case_insensitive)) {
          violations.push(violation("metadata", fieldPath, term, "Hidden target leaked through metadata or prompt/input field.", policy));
        }
      }
    }
    if (policy.year_after_cutoff_is_temporal_leakage && /year$/i.test(fieldPath)) {
      const year = Number(value);
      if (Number.isInteger(year) && Number.isInteger(cutoffYear) && year > cutoffYear) {
        violations.push(violation("temporal", fieldPath, String(year), "Post-cutoff year found in input.", policy));
      }
    }
  });

  const redactionTerms = [...hiddenLabels, ...leakageTerms].filter(Boolean);
  const redacted_input = redactLeakageTerms(input, redactionTerms);
  const total_penalty = Math.min(1, violations.reduce((sum, item) => sum + item.penalty, 0));
  return {
    passed: violations.length === 0,
    violations,
    redacted_input,
    total_penalty
  };
}
