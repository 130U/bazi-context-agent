import { redactSessionForExport } from "./sessionRedaction.ts";
import type { SessionExport, SessionState } from "./sessionTypes.ts";

export function exportSession(session: SessionState, exportedAt = new Date().toISOString()): SessionExport {
  const redacted = redactSessionForExport(session, exportedAt);
  return {
    schema_version: "stage8.session_export.v1",
    exported_at: exportedAt,
    session_id: session.session_id,
    session: redacted.session,
    redaction_metadata: redacted.metadata
  };
}

export function exportSessionJson(session: SessionState, exportedAt = new Date().toISOString()): string {
  return JSON.stringify(exportSession(session, exportedAt), null, 2);
}
