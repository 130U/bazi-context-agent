import type { SessionState, SessionStore, StorageLike } from "./sessionTypes.ts";

const DEFAULT_STORAGE_KEY = "bazi-context-agent:session:v1";

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

export class MemorySessionStore implements SessionStore {
  private session: SessionState | null = null;

  save(session: SessionState): void {
    this.session = clone(session);
  }

  load(): SessionState | null {
    return this.session ? clone(this.session) : null;
  }

  clear(): void {
    this.session = null;
  }
}

export class BrowserLocalSessionStore implements SessionStore {
  private readonly storage: StorageLike;
  private readonly key: string;

  constructor(storage: StorageLike, key = DEFAULT_STORAGE_KEY) {
    this.storage = storage;
    this.key = key;
  }

  save(session: SessionState): void {
    this.storage.setItem(this.key, JSON.stringify(session));
  }

  load(): SessionState | null {
    const raw = this.storage.getItem(this.key);
    return raw ? (JSON.parse(raw) as SessionState) : null;
  }

  clear(): void {
    this.storage.removeItem(this.key);
  }
}

export function saveSessionLocally(store: SessionStore, session: SessionState): Promise<void> | void {
  return store.save(session);
}

export function loadSessionLocally(store: SessionStore): Promise<SessionState | null> | SessionState | null {
  return store.load();
}

export function clearAllLocalData(store: SessionStore): Promise<void> | void {
  return store.clear();
}
