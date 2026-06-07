import { containsSensitiveValue } from "./sessionRedaction.ts";
import { validateSessionState, type SessionExport, type SessionImportResult, type SessionState } from "./sessionTypes.ts";

function parseSessionExport(input: string | unknown): SessionImportResult {
  let parsed: unknown;
  try {
    parsed = typeof input === "string" ? JSON.parse(input) : input;
  } catch {
    return { ok: false, error: { code: "MALFORMED_JSON", message: "Session import JSON is malformed." }, warnings: [] };
  }

  const record = parsed && typeof parsed === "object" && !Array.isArray(parsed) ? (parsed as Partial<SessionExport>) : null;
  if (!record) return { ok: false, error: { code: "INVALID_SESSION", message: "Session import must be an object." }, warnings: [] };
  if (record.schema_version !== "stage8.session_export.v1") {
    return { ok: false, error: { code: "UNSUPPORTED_SCHEMA", message: "Unsupported session export schema." }, warnings: [] };
  }
  if (containsSensitiveValue(record)) return { ok: false, error: { code: "SECRET_DETECTED", message: "Session import contains secret-like content." }, warnings: [] };
  const validation = validateSessionState(record.session);
  if (!validation.valid) return { ok: false, error: { code: "INVALID_SESSION", message: validation.errors.join("; ") }, warnings: validation.warnings };
  return { ok: true, session: record.session, warnings: validation.warnings };
}

export function importSession(input: string | unknown): SessionImportResult {
  return parseSessionExport(input);
}

export function importSessionWithoutOverwriting(current: SessionState, input: string | unknown): { result: SessionImportResult; session: SessionState } {
  const result = parseSessionExport(input);
  return { result, session: result.ok && result.session ? result.session : current };
}
