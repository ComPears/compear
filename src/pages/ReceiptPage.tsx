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
  Divider,
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
  Typography,
} from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import DeleteIcon from '@mui/icons-material/Delete';
import SavingsIcon from '@mui/icons-material/Savings';
import StoreIcon from '@mui/icons-material/Store';
import { PagesNavBar } from '../components/PagesNavBar';
import {
  deleteReceipt,
  fetchReceiptAnalytics,
  fetchReceipts,
  ReceiptAnalytics,
  SavedReceipt,
  uploadReceipt,
} from '../api/client';
import { getUserId } from '../utils/userId';
import { useReceiptStore } from '../store/receiptStore';

function formatEuro(value: number) {
  return `€${value.toFixed(2)}`;
}

function formatDate(iso: string | null) {
  if (!iso) return '—';
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString('nl-NL');
}

const ReceiptResults: React.FC<{ receipt: SavedReceipt }> = ({ receipt }) => {
  const { analysis } = receipt;
  return (
    <Card variant="outlined" sx={{ mb: 3 }}>
      <CardContent>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
          <Chip icon={<StoreIcon />} label={analysis.storeDetected || 'Winkel onbekend'} />
          <Chip label={formatDate(analysis.purchaseDate || receipt.uploadedAt)} />
          <Chip color="primary" label={`Betaald: ${formatEuro(analysis.actualTotal)}`} />
          {analysis.potentialSavings > 0 && (
            <Chip
              color="success"
              icon={<SavingsIcon />}
              label={`Had kunnen besparen: ${formatEuro(analysis.potentialSavings)}`}
            />
          )}
        </Box>

        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Product</TableCell>
                <TableCell align="right">Betaald</TableCell>
                <TableCell>Goedkoopste</TableCell>
                <TableCell align="right">Besparing</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {analysis.lines.map((line) => (
                <TableRow key={`${line.rawName}-${line.paidLineTotal}`}>
                  <TableCell>
                    {line.rawName}
                    {line.quantity > 1 ? ` ×${line.quantity}` : ''}
                    {!line.matchedProduct && (
                      <Typography variant="caption" color="warning.main" display="block">
                        Geen match in catalogus
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell align="right">{formatEuro(line.paidLineTotal)}</TableCell>
                  <TableCell>
                    {line.cheapestAlternative ? (
                      <>
                        {line.cheapestAlternative.store} —{' '}
                        {formatEuro(line.cheapestAlternative.effectivePrice * line.quantity)}
                      </>
                    ) : (
                      '—'
                    )}
                  </TableCell>
                  <TableCell align="right" sx={{ color: line.lineSavings > 0 ? 'success.main' : undefined }}>
                    {line.lineSavings > 0 ? formatEuro(line.lineSavings) : '—'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {analysis.shoppingPlan && analysis.shoppingPlan.storeCount > 1 && (
          <Alert severity="info" sx={{ mt: 2 }}>
            Slimste winkelplan: {analysis.shoppingPlan.storeCount} winkels voor{' '}
            {formatEuro(analysis.shoppingPlan.grandTotal)}
            {analysis.shoppingPlan.savingsVsSingleStore > 0 &&
              ` (bespaart ${formatEuro(analysis.shoppingPlan.savingsVsSingleStore)} vs. één winkel)`}
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

const AnalyticsPanel: React.FC<{ analytics: ReceiptAnalytics | null; loading: boolean }> = ({
  analytics,
  loading,
}) => {
  if (loading) return <LinearProgress sx={{ my: 2 }} />;
  if (!analytics || analytics.receiptCount === 0) {
    return (
      <Typography color="text.secondary" sx={{ py: 2 }}>
        Upload bonnen om je uitgaven en besparingen over tijd te zien.
      </Typography>
    );
  }

  return (
    <Box sx={{ mb: 3 }}>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr' }, gap: 2, mb: 2 }}>
        <Card variant="outlined">
          <CardContent>
            <Typography variant="overline" color="text.secondary">
              Totaal uitgegeven
            </Typography>
            <Typography variant="h5">{formatEuro(analytics.totalSpent)}</Typography>
            <Typography variant="body2" color="text.secondary">
              {analytics.receiptCount} bonnen
            </Typography>
          </CardContent>
        </Card>
        <Card variant="outlined">
          <CardContent>
            <Typography variant="overline" color="text.secondary">
              Had kunnen besparen
            </Typography>
            <Typography variant="h5" color="success.main">
              {formatEuro(analytics.totalCouldHaveSaved)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Gem. {formatEuro(analytics.averageSavingsPerReceipt)} per bon
            </Typography>
          </CardContent>
        </Card>
        <Card variant="outlined">
          <CardContent>
            <Typography variant="overline" color="text.secondary">
              Per winkel
            </Typography>
            {analytics.byStore.slice(0, 3).map((s) => (
              <Typography key={s.store} variant="body2">
                {s.store}: {formatEuro(s.totalSpent)} uitgegeven,{' '}
                {formatEuro(s.totalCouldHaveSaved)} misgelopen
              </Typography>
            ))}
          </CardContent>
        </Card>
      </Box>

      {analytics.byMonth.length > 0 && (
        <Box>
          <Typography variant="subtitle1" fontWeight={600} gutterBottom>
            Per maand
          </Typography>
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Maand</TableCell>
                  <TableCell align="right">Bonnen</TableCell>
                  <TableCell align="right">Uitgegeven</TableCell>
                  <TableCell align="right">Besparing gemist</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {analytics.byMonth.map((m) => (
                  <TableRow key={m.month}>
                    <TableCell>{m.month}</TableCell>
                    <TableCell align="right">{m.receiptCount}</TableCell>
                    <TableCell align="right">{formatEuro(m.totalSpent)}</TableCell>
                    <TableCell align="right">{formatEuro(m.totalCouldHaveSaved)}</TableCell>
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
  const userId = useMemo(() => getUserId(), []);
  const localReceipts = useReceiptStore((s) => s.receipts);
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
      const [receipts, stats] = await Promise.all([
        fetchReceipts(userId),
        fetchReceiptAnalytics(userId),
      ]);
      const merged =
        receipts.length > 0
          ? receipts
          : localReceipts.filter((r) => r.userId === userId);
      setHistory(merged);
      if (receipts.length > 0) setAllReceipts(receipts);
      setAnalytics(stats);
    } catch {
      setError('Kon bonhistorie niet laden.');
    } finally {
      setLoadingHistory(false);
    }
  }, [userId, localReceipts, setAllReceipts]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const onFile = async (file: File | null) => {
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const saved = await uploadReceipt(file, userId);
      upsertReceipt(saved);
      setLatest(saved);
      setTab(0);
      await refresh();
    } catch (err: unknown) {
      const msg =
        axiosMessage(err) ||
        'Upload mislukt. Controleer de afbeelding en of OPENAI_API_KEY op de backend staat.';
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
      setError('Verwijderen mislukt.');
    }
  };

  return (
    <>
      <PagesNavBar />
      <Container maxWidth="md" sx={{ py: 3 }}>
        <Typography variant="h5" fontWeight={600} gutterBottom>
          Bonnen & besparingen
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          Upload een bonfoto. AI leest de producten en laat zien waar je goedkoper had kunnen
          winkelen. Je bonnen worden opgeslagen om uitgaven over tijd te volgen.
        </Typography>

        <AnalyticsPanel analytics={analytics} loading={loadingHistory} />

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
            <Typography gutterBottom>Sleep een bonfoto of kies een bestand</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              JPEG, PNG of WebP — max 8 MB. Maximaal een paar bonnen per uur.
            </Typography>
            <Button variant="contained" component="label" disabled={uploading}>
              {uploading ? 'Bon wordt gelezen…' : 'Bon uploaden'}
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
                <Typography variant="body2">AI analyseert je bon…</Typography>
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
          <Tab label="Laatste analyse" />
          <Tab label={`Geschiedenis (${history.length})`} />
        </Tabs>

        {tab === 0 && latest && <ReceiptResults receipt={latest} />}
        {tab === 0 && !latest && !uploading && (
          <Typography color="text.secondary">Upload een bon om aanbevelingen te zien.</Typography>
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
                  aria-label="Verwijder bon"
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
                <ReceiptResults receipt={receipt} />
              </Box>
            ))}
            {!loadingHistory && history.length === 0 && (
              <Typography color="text.secondary">Nog geen opgeslagen bonnen.</Typography>
            )}
          </>
        )}
      </Container>
    </>
  );
};

function axiosMessage(err: unknown): string | null {
  if (typeof err === 'object' && err !== null && 'response' in err) {
    const data = (err as { response?: { data?: { error?: string } } }).response?.data;
    return data?.error ?? null;
  }
  return null;
}
