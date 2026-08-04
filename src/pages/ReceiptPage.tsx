import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  IconButton,
  LinearProgress,
  Paper,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import DeleteIcon from '@mui/icons-material/Delete';
import SavingsIcon from '@mui/icons-material/Savings';
import StoreIcon from '@mui/icons-material/Store';
import AppNavBar from '../components/AppNavBar';
import Footer from '../components/Footer';
import {
  ApiCountry,
  correctReceiptLine,
  deleteAllReceipts,
  deleteReceipt,
  fetchReceiptAnalytics,
  fetchReceipts,
  ReceiptAnalytics,
  ReceiptLineMatch,
  SavedReceipt,
  uploadReceipt,
} from '../api/client';
import { ensureReceiptCredentials, getUserId } from '../utils/userId';
import { useReceiptStore } from '../store/receiptStore';
import { formatMoney } from '../utils/formatMoney';
import { useCountry } from '../context/CountryContext';
import { useLanguage } from '../context/LanguageContext';

function formatDate(iso: string | null, country: ApiCountry) {
  if (!iso) return '—';
  const d = new Date(iso);
  const locale = country === 'uk' ? 'en-GB' : country === 'de' ? 'de-DE' : 'nl-NL';
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString(locale);
}

function fill(template: string, vars: Record<string, string | number>): string {
  return Object.entries(vars).reduce(
    (text, [key, value]) => text.replace(`{${key}}`, String(value)),
    template
  );
}

const LineCorrection: React.FC<{
  line: ReceiptLineMatch;
  lineIndex: number;
  onCorrect: (
    lineIndex: number,
    correction: { action: 'rematch'; correctedName: string } | { action: 'unmatched' }
  ) => Promise<void>;
}> = ({ line, lineIndex, onCorrect }) => {
  const { t } = useLanguage();
  const [name, setName] = useState(line.correctedName || line.rawName);
  const [saving, setSaving] = useState(false);
  const apply = async (
    correction: { action: 'rematch'; correctedName: string } | { action: 'unmatched' }
  ) => {
    setSaving(true);
    try {
      await onCorrect(lineIndex, correction);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1, alignItems: 'center' }}>
      <TextField
        size="small"
        label={t('receipts.correctedName')}
        value={name}
        onChange={(event) => setName(event.target.value)}
        disabled={saving}
        sx={{ minWidth: 220 }}
      />
      <Button
        size="small"
        variant="outlined"
        disabled={saving || !name.trim()}
        onClick={() => apply({ action: 'rematch', correctedName: name.trim() })}
      >
        {t('receipts.rematch')}
      </Button>
      <Button
        size="small"
        color="inherit"
        disabled={saving}
        onClick={() => apply({ action: 'unmatched' })}
      >
        {t('receipts.unmatch')}
      </Button>
    </Box>
  );
};

