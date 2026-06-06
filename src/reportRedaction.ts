const FORBIDDEN_KEYS = new Set([
  "api_key",
  "apikey",
  "openai_api_key",
  "anthropic_api_key",
  "raw_provider_request",
  "raw_provider_response",
  "process_env",
  "authorization"
]);

const ENV_KEY_ASSIGNMENT = new RegExp("OPENAI" + "_API_KEY=" + "[^\\r\\n\\s]+");

function forbiddenString(value: string): boolean {
  return /sk-[A-Za-z0-9]{20,}/.test(value) || /gho_[A-Za-z0-9]{20,}/.test(value) || ENV_KEY_ASSIGNMENT.test(value);
}

export function redactForExport<T>(value: T): T {
  if (Array.isArray(value)) return value.map((item) => redactForExport(item)) as T;
  if (value && typeof value === "object") {
    const output: Record<string, unknown> = {};
    for (const [key, raw] of Object.entries(value as Record<string, unknown>)) {
      if (FORBIDDEN_KEYS.has(key.toLowerCase())) continue;
      output[key] = redactForExport(raw);
    }
    return output as T;
  }
  if (typeof value === "string" && forbiddenString(value)) return "[REDACTED]" as T;
  return value;
}

export function assertNoExportSecrets(value: unknown): void {
  const text = typeof value === "string" ? value : JSON.stringify(value);
  if (/sk-[A-Za-z0-9]{20,}/.test(text) || /gho_[A-Za-z0-9]{20,}/.test(text) || ENV_KEY_ASSIGNMENT.test(text)) {
    throw new Error("report_export_contains_secret");
  }
  for (const token of ["raw_provider_request", "raw_provider_response", "process_env", "headers.authorization"]) {
    if (text.toLowerCase().includes(token)) throw new Error(`report_export_contains_forbidden_field:${token}`);
  }
}
