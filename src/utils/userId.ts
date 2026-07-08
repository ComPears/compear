const STORAGE_KEY = 'compear-user-id';

function createId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID().replace(/-/g, '');
  }
  return `u${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;
}

/** Stable anonymous user id for receipt history (stored locally). */
export function getUserId(): string {
  const existing = localStorage.getItem(STORAGE_KEY);
  if (existing && /^[a-zA-Z0-9_-]{8,64}$/.test(existing)) {
    return existing;
  }
  const id = createId();
  localStorage.setItem(STORAGE_KEY, id);
  return id;
}