const ReceiptResults: React.FC<{
  receipt: SavedReceipt;
  country: ApiCountry;
  onCorrect: (
    receiptId: string,
    lineIndex: number,
    correction: { action: 'rematch'; correctedName: string } | { action: 'unmatched' }
  ) => Promise<void>;
}> = ({ receipt, country, onCorrect }) => {
  const { t } = useLanguage();
  const { analysis } = receipt;
  const money = (value: number) => formatMoney(value, country);

  return (
    <Card variant="outlined" sx={{ mb: 3 }}>
      <CardContent>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
          <Chip
            icon={<StoreIcon />}
            label={analysis.storeDetected || t('receipts.storeUnknown')}
          />
          <Chip label={formatDate(analysis.purchaseDate || receipt.uploadedAt, country)} />
          <Chip
            color="primary"
            label={fill(t('receipts.paid'), { amount: money(analysis.actualTotal) })}
          />
          {analysis.potentialSavings > 0 && (
            <Chip
              color="success"
              icon={<SavingsIcon />}
              label={fill(t('receipts.couldSave'), {
                amount: money(analysis.potentialSavings),
              })}
            />
          )}
        </Box>

        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>{t('receipts.product')}</TableCell>
                <TableCell align="right">{t('receipts.paidCol')}</TableCell>
                <TableCell>{t('receipts.cheapest')}</TableCell>
                <TableCell align="right">{t('receipts.savings')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {analysis.lines.map((line, lineIndex) => (
                <TableRow key={`${line.rawName}-${line.paidLineTotal}`}>
                  <TableCell>
                    {line.correctedName || line.rawName}
                    {line.quantity > 1 ? ` ×${line.quantity}` : ''}
                    {line.correctedName && (
                      <Typography variant="caption" color="text.secondary" display="block">
                        {fill(t('receipts.onReceipt'), { name: line.rawName })}
                      </Typography>
                    )}
                    {(line.matchStatus ?? (line.matchedProduct ? 'matched' : 'unmatched')) !==
                      'matched' && (
                      <Typography variant="caption" color="warning.main" display="block">
                        {line.matchStatus === 'needs_review'
                          ? fill(t('receipts.uncertain'), {
                              name: line.alternatives[0]?.productName ?? '—',
                              pct: Math.round((line.matchConfidence ?? 0) * 100),
                            })
                          : t('receipts.noMatch')}
                      </Typography>
                    )}
                    {line.matchStatus === 'matched' && (
                      <Typography variant="caption" color="success.main" display="block">
                        {fill(t('receipts.matchConfidence'), {
                          pct: Math.round((line.matchConfidence ?? 1) * 100),
                        })}
                      </Typography>
                    )}
                    <LineCorrection
                      line={line}
                      lineIndex={lineIndex}
                      onCorrect={(index, correction) => onCorrect(receipt.id, index, correction)}
                    />
                  </TableCell>
                  <TableCell align="right">{money(line.paidLineTotal)}</TableCell>
                  <TableCell>
                    {line.cheapestAlternative ? (
                      <>
                        {line.cheapestAlternative.store} —{' '}
                        {money(line.cheapestAlternative.effectivePrice * line.quantity)}
                      </>
                    ) : (
                      '—'
                    )}
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{ color: line.lineSavings > 0 ? 'success.main' : undefined }}
                  >
                    {line.lineSavings > 0 ? money(line.lineSavings) : '—'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {analysis.shoppingPlan && analysis.shoppingPlan.storeCount > 1 && (
          <Alert severity="info" sx={{ mt: 2 }}>
            {fill(t('receipts.plan'), {
              count: analysis.shoppingPlan.storeCount,
              amount: money(analysis.shoppingPlan.grandTotal),
            })}
            {analysis.shoppingPlan.savingsVsSingleStore > 0 &&
              fill(t('receipts.planSavings'), {
                amount: money(analysis.shoppingPlan.savingsVsSingleStore),
              })}
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

const AnalyticsPanel: React.FC<{
  analytics: ReceiptAnalytics | null;
  loading: boolean;
  country: ApiCountry;
}> = ({ analytics, loading, country }) => {
  const { t } = useLanguage();
  const money = (value: number) => formatMoney(value, country);

  if (loading) return <LinearProgress sx={{ my: 2 }} />;
  if (!analytics || analytics.receiptCount === 0) {
    return (
      <Typography color="text.secondary" sx={{ py: 2 }}>
        {t('receipts.emptyAnalytics')}
      </Typography>
    );
  }

  return (
    <Box sx={{ mb: 3 }}>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr' },
          gap: 2,
          mb: 2,
        }}
      >
        <Card variant="outlined">
          <CardContent>
            <Typography variant="overline" color="text.secondary">
              {t('receipts.totalSpent')}
            </Typography>
            <Typography variant="h5">{money(analytics.totalSpent)}</Typography>
            <Typography variant="body2" color="text.secondary">
              {fill(t('receipts.receiptCount'), { count: analytics.receiptCount })}
            </Typography>
          </CardContent>
        </Card>
        <Card variant="outlined">
          <CardContent>
            <Typography variant="overline" color="text.secondary">
              {t('receipts.couldHaveSaved')}
            </Typography>
            <Typography variant="h5" color="success.main">
              {money(analytics.totalCouldHaveSaved)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {fill(t('receipts.avgPerReceipt'), {
                amount: money(analytics.averageSavingsPerReceipt),
              })}
            </Typography>
          </CardContent>
        </Card>
        <Card variant="outlined">
          <CardContent>
            <Typography variant="overline" color="text.secondary">
              {t('receipts.byStore')}
            </Typography>
            {analytics.byStore.slice(0, 3).map((s) => (
              <Typography key={s.store} variant="body2">
                {fill(t('receipts.storeLine'), {
                  store: s.store,
                  spent: money(s.totalSpent),
                  missed: money(s.totalCouldHaveSaved),
                })}
              </Typography>
            ))}
          </CardContent>
        </Card>
      </Box>

      {analytics.byMonth.length > 0 && (
        <Box>
          <Typography variant="subtitle1" fontWeight={600} gutterBottom>
            {t('receipts.byMonth')}
          </Typography>
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>{t('receipts.month')}</TableCell>
                  <TableCell align="right">{t('receipts.receiptsCol')}</TableCell>
                  <TableCell align="right">{t('receipts.spentCol')}</TableCell>
                  <TableCell align="right">{t('receipts.missedCol')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {analytics.byMonth.map((m) => (
                  <TableRow key={m.month}>
                    <TableCell>{m.month}</TableCell>
                    <TableCell align="right">{m.receiptCount}</TableCell>
                    <TableCell align="right">{money(m.totalSpent)}</TableCell>
                    <TableCell align="right">{money(m.totalCouldHaveSaved)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}
    </Box>
  );
};

export const ReceiptPage: React.FC = () => {
  const { t } = useLanguage();
  const { country } = useCountry();
  const apiCountry = country.code as ApiCountry;
  const userId = useMemo(() => getUserId(), []);
  const upsertReceipt = useReceiptStore((s) => s.upsert);
  const removeLocalReceipt = useReceiptStore((s) => s.remove);
  const setAllReceipts = useReceiptStore((s) => s.setAll);
  const [tab, setTab] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [latest, setLatest] = useState<SavedReceipt | null>(null);
  const [history, setHistory] = useState<SavedReceipt[]>([]);
  const [analytics, setAnalytics] = useState<ReceiptAnalytics | null>(null);
  const [loadingHistory, setLoadingHistory] = useState(true);

  const refresh = useCallback(async () => {
    setLoadingHistory(true);
    try {
      const { userId: authUserId } = await ensureReceiptCredentials();
      const [receipts, stats] = await Promise.all([
        fetchReceipts(authUserId, apiCountry),
        fetchReceiptAnalytics(authUserId, apiCountry),
      ]);
      const localReceipts = useReceiptStore.getState().receipts;
      const merged =
        receipts.length > 0
          ? receipts
          : localReceipts.filter(
              (r) => r.userId === authUserId && (r.country ?? 'nl') === apiCountry
            );
      setHistory(merged);
      setLatest((current) => {
        if (current && (current.country ?? 'nl') === apiCountry) return current;
        return merged[0] ?? null;
      });
      if (receipts.length > 0) setAllReceipts(receipts);
      setAnalytics(stats);
    } catch {
      setError(t('receipts.loadError'));
    } finally {
      setLoadingHistory(false);
    }
  }, [apiCountry, setAllReceipts, t]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const onFile = async (file: File | null) => {
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const saved = await uploadReceipt(file, userId, apiCountry);
      upsertReceipt(saved);
      setLatest(saved);
      setTab(0);
      await refresh();
    } catch (err: unknown) {
      const msg = axiosMessage(err) || t('receipts.uploadError');
      setError(msg);
    } finally {
      setUploading(false);
    }
  };

  const onDelete = async (id: string) => {
    try {
      await deleteReceipt(id, userId);
      removeLocalReceipt(id);
      if (latest?.id === id) setLatest(null);
      await refresh();
    } catch {
      setError(t('receipts.deleteError'));
    }
  };

  const onCorrectLine = async (
    receiptId: string,
    lineIndex: number,
    correction: { action: 'rematch'; correctedName: string } | { action: 'unmatched' }
  ) => {
    setError(null);
    try {
      const updated = await correctReceiptLine(receiptId, lineIndex, correction, userId);
      upsertReceipt(updated);
      setHistory((receipts) =>
        receipts.map((receipt) => (receipt.id === updated.id ? updated : receipt))
      );
      setLatest((receipt) => (receipt?.id === updated.id ? updated : receipt));
      setAnalytics(await fetchReceiptAnalytics(userId, apiCountry));
    } catch (err: unknown) {
      setError(axiosMessage(err) || t('receipts.correctError'));
    }
  };

  const onClearAll = async () => {
    if (!window.confirm(t('receipts.clearConfirm'))) return;
    setError(null);
    setLoadingHistory(true);
    try {
      await deleteAllReceipts(userId);
      setAllReceipts([]);
      setHistory([]);
      setLatest(null);
      setAnalytics(null);
    } catch {
      setError(t('receipts.clearError'));
    } finally {
      setLoadingHistory(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppNavBar />
      <Container maxWidth="md" sx={{ flex: '1 0 auto', py: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
          <Typography variant="h5" fontWeight={600} gutterBottom>
            {t('receipts.title')}
          </Typography>
          {(history.length > 0 || latest) && (
            <Button
              color="error"
              variant="outlined"
              size="small"
              startIcon={<DeleteIcon />}
              onClick={onClearAll}
              disabled={loadingHistory}
              sx={{ flexShrink: 0 }}
            >
              {t('receipts.clearAll')}
            </Button>
          )}
        </Box>
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          {t('receipts.subtitle')}
        </Typography>
        <Alert severity="info" sx={{ mb: 3 }}>
          {t('receipts.privacy')}
        </Alert>

        <AnalyticsPanel analytics={analytics} loading={loadingHistory} country={apiCountry} />

        <Card
          variant="outlined"
          sx={{
            mb: 3,
            borderStyle: 'dashed',
            bgcolor: 'background.paper',
            textAlign: 'center',
            py: 4,
          }}
        >
          <CardContent>
            <UploadFileIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
            <Typography gutterBottom>{t('receipts.uploadHint')}</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {t('receipts.uploadTypes')}
            </Typography>
            <Button variant="contained" component="label" disabled={uploading}>
              {uploading ? t('receipts.reading') : t('receipts.upload')}
              <input
                type="file"
                hidden
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => onFile(e.target.files?.[0] ?? null)}
              />
            </Button>
            {uploading && (
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center', gap: 1 }}>
                <CircularProgress size={20} />
                <Typography variant="body2">{t('receipts.analyzing')}</Typography>
              </Box>
            )}
          </CardContent>
        </Card>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
          <Tab label={t('receipts.tabLatest')} />
          <Tab label={fill(t('receipts.tabHistory'), { count: history.length })} />
        </Tabs>

        {tab === 0 && latest && (
          <ReceiptResults receipt={latest} country={apiCountry} onCorrect={onCorrectLine} />
        )}
        {tab === 0 && !latest && !uploading && (
          <Typography color="text.secondary">{t('receipts.emptyLatest')}</Typography>
        )}

        {tab === 1 && (
          <>
            {loadingHistory && <LinearProgress sx={{ mb: 2 }} />}
            {history.map((receipt) => (
              <Box key={receipt.id} sx={{ position: 'relative' }}>
                <IconButton
                  size="small"
                  sx={{ position: 'absolute', right: 8, top: 8, zIndex: 1 }}
                  onClick={() => onDelete(receipt.id)}
                  aria-label={t('receipts.deleteAria')}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
                <ReceiptResults
                  receipt={receipt}
                  country={apiCountry}
                  onCorrect={onCorrectLine}
                />
              </Box>
            ))}
            {!loadingHistory && history.length === 0 && (
              <Typography color="text.secondary">{t('receipts.emptyHistory')}</Typography>
            )}
          </>
        )}
      </Container>
      <Footer />
    </Box>
  );
};

function axiosMessage(err: unknown): string | null {
  if (typeof err === 'object' && err !== null && 'response' in err) {
    const data = (err as { response?: { data?: { error?: string } } }).response?.data;
    return data?.error ?? null;
  }
  return null;
}
