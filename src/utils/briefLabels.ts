import { Constraint } from '../api/shopping';
import { ApiCountry } from '../api/client';
import { formatMoney } from './formatMoney';

export function constraintLabel(c: Constraint, t: (key: string) => string, country: ApiCountry): string {
  if (c.kind === 'price') return t('brief.price').replace('{amount}', formatMoney(c.maximum, country));
  if (c.kind === 'unit-price') return t('brief.unitPrice').replace('{basis}', c.basis === 'item' ? t('evidence.item') : c.basis).replace('{amount}', formatMoney(c.maximum, country));
  if (c.kind === 'claim') return t('brief.claim').replace('{value}', t(`labels.${c.value}`));
  if (c.kind === 'exclude-ingredient') return t('brief.ingredient').replace('{value}', c.value);
  return t('brief.nutrient').replace('{nutrient}', t(`labels.${c.nutrient}`)).replace('{operator}', c.comparison === 'minimum' ? '≥' : '≤').replace('{amount}', String(c.amount)).replace('{basis}', c.basis === 'serving' ? t('labels.serving') : c.basis);
}
