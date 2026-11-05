import type { Constraint } from '../api/shopping';

export function positiveAmount(value: string, decimals = 2): number | undefined {
  const text = value.trim().replace(',', '.');
  if (!new RegExp(`^\\d+(?:\\.\\d{0,${decimals}})?$`).test(text)) return undefined;
  const amount = Number(text);
  return Number.isFinite(amount) && amount > 0 && amount <= 100000 ? amount : undefined;
}

export function briefSearchParams(request: string, checks?: Constraint[]): URLSearchParams {
  const params = new URLSearchParams({ q: request.trim() });
  if (checks !== undefined) params.set('checks', JSON.stringify(checks));
  return params;
}

/** The API validates every condition before evaluating or returning it. Invalid
 * shared input must fail closed, never silently become an unfiltered search. */
export function readBriefChecks(raw: string | null): Constraint[] | undefined {
  if (raw === null) return undefined;
  if (raw.length > 2400) throw new Error('Too many requirements');
  const checks: unknown = JSON.parse(raw);
  if (!Array.isArray(checks) || checks.length > 10) throw new Error('Invalid requirements');
  return checks as Constraint[];
}
