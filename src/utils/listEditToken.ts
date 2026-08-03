const EDIT_TOKENS_KEY = 'compear-list-edit-tokens';

function readMap(): Record<string, string> {
  try {
    const raw = localStorage.getItem(EDIT_TOKENS_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};
    return parsed as Record<string, string>;
  } catch {
    return {};
  }
}

export function storeListEditToken(listId: string, editToken: string): void {
  if (!listId || !editToken) return;
  const map = readMap();
  map[listId] = editToken;
  localStorage.setItem(EDIT_TOKENS_KEY, JSON.stringify(map));
}

export function getListEditToken(listId: string): string | null {
  const token = readMap()[listId];
  return token || null;
}

export function listEditHeaders(listId: string): Record<string, string> {
  const token = getListEditToken(listId);
  return token ? { 'x-list-edit-token': token } : {};
}
