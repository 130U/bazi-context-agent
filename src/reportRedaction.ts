import { containsSecretValue, redactSecretString, SENSITIVE_FIELD_NAMES } from "./secretSafety.ts";

export function redactForExport<T>(value: T): T {
  if (Array.isArray(value)) return value.map((item) => redactForExport(item)) as T;
  if (value && typeof value === "object") {
    const output: Record<string, unknown> = {};
    for (const [key, raw] of Object.entries(value as Record<string, unknown>)) {
      if (SENSITIVE_FIELD_NAMES.has(key.toLowerCase())) continue;
      output[key] = redactForExport(raw);
    }
    return output as T;
  }
  if (typeof value === "string" && containsSecretValue(value)) return redactSecretString(value, "[REDACTED]").value as T;
  return value;
}

export function assertNoExportSecrets(value: unknown): void {
  const text = typeof value === "string" ? value : JSON.stringify(value);
  if (containsSecretValue(text)) {
    throw new Error("report_export_contains_secret");
  }
  const pending: unknown[] = [value];
  while (pending.length > 0) {
    const current = pending.pop();
    if (Array.isArray(current)) pending.push(...current);
    else if (current && typeof current === "object") {
      for (const [key, child] of Object.entries(current as Record<string, unknown>)) {
        if (SENSITIVE_FIELD_NAMES.has(key.toLowerCase())) throw new Error(`report_export_contains_forbidden_field:${key}`);
        pending.push(child);
      }
    }
  }
}
