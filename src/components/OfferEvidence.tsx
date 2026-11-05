import { Stack, Typography } from '@mui/material';
import { Product } from '../api/client';
import { useCountry } from '../context/CountryContext';
import { useLanguage } from '../context/LanguageContext';
import { checkedDate, getUnitComparison } from '../utils/offerEvidence';
import { formatMoney } from '../utils/formatMoney';

export function UnitPrice({ product }: { product: Product }) {
  const { country } = useCountry();
  const { t } = useLanguage();
  const unit = getUnitComparison(product);
  return <Typography variant="body2" color="text.secondary">
    {unit ? `${formatMoney(unit.price, country.code)} / ${unit.basis === 'item' ? t('evidence.item') : unit.basis}` : t('evidence.unitUnknown')}
  </Typography>;
}

export function OfferEvidence({ product }: { product: Product }) {
  const { country } = useCountry();
  const { t } = useLanguage();
  const date = checkedDate(product.scrapedAt, country.code === 'uk' ? 'en-GB' : country.code === 'de' ? 'de-DE' : 'nl-NL');
  return <Stack direction="row" flexWrap="wrap" gap={1.5} sx={{ mt: 1 }}>
    <Typography variant="caption" color="text.secondary">{date ? t('evidence.checked').replace('{date}', date) : t('evidence.dateUnknown')}</Typography>
    {['json_ld', 'dom_cards_json_ld'].includes(product.sourceMethod ?? '') && <Typography variant="caption" color="text.secondary">{t('evidence.jsonld')}</Typography>}
    {product.priceType === 'loyalty' && <Typography variant="caption" color="warning.dark" fontWeight={700}>{t('evidence.memberPrice')}</Typography>}
    {product.promoQuantity != null && product.promoQuantity > 1 && <Typography variant="caption" color="text.secondary">{t('evidence.multibuy').replace('{count}', String(product.promoQuantity))}</Typography>}
  </Stack>;
}
