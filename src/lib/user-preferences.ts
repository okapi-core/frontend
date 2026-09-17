const PREFERENCE_PREFIX = 'okapi:user-preference:v1';

function buildKey(key: string) {
  return `${PREFERENCE_PREFIX}:${key}`;
}

function hasStorage(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

export function getPreference<T>(key: string): T | null {
  if (!hasStorage()) return null;
  try {
    const raw = window.localStorage.getItem(buildKey(key));
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function setPreference<T>(key: string, value: T): void {
  if (!hasStorage()) return;
  try {
    window.localStorage.setItem(buildKey(key), JSON.stringify(value));
  } catch {
    // Ignore storage errors (quota, disabled, etc).
  }
}

export function removePreference(key: string): void {
  if (!hasStorage()) return;
  try {
    window.localStorage.removeItem(buildKey(key));
  } catch {
    // Ignore storage errors (quota, disabled, etc).
  }
}
