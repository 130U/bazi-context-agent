const LEGACY_STORAGE_KEYS = [
  "bazi-context-agent.public-session.v1",
  "bazi-context-agent.session.v1",
  "bazi-context-session"
];

export function clearKnownStorage() {
  for (const key of LEGACY_STORAGE_KEYS) {
    try { localStorage.removeItem(key); } catch { /* Storage can be unavailable in private contexts. */ }
    try { sessionStorage.removeItem(key); } catch { /* Storage can be unavailable in private contexts. */ }
  }
}
