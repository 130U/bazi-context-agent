import type { ContextFactControl, SessionState, SessionStore } from "./sessionTypes.ts";

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function nowIso(now = new Date()): string {
  return now.toISOString();
}

function updateFact(session: SessionState, factId: string, update: (fact: ContextFactControl) => ContextFactControl): SessionState {
  const next = clone(session);
  next.context_box = next.context_box.map((fact) => (fact.fact_id === factId ? update(fact) : fact));
  next.updated_at = nowIso();
  return next;
}

export function hideFactFromForecast(session: SessionState, factId: string): SessionState {
  const next = updateFact(session, factId, (fact) => ({
    ...fact,
    visibility: { ...fact.visibility, use_in_forecast: false }
  }));
  next.user_controls.hidden_fact_ids = [...new Set([...next.user_controls.hidden_fact_ids, factId])];
  return next;
}

export function hideFactFromExport(session: SessionState, factId: string): SessionState {
  const next = updateFact(session, factId, (fact) => ({
    ...fact,
    visibility: { ...fact.visibility, include_in_export: false, include_in_report: false }
  }));
  next.user_controls.hidden_fact_ids = [...new Set([...next.user_controls.hidden_fact_ids, factId])];
  return next;
}

export function deleteFact(session: SessionState, factId: string, deletedAt = nowIso()): SessionState {
  const next = updateFact(session, factId, (fact) => ({
    ...fact,
    value: null,
    deleted_at: deletedAt,
    visibility: { use_in_forecast: false, include_in_export: false, include_in_report: false }
  }));
  next.user_controls.deleted_fact_ids = [...new Set([...next.user_controls.deleted_fact_ids, factId])];
  next.user_controls.hidden_fact_ids = next.user_controls.hidden_fact_ids.filter((id) => id !== factId);
  return next;
}

export async function clearAllLocalData(store: SessionStore, session?: SessionState, clearedAt = nowIso()): Promise<SessionState | void> {
  await store.clear();
  if (!session) return;
  return {
    ...clone(session),
    updated_at: clearedAt,
    context_box: [],
    known_life_events: [],
    forecast_input: undefined,
    future_forecast_result: undefined,
    reports: [],
    user_controls: {
      ...session.user_controls,
      hidden_fact_ids: [],
      deleted_fact_ids: []
    },
    privacy_metadata: {
      ...session.privacy_metadata,
      last_cleared_at: clearedAt,
      secrets_included: false,
      api_keys_included: false,
      cloud_sync_enabled: false
    }
  };
}

export function getForecastVisibleContextFacts(session: SessionState): ContextFactControl[] {
  return session.context_box.filter((fact) => fact.visibility.use_in_forecast && !fact.deleted_at && fact.value !== null);
}

export function getExportVisibleContextFacts(session: SessionState): ContextFactControl[] {
  return session.context_box.filter((fact) => fact.visibility.include_in_export && !fact.deleted_at && fact.value !== null);
}
