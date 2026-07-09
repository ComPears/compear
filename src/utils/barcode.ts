/** Extract a valid EAN-8/EAN-13 from raw scanner output (may include extra digits). */
export function normalizeBarcode(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const digits = raw.replace(/\D/g, '');

  const candidates: string[] = [];
  if (digits.length >= 13) {
    for (let i = 0; i <= digits.length - 13; i += 1) {
      candidates.push(digits.slice(i, i + 13));
    }
  }
  if (digits.length === 12) candidates.push(`0${digits}`);
  if (digits.length === 13) candidates.unshift(digits);
  if (digits.length === 8) candidates.push(digits);

  for (const candidate of candidates) {
    if (candidate.length === 13 && checksumEan13(candidate)) return candidate;
    if (candidate.length === 8 && checksumEan8(candidate)) return candidate;
  }
  return null;
}

function checksumEan13(digits: string): boolean {
  if (digits.length !== 13 || !/^\d+$/.test(digits)) return false;
  let total = 0;
  for (let i = 0; i < 12; i += 1) {
    const n = parseInt(digits[i], 10);
    total += n * (i % 2 === 0 ? 1 : 3);
  }
  const check = (10 - (total % 10)) % 10;
  return check === parseInt(digits[12], 10);
}

function checksumEan8(digits: string): boolean {
  if (digits.length !== 8 || !/^\d+$/.test(digits)) return false;
  let total = 0;
  for (let i = 0; i < 7; i += 1) {
    const n = parseInt(digits[i], 10);
    total += n * (i % 2 === 0 ? 3 : 1);
  }
  const check = (10 - (total % 10)) % 10;
  return check === parseInt(digits[7], 10);
}
