// The app writes nothing to storage. A returning visitor's browser can still hold these project keys, so entry and
// exit remove them and leave no project data behind.
const PROJECT_STORAGE_KEYS = [
  "bazi-context-agent.public-session.v1",
  "bazi-context-agent.session.v1",
  "bazi-context-session"
];

export function clearKnownStorage() {
  for (const key of PROJECT_STORAGE_KEYS) {
    try { localStorage.removeItem(key); } catch { /* Storage can be unavailable in private contexts. */ }
    try { sessionStorage.removeItem(key); } catch { /* Storage can be unavailable in private contexts. */ }
  }
}
