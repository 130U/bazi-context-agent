import type { ContextFactControl, RedactionMetadata, SessionState } from "./sessionTypes.ts";
import { containsSecretValue, redactSecretString, SENSITIVE_FIELD_NAMES } from "./secretSafety.ts";

const LOCAL_PATH_PATTERN = /[A-Za-z]:[\\/][^\s"']+/g;

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function isHiddenFromExport(fact: ContextFactControl): boolean {
  return fact.visibility.include_in_export === false || Boolean(fact.deleted_at);
}

export function containsSensitiveValue(input: unknown): boolean {
  return containsSecretValue(input);
}

export function redactString(input: string): { value: string; count: number } {
  let value = input;
  let count = 0;
  const secretRedaction = redactSecretString(value);
  value = secretRedaction.value;
  count += secretRedaction.count;
  value = value.replace(LOCAL_PATH_PATTERN, () => {
    count += 1;
    return "[REDACTED:local_path]";
  });
  return { value, count };
}

export function redactValue(input: unknown): { value: unknown; count: number } {
  if (typeof input === "string") return redactString(input);
  if (Array.isArray(input)) {
    let count = 0;
    const value = input.map((item) => {
      const redacted = redactValue(item);
      count += redacted.count;
      return redacted.value;
    });
    return { value, count };
  }
  if (input && typeof input === "object") {
    let count = 0;
    const value = Object.fromEntries(
      Object.entries(input as Record<string, unknown>)
        .filter(([key]) => !SENSITIVE_FIELD_NAMES.has(key.toLowerCase()))
        .map(([key, child]) => {
        const redacted = redactValue(child);
        count += redacted.count;
        return [key, redacted.value];
        })
    );
    return { value, count };
  }
  return { value: input, count: 0 };
}

export function redactSessionForExport(session: SessionState, exportedAt = new Date().toISOString()): { session: SessionState; metadata: RedactionMetadata } {
  const copy = clone(session);
  let redactedCount = 0;
  const redactedFactIds: string[] = [];
  let removedDeletedFactValues = 0;

  copy.context_box = copy.context_box.map((fact) => {
    const next = clone(fact);
    if (Boolean(next.deleted_at)) {
      if (next.value !== null) removedDeletedFactValues += 1;
      next.value = null;
      redactedCount += 1;
      redactedFactIds.push(next.fact_id);
      return next;
    }
    if (isHiddenFromExport(next)) {
      next.value = "[REDACTED:hidden_context_fact]";
      redactedCount += 1;
      redactedFactIds.push(next.fact_id);
      return next;
    }
    const redacted = redactValue(next.value);
    next.value = redacted.value;
    redactedCount += redacted.count;
    return next;
  });

  const redactedSession = redactValue(copy);
  const redactedCopy = redactedSession.value as SessionState;
  redactedCount += redactedSession.count;
  redactedCopy.privacy_metadata = {
    ...redactedCopy.privacy_metadata,
    last_exported_at: exportedAt,
    secrets_included: false,
    api_keys_included: false,
    cloud_sync_enabled: false
  };

  return {
    session: redactedCopy,
    metadata: {
      redaction_applied: redactedCount > 0,
      redacted_fields_count: redactedCount,
      secrets_included: false,
      redaction_policy_version: "stage8.redaction.v1",
      redacted_fact_ids: redactedFactIds,
      removed_deleted_fact_values: removedDeletedFactValues
    }
  };
}
