import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Alert,
  Paper,
  TextField,
  IconButton,
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ShoppingCartCheckoutIcon from '@mui/icons-material/ShoppingCartCheckout';
import { useNavigate, useParams } from 'react-router-dom';
import AppNavBar from '../components/AppNavBar';
import { fetchSharedList, SharedList } from '../api/client';
import { useBasketStore } from '../store/basketStore';
import { useLanguage } from '../context/LanguageContext';
import { useCountry } from '../context/CountryContext';

export const SharedListPage: React.FC = () => {
  const { listId } = useParams<{ listId: string }>();
  const navigate = useNavigate();
  const { country } = useCountry();
  const { t } = useLanguage();
  const addToBasket = useBasketStore((s) => s.add);
  const [list, setList] = useState<SharedList | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!listId) return;
    setLoading(true);
    fetchSharedList(listId)
      .then(setList)
      .catch(() => setError(t('shared.notFound')))
      .finally(() => setLoading(false));
  }, [listId, t]);

  const shareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/${country.code}/shared/${listId}`
    : '';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  };

  const handleImport = () => {
    if (!list) return;
    for (const item of list.items) {
      addToBasket(
        {
          id: item.productId,
          productName: item.productName,
          store: item.store,
          effectivePrice: item.effectivePrice,
          canonicalName: item.productName.toLowerCase(),
          brand: null,
          packageSize: '',
          weightInGrams: null,
          originalPrice: item.effectivePrice,
          unitPrice: item.effectivePrice,
          effectiveUnitPrice: item.effectivePrice,
          promoType: null,
          promoValue: null,
          promoValidUntil: null,
          productUrl: null,
          scrapedAt: new Date().toISOString(),
        },
        item.quantity
      );
    }
    navigate(`/${country.code}/basket`);
  };

  return (
    <>
      <AppNavBar />
      <Container maxWidth="sm" sx={{ py: 3 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : list ? (
          <>
            <Typography variant="h5" fontWeight={600} gutterBottom>
              {list.name}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {t('shared.itemCount').replace('{count}', String(list.items.length))}
            </Typography>

            <TextField
              fullWidth
              size="small"
              value={shareUrl}
              InputProps={{
                readOnly: true,
                endAdornment: (
                  <IconButton onClick={handleCopy} aria-label={t('shared.copyLink')}>
                    <ContentCopyIcon fontSize="small" />
                  </IconButton>
                ),
              }}
              sx={{ mb: 2 }}
            />
            {copied && (
              <Typography variant="caption" color="primary" sx={{ display: 'block', mb: 1 }}>
                {t('shared.copied')}
              </Typography>
            )}

            <List component={Paper} variant="outlined" sx={{ mb: 2 }}>
              {list.items.map((item) => (
                <ListItem key={`${item.productId}-${item.store}`} divider>
                  <ListItemText
                    primary={item.productName}
                    secondary={`${item.store} · ${item.quantity}× · €${item.effectivePrice.toFixed(2)}`}
                  />
                </ListItem>
              ))}
            </List>

            <Button
              variant="contained"
              startIcon={<ShoppingCartCheckoutIcon />}
              onClick={handleImport}
            >
              {t('shared.importBasket')}
            </Button>
          </>
        ) : null}
      </Container>
    </>
  );
};
