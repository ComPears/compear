import { useEffect, useState } from 'react';
import { Link as RouterLink, useParams } from 'react-router-dom';
import { Alert, Box, Button, Chip, Container, Paper, Stack, Typography } from '@mui/material';
import AppNavBar from '../components/AppNavBar';
import Footer from '../components/Footer';
import { useCountry } from '../context/CountryContext';
import { useLanguage } from '../context/LanguageContext';
import { disablePriceAlert, fetchInsightsFeatures, fetchPriceAlerts, fetchPriceNotifications, markPriceNotificationRead, performAlertAction, PriceNotification, resendAlertConfirmation, SavedAlert } from '../api/shopping';
import { formatMoney } from '../utils/formatMoney';

export function AlertsPage() {
  const { action } = useParams(), { country } = useCountry(), { t } = useLanguage();
  const [enabled, setEnabled] = useState<boolean | null>(null), [alerts, setAlerts] = useState<SavedAlert[]>([]), [notifications, setNotifications] = useState<PriceNotification[]>([]);
  const [error, setError] = useState(false), [done, setDone] = useState(false), [busy, setBusy] = useState(false);
  const capability = new URLSearchParams(window.location.hash.slice(1));
  const refresh = async () => { setAlerts(await fetchPriceAlerts(country.code)); setNotifications(await fetchPriceNotifications(country.code)); };
  useEffect(() => {
    let active = true; setError(Boolean(action && action !== 'confirm' && action !== 'unsubscribe')); setDone(false); setEnabled(null); setAlerts([]); setNotifications([]);
    fetchInsightsFeatures().then(async features => {
      if (!active) return;
      setEnabled(features.alerts);
      if (features.alerts && !action) {
        try {
          const [saved, inbox] = await Promise.all([fetchPriceAlerts(country.code), fetchPriceNotifications(country.code)]);
          if (active) { setAlerts(saved); setNotifications(inbox); }
        } catch { if (active) setError(true); }
      }
    });
    return () => { active = false; };
  }, [country.code, action]);
  const perform = async (operation: () => Promise<void>) => { setBusy(true); setError(false); try { await operation(); if (!action) await refresh(); else { setDone(true); window.history.replaceState(null, '', window.location.pathname); } } catch { setError(true); } finally { setBusy(false); } };
  const isAction = action === 'confirm' || action === 'unsubscribe';
  return <><AppNavBar /><Container component="main" maxWidth="md" sx={{ py: 4, minHeight: '70vh' }}>
    <Typography component="h1" variant="h3" color="primary.dark" sx={{ mb: 1, fontSize: { xs: '2.3rem', md: '3rem' } }}>{t(isAction ? `alerts.${action}` : 'alerts.title')}</Typography><Typography color="text.secondary" sx={{ mb: 3 }}>{t(isAction ? 'alerts.actionHint' : 'alerts.subtitle')}</Typography>
    {enabled === false && <Alert severity="info">{t('alerts.unavailable')}</Alert>}
    {error && <Alert severity="error" sx={{ mb: 2 }}>{t(action ? 'alerts.invalid' : 'alerts.error')}</Alert>}
    {isAction && enabled && (done ? <Alert severity="success">{t('alerts.done')}</Alert> : <Button variant="contained" disabled={busy || !capability.get('id') || !capability.get('token')} onClick={() => void perform(() => performAlertAction(action, capability.get('id')!, capability.get('token')!))}>{t(`alerts.${action}`)}</Button>)}
    {!action && enabled && <>
      <Alert severity="info" sx={{ mb: 3 }}>{t('alerts.device')}</Alert>
      <Typography component="h2" variant="h5" sx={{ mb: 2 }}>{t('alerts.saved')}</Typography>
      {!alerts.length && <Typography color="text.secondary">{t('alerts.none')}</Typography>}
      <Stack spacing={1.5}>{alerts.map(alert => <Paper key={alert.id} variant="outlined" sx={{ p: 2 }}><Stack direction={{ xs: 'column', sm: 'row' }} gap={2} justifyContent="space-between"><Box><Button component={RouterLink} to={`/${country.code}/product/${encodeURIComponent(alert.productId)}`} sx={{ px: 0 }}>{alert.productName ?? alert.productId}</Button><Typography fontWeight={750}>{formatMoney(alert.targetPrice, country.code)}</Typography><Chip size="small" label={t(!alert.enabled ? 'alerts.disabled' : alert.confirmed ? 'alerts.active' : 'alerts.pending')} /></Box><Stack direction="row" gap={1} flexWrap="wrap">{alert.enabled && <Button disabled={busy} onClick={() => void perform(() => disablePriceAlert(alert.id))}>{t('alerts.disable')}</Button>}{alert.enabled && !alert.confirmed && <Button disabled={busy} onClick={() => void perform(() => resendAlertConfirmation(alert.id))}>{t('alerts.resend')}</Button>}</Stack></Stack></Paper>)}</Stack>
      <Typography component="h2" variant="h5" sx={{ mt: 4, mb: 2 }}>{t('alerts.inbox')}</Typography>
      <Stack spacing={1.5}>{notifications.map(notification => <Paper key={notification.id} variant="outlined" sx={{ p: 2, bgcolor: notification.readAt ? 'background.paper' : '#f0f3e8' }}><Typography fontWeight={700}>{notification.productName}</Typography><Typography>{notification.store} · {formatMoney(notification.price, country.code)}</Typography><Typography variant="caption">{new Date(notification.observedAt).toLocaleString()}</Typography>{!notification.readAt && <Button disabled={busy} onClick={() => void perform(() => markPriceNotificationRead(notification.id))}>{t('alerts.read')}</Button>}</Paper>)}</Stack>
    </>}
  </Container><Footer /></>;
}
