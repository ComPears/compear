const USER_ID_KEY = 'compear-user-id';
const USER_TOKEN_KEY = 'compear-user-token';
const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:4000').replace(/\/$/, '');

export interface ReceiptCredentials {
  userId: string;
  token: string;
}

function createId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID().replace(/-/g, '');
  }
  return `u${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;
}

function isValidUserId(value: string | null): value is string {
  return Boolean(value && /^[a-zA-Z0-9_-]{8,64}$/.test(value));
}

function isValidToken(value: string | null): value is string {
  return Boolean(value && value.length >= 8 && value.length <= 256);
}

/** Stable anonymous user id for receipt history (stored locally). */
export function getUserId(): string {
  const existing = localStorage.getItem(USER_ID_KEY);
  if (isValidUserId(existing)) {
    return existing;
  }
  const id = createId();
  localStorage.setItem(USER_ID_KEY, id);
  return id;
}

export function getUserToken(): string | null {
  const token = localStorage.getItem(USER_TOKEN_KEY);
  return isValidToken(token) ? token : null;
}

export function clearReceiptCredentials(): void {
  localStorage.removeItem(USER_ID_KEY);
  localStorage.removeItem(USER_TOKEN_KEY);
}

function storeCredentials(creds: ReceiptCredentials): void {
  localStorage.setItem(USER_ID_KEY, creds.userId);
  localStorage.setItem(USER_TOKEN_KEY, creds.token);
}

/**
 * Ensure anonymous receipt credentials exist.
 * If the token is missing, POST /receipts/session and store { userId, token }.
 */
export async function ensureReceiptCredentials(apiBase: string = API_BASE): Promise<ReceiptCredentials> {
  const existingId = localStorage.getItem(USER_ID_KEY);
  const existingToken = localStorage.getItem(USER_TOKEN_KEY);
  if (isValidUserId(existingId) && isValidToken(existingToken)) {
    return { userId: existingId, token: existingToken };
  }

  const base = apiBase.replace(/\/$/, '');
  const response = await fetch(`${base}/receipts/session`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!response.ok) {
    throw new Error(`Receipt session failed (${response.status})`);
  }
  const data = (await response.json()) as ReceiptCredentials;
  if (!isValidUserId(data.userId) || !isValidToken(data.token)) {
    throw new Error('Invalid receipt session response');
  }
  storeCredentials(data);
  return data;
}
