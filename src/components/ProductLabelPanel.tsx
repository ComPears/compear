import { Alert, Box, Chip, Link, Paper, Stack, Typography } from '@mui/material';
import { Product } from '../api/client';
import { useLanguage } from '../context/LanguageContext';
import { sanitizeProductLink } from '../utils/safeLink';

export function ProductLabelPanel({ product }: { product: Product }) {
  const { t, language } = useLanguage();
  const evidence = product.labelEvidence, date = evidence ? Date.parse(evidence.observedAt) : NaN;
  const source = sanitizeProductLink(evidence?.sourceUrl);
  return <Paper variant="outlined" sx={{ p: { xs: 2, sm: 3 }, mt: 3 }}>
    <Typography component="h2" variant="h5" color="primary.dark">{t('labels.title')}</Typography>
    {!evidence || !Number.isFinite(date) || !source ? <Typography color="text.secondary" sx={{ mt: 1 }}>{t('labels.missing')}</Typography> : <>
      {Date.now() - date > 30 * 86400000 && <Alert severity="warning" sx={{ mt: 2 }}>{t('labels.stale')}</Alert>}
      <Stack direction="row" gap={1} flexWrap="wrap" sx={{ my: 2 }}>{evidence.claims.map(claim => <Chip key={claim} variant="outlined" label={t(`labels.${claim}`)} />)}</Stack>
      {evidence.ingredients && <Box sx={{ mb: 2 }}><Typography variant="subtitle2">{t('labels.ingredients')}</Typography><Typography variant="body2" sx={{ mt: 0.5 }}>{evidence.ingredients}</Typography></Box>}
      {evidence.nutrients && <Box sx={{ mb: 2 }}><Typography variant="subtitle2">{t('labels.nutrition')} · {t('labels.basis').replace('{basis}', evidence.nutrients.servingSize)}</Typography><Stack direction="row" gap={2} flexWrap="wrap" sx={{ mt: 1 }}>{(['proteinG', 'sugarG', 'fiberG', 'fatG'] as const).filter(key => evidence.nutrients?.[key] !== undefined).map(key => <Typography key={key} variant="body2">{t(`labels.${key}`)}: <strong>{evidence.nutrients?.[key]}g</strong></Typography>)}</Stack></Box>}
      <Link href={source} target="_blank" rel="noopener noreferrer nofollow">{t('brief.source')}</Link><Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 1 }}>{new Intl.DateTimeFormat(language, { dateStyle: 'medium' }).format(date)}</Typography>
    </>}
    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>{t('brief.disclaimer')}</Typography>
  </Paper>;
}
