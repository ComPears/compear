import { useEffect, useId, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Alert, Box, Button, Checkbox, FormControlLabel, MenuItem, Paper, Stack, TextField, Typography } from '@mui/material';
import { Product } from '../api/client';
import { createPriceAlert, fetchInsightsFeatures, fetchPriceHistory, HistoryPoint, InsightsFeatures } from '../api/shopping';
import { useCountry } from '../context/CountryContext';
import { useLanguage } from '../context/LanguageContext';
import { formatMoney } from '../utils/formatMoney';

export function ProductInsights({ product }: { product: Product }) {
  const { country } = useCountry(), { t, language } = useLanguage();
  const [features, setFeatures] = useState<InsightsFeatures | null>(null), [points, setPoints] = useState<HistoryPoint[]>([]);
  const [target, setTarget] = useState(''), [channel, setChannel] = useState<'inapp' | 'email'>('inapp'), [email, setEmail] = useState(''), [consent, setConsent] = useState(false);
  const [saving, setSaving] = useState(false), [message, setMessage] = useState<'saved' | 'error' | null>(null), [failed, setFailed] = useState(false);
  const chartTitle = useId();
  useEffect(() => {
    let active = true; setPoints([]); setFailed(false); setMessage(null); setConsent(false);
    fetchInsightsFeatures().then(async value => {
      if (!active) return; setFeatures(value);
      if (value.history) {
        try { const history = await fetchPriceHistory(product.id, country.code); if (active) setPoints(history); }
        catch { if (active) setFailed(true); }
      }
    });
    return () => { active = false; };
  }, [product.id, country.code]);
  const save = async () => {
    setSaving(true); setMessage(null);
    try { await createPriceAlert(product.id, Number(target), country.code, channel, email || undefined); setMessage('saved'); setConsent(false); }
    catch { setMessage('error'); }
    finally { setSaving(false); }
  };
  const min = points.length ? Math.min(...points.map(p => p.low)) : 0, max = points.length ? Math.max(...points.map(p => p.high)) : 1;
  const lastPoint = points[points.length - 1];
  const firstDay = points[0] ? Date.parse(points[0].date) : 0, lastDay = lastPoint ? Date.parse(lastPoint.date) : 1;
  const x = (p: HistoryPoint) => points.length === 1 ? 300 : 25 + (Date.parse(p.date) - firstDay) / Math.max(86400000, lastDay - firstDay) * 550;
  const y = (price: number) => 130 - (price - min) / Math.max(0.01, max - min) * 100;
  return <Paper variant="outlined" sx={{ p: { xs: 2, sm: 3 }, mt: 3 }}>
    <Stack direction="row" justifyContent="space-between" gap={2}><Typography component="h2" variant="h5" color="primary.dark">{t('insights.title')}</Typography><Button component={RouterLink} to={`/${country.code}/alerts`}>{t('alerts.nav')}</Button></Stack>
    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>{t('insights.hint')}</Typography>
    {features && !features.history && <Alert severity="info" sx={{ mt: 2 }}>{t('insights.unavailable')}</Alert>}
    {failed && <Alert severity="warning" sx={{ mt: 2 }}>{t('alerts.error')}</Alert>}
    {features?.history && !failed && !points.length && <Typography sx={{ mt: 2 }} color="text.secondary">{t('insights.empty')}</Typography>}
    {points.length > 0 && <>
      <Box component="svg" viewBox="0 0 600 170" role="img" aria-labelledby={chartTitle} sx={{ width: '100%', height: 'auto', maxHeight: 230, mt: 2 }}>
        <title id={chartTitle}>{t('insights.title')} · {product.store} · {product.packageSize}</title>
        <line x1="25" x2="575" y1="140" y2="140" stroke="#d0d9ce" />
        {points.map(point => <g key={point.date}><title>{point.date}: {formatMoney(point.low, country.code)} – {formatMoney(point.high, country.code)}</title><line x1={x(point)} x2={x(point)} y1={y(point.low)} y2={y(point.high)} stroke="#0b6e4f" strokeWidth="3" /><circle cx={x(point)} cy={y(point.low)} r="4" fill="#0b6e4f" /></g>)}
        <text x="25" y="163" fill="#4a5c52" fontSize="12">{points[0].date}</text><text x="575" y="163" textAnchor="end" fill="#4a5c52" fontSize="12">{lastPoint.date}</text>
      </Box>
      <Box component="details" sx={{ '& summary': { minHeight: 44, cursor: 'pointer', display: 'flex', alignItems: 'center' } }}><summary>{t('insights.title')} · {points.length}</summary><Box sx={{ maxHeight: 260, overflow: 'auto' }}><Box component="table" sx={{ width: '100%', borderCollapse: 'collapse', '& td, & th': { textAlign: 'left', py: 1, borderBottom: '1px solid', borderColor: 'divider' } }}><thead><tr><th scope="col">{t('product.checked')}</th><th scope="col">{t('alerts.target')}</th></tr></thead><tbody>{points.map(point => <tr key={point.date}><td>{new Intl.DateTimeFormat(language, { dateStyle: 'medium', timeZone: 'UTC' }).format(new Date(point.date))}</td><td>{formatMoney(point.low, country.code)} – {formatMoney(point.high, country.code)}</td></tr>)}</tbody></Box></Box></Box>
    </>}
    {features?.alerts && <Box component="form" onSubmit={event => { event.preventDefault(); void save(); }} sx={{ mt: 3, pt: 3, borderTop: '1px solid', borderColor: 'divider' }}>
      <Typography component="h3" variant="h6">{t('alerts.title')}</Typography><Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>{t('alerts.subtitle')}</Typography>
      <Stack direction={{ xs: 'column', sm: 'row' }} gap={2}>
        <TextField required type="number" label={t('alerts.target')} value={target} onChange={event => setTarget(event.target.value)} slotProps={{ htmlInput: { min: 0.01, max: 10000, step: 0.01 } }} sx={{ flex: 1 }} />
        <TextField select label={t('alerts.channel')} value={channel} onChange={event => setChannel(event.target.value as 'inapp' | 'email')} sx={{ flex: 1 }}><MenuItem value="inapp">{t('alerts.inapp')}</MenuItem><MenuItem value="email" disabled={!features.email}>{t('alerts.emailChannel')}</MenuItem></TextField>
      </Stack>
      {channel === 'email' && <TextField required type="email" fullWidth label={t('alerts.email')} value={email} onChange={event => setEmail(event.target.value)} sx={{ mt: 2 }} slotProps={{ htmlInput: { maxLength: 254 } }} />}
      <FormControlLabel sx={{ my: 1, alignItems: 'flex-start' }} control={<Checkbox checked={consent} onChange={event => setConsent(event.target.checked)} />} label={<Typography variant="body2" sx={{ pt: 1 }}>{t('alerts.consent')}</Typography>} />
      <Button variant="contained" type="submit" disabled={!consent || saving || !Number.isFinite(Number(target)) || Number(target) <= 0}>{t('alerts.create')}</Button>
      {message && <Alert severity={message === 'saved' ? 'success' : 'error'} sx={{ mt: 2 }}>{t(message === 'saved' ? 'alerts.created' : 'alerts.error')}</Alert>}
    </Box>}
  </Paper>;
}
