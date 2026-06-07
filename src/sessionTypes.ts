export type SessionSchemaVersion = "stage8.session.v1";
export type SessionExportSchemaVersion = "stage8.session_export.v1";

export interface ContextFactControl {
  fact_id: string;
  category: string;
  field: string;
  value: unknown;
  source: string;
  confidence?: number;
  fact_type?: "direct_fact" | "inferred_fact" | "derived_fact" | "known_user_fact" | "unknown";
  visibility: {
    use_in_forecast: boolean;
    include_in_export: boolean;
    include_in_report: boolean;
  };
  deleted_at?: string | null;
}

export interface UserControlState {
  persistent_storage_enabled: boolean;
  export_redaction_enabled: boolean;
  report_redaction_enabled: boolean;
  hidden_fact_ids: string[];
  deleted_fact_ids: string[];
}

export interface PrivacyMetadata {
  local_only: boolean;
  cloud_sync_enabled: false;
  secrets_included: false;
  api_keys_included: false;
  last_exported_at?: string;
  last_cleared_at?: string;
}

export interface SessionState {
  session_id: string;
  schema_version: SessionSchemaVersion;
  created_at: string;
  updated_at: string;
  birth_input?: unknown;
  questionnaire_answers?: unknown[];
  symbol_prior?: unknown;
  default_chart?: unknown;
  candidate_charts?: unknown[];
  rectification_result?: unknown;
  bazi_derived_profile?: unknown;
  context_box: ContextFactControl[];
  known_life_events?: unknown[];
  forecast_input?: unknown;
  future_forecast_result?: unknown;
  reports?: unknown[];
  user_controls: UserControlState;
  privacy_metadata: PrivacyMetadata;
}

export interface RedactionMetadata {
  redaction_applied: boolean;
  redacted_fields_count: number;
  secrets_included: false;
  redaction_policy_version: "stage8.redaction.v1";
  redacted_fact_ids: string[];
  removed_deleted_fact_values: number;
}

export interface SessionExport {
  schema_version: SessionExportSchemaVersion;
  exported_at: string;
  session_id: string;
  session: SessionState;
  redaction_metadata: RedactionMetadata;
}

export interface SessionValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export interface SessionImportResult {
  ok: boolean;
  session?: SessionState;
  error?: {
    code: "MALFORMED_JSON" | "UNSUPPORTED_SCHEMA" | "INVALID_SESSION" | "SECRET_DETECTED";
    message: string;
  };
  warnings: string[];
}

export interface SessionStore {
  save(session: SessionState): Promise<void> | void;
  load(): Promise<SessionState | null> | SessionState | null;
  clear(): Promise<void> | void;
}

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export function validateSessionState(input: unknown): SessionValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const record = input && typeof input === "object" && !Array.isArray(input) ? (input as Record<string, unknown>) : null;
  if (!record) return { valid: false, errors: ["SessionState must be an object."], warnings };
  for (const field of ["session_id", "schema_version", "created_at", "updated_at"]) {
    if (typeof record[field] !== "string" || String(record[field]).length === 0) errors.push(`${field} is required.`);
  }
  if (record.schema_version !== "stage8.session.v1") errors.push("schema_version must be stage8.session.v1.");
  if (!Array.isArray(record.context_box)) errors.push("context_box must be an array.");
  if (!record.user_controls || typeof record.user_controls !== "object" || Array.isArray(record.user_controls)) errors.push("user_controls is required.");
  if (!record.privacy_metadata || typeof record.privacy_metadata !== "object" || Array.isArray(record.privacy_metadata)) errors.push("privacy_metadata is required.");
  const privacy = record.privacy_metadata as Record<string, unknown> | undefined;
  if (privacy) {
    if (privacy.cloud_sync_enabled !== false) errors.push("cloud_sync_enabled must be false.");
    if (privacy.secrets_included !== false) errors.push("secrets_included must be false.");
    if (privacy.api_keys_included !== false) errors.push("api_keys_included must be false.");
  }
  return { valid: errors.length === 0, errors, warnings };
}

export function createEmptySession(now = new Date().toISOString()): SessionState {
  return {
    session_id: `session_${Date.now()}`,
    schema_version: "stage8.session.v1",
    created_at: now,
    updated_at: now,
    context_box: [],
    user_controls: {
      persistent_storage_enabled: false,
      export_redaction_enabled: true,
      report_redaction_enabled: true,
      hidden_fact_ids: [],
      deleted_fact_ids: []
    },
    privacy_metadata: {
      local_only: true,
      cloud_sync_enabled: false,
      secrets_included: false,
      api_keys_included: false
    }
  };
}
