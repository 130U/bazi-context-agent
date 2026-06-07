import type { EvalCase } from "./evalTypes.ts";

export interface EvalCaseValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export function validateEvalCase(input: unknown): EvalCaseValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const record = input && typeof input === "object" && !Array.isArray(input) ? (input as Record<string, unknown>) : null;

  if (!record) {
    return { valid: false, errors: ["EvalCase must be an object."], warnings };
  }
  for (const field of ["case_id", "schema_version", "cutoff_date", "forecast_horizon"]) {
    if (typeof record[field] !== "string" || String(record[field]).length === 0) errors.push(`${field} is required.`);
  }
  if (record.schema_version !== "stage7.v1") errors.push("schema_version must be stage7.v1.");
  if (!Array.isArray(record.target_domains) || record.target_domains.length === 0) errors.push("target_domains must be a non-empty array.");
  if (!Array.isArray(record.hidden_targets) || record.hidden_targets.length === 0) errors.push("hidden_targets must be a non-empty array.");
  if (!record.allowed_inputs || typeof record.allowed_inputs !== "object" || Array.isArray(record.allowed_inputs)) errors.push("allowed_inputs is required.");
  if (!record.redaction_policy || typeof record.redaction_policy !== "object" || Array.isArray(record.redaction_policy)) errors.push("redaction_policy is required.");

  for (const [index, target] of (Array.isArray(record.hidden_targets) ? record.hidden_targets : []).entries()) {
    const hidden = target && typeof target === "object" && !Array.isArray(target) ? (target as Record<string, unknown>) : null;
    if (!hidden) {
      errors.push(`hidden_targets[${index}] must be an object.`);
      continue;
    }
    for (const field of ["target_id", "domain", "label"]) {
      if (typeof hidden[field] !== "string" || String(hidden[field]).length === 0) errors.push(`hidden_targets[${index}].${field} is required.`);
    }
    if (typeof hidden.occurred !== "boolean") errors.push(`hidden_targets[${index}].occurred is required.`);
    if (!Array.isArray(hidden.acceptable_answers)) warnings.push(`hidden_targets[${index}].acceptable_answers is empty.`);
    if (!Array.isArray(hidden.unacceptable_leakage_terms)) warnings.push(`hidden_targets[${index}].unacceptable_leakage_terms is empty.`);
  }

  return { valid: errors.length === 0, errors, warnings };
}

export function assertEvalCase(input: unknown): EvalCase {
  const validation = validateEvalCase(input);
  if (!validation.valid) throw new Error(validation.errors.join("; "));
  return input as EvalCase;
}
