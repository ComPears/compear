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
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import SaveIcon from '@mui/icons-material/Save';
import EditIcon from '@mui/icons-material/Edit';
import { useNavigate, useParams } from 'react-router-dom';
import AppNavBar from '../components/AppNavBar';
import Footer from '../components/Footer';
import { fetchSharedList, SharedList, SharedListItem, updateSharedList } from '../api/client';
import { useBasketStore } from '../store/basketStore';
import { useLanguage } from '../context/LanguageContext';
import { useCountry } from '../context/CountryContext';
import { formatMoney } from '../utils/formatMoney';
import { getListEditToken } from '../utils/listEditToken';

export const SharedListPage: React.FC = () => {
  const { listId } = useParams<{ listId: string }>();
  const navigate = useNavigate();
  const { country } = useCountry();
  const { t } = useLanguage();
  const addToBasket = useBasketStore((s) => s.add);
  const [list, setList] = useState<SharedList | null>(null);
  const [draftName, setDraftName] = useState('');
  const [draftItems, setDraftItems] = useState<SharedListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [canEdit, setCanEdit] = useState(false);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (!listId) return;
    setLoading(true);
    setError(null);
    fetchSharedList(listId)
      .then((loaded) => {
        setList(loaded);
        setDraftName(loaded.name);
        setDraftItems(loaded.items);
        setCanEdit(Boolean(getListEditToken(listId)));
      })
      .catch(() => setError(t('shared.notFound')))
      .finally(() => setLoading(false));
  }, [listId, t]);

  const shareUrl =
    typeof window !== 'undefined'
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

  const handleQuantityChange = (index: number, quantity: number) => {
    setDraftItems((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, quantity: Math.min(99, Math.max(1, Math.round(quantity) || 1)) } : item
      )
    );
    setSaved(false);
  };

  const handleRemoveItem = (index: number) => {
    setDraftItems((prev) => prev.filter((_, i) => i !== index));
    setSaved(false);
  };

  const handleSave = async () => {
    if (!listId || draftItems.length === 0) return;
    setSaving(true);
    setSaveError(null);
    try {
      const updated = await updateSharedList(listId, draftName, draftItems);
      setList(updated);
      setDraftName(updated.name);
      setDraftItems(updated.items);
      setCanEdit(true);
      setEditing(true);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      setSaveError(t('shared.saveError'));
    } finally {
      setSaving(false);
    }
  };

  const handleEnableEditing = async () => {
    if (!listId || !list) return;
    setSaving(true);
    setSaveError(null);
    try {
      // Legacy lists (no token yet) can be claimed; lists that already have a
      // token require the local edit token and will 403 without it.
      const updated = await updateSharedList(listId, list.name, list.items);
      setList(updated);
      setDraftName(updated.name);
      setDraftItems(updated.items);
      setCanEdit(true);
      setEditing(true);
    } catch {
      setSaveError(t('shared.claimError'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppNavBar />
      <Container maxWidth="sm" sx={{ flex: '1 0 auto', py: 3 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : list ? (
          <>
            {editing && canEdit ? (
              <TextField
                fullWidth
                label={t('shared.listName')}
                value={draftName}
                onChange={(e) => {
                  setDraftName(e.target.value);
                  setSaved(false);
                }}
                sx={{ mb: 2 }}
              />
            ) : (
              <Typography variant="h5" fontWeight={600} gutterBottom>
                {list.name}
              </Typography>
            )}
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {t('shared.itemCount').replace(
                '{count}',
                String(editing && canEdit ? draftItems.length : list.items.length)
              )}
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

            {canEdit && (
              <Alert severity="info" sx={{ mb: 2 }}>
                {t('shared.editorHint')}
              </Alert>
            )}

            <List component={Paper} variant="outlined" sx={{ mb: 2 }}>
              {(editing && canEdit ? draftItems : list.items).map((item, index) => (
                <ListItem
                  key={`${item.productId}-${item.store}-${index}`}
                  divider
                  secondaryAction={
                    editing && canEdit ? (
                      <IconButton
                        edge="end"
                        aria-label={t('shared.removeItem')}
                        onClick={() => handleRemoveItem(index)}
                      >
                        <DeleteOutlineIcon />
                      </IconButton>
                    ) : null
                  }
                >
                  <ListItemText
                    primary={item.productName}
                    secondary={`${item.store} · ${formatMoney(item.effectivePrice, country.code)}`}
                  />
                  {editing && canEdit ? (
                    <TextField
                      type="number"
                      size="small"
                      label={t('basket.quantity')}
                      value={item.quantity}
                      onChange={(e) => handleQuantityChange(index, Number(e.target.value))}
                      inputProps={{ min: 1, max: 99 }}
                      sx={{ width: 88, mr: editing && canEdit ? 5 : 0 }}
                    />
                  ) : (
                    <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
                      {item.quantity}×
                    </Typography>
                  )}
                </ListItem>
              ))}
            </List>

            {saveError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {saveError}
              </Alert>
            )}
            {saved && (
              <Alert severity="success" sx={{ mb: 2 }}>
                {t('shared.saved')}
              </Alert>
            )}

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              <Button
                variant="contained"
                startIcon={<ShoppingCartCheckoutIcon />}
                onClick={handleImport}
              >
                {t('shared.importBasket')}
              </Button>

              {canEdit && !editing && (
                <Button
                  variant="outlined"
                  startIcon={<EditIcon />}
                  onClick={() => {
                    setDraftName(list.name);
                    setDraftItems(list.items);
                    setEditing(true);
                  }}
                >
                  {t('shared.edit')}
                </Button>
              )}

              {canEdit && editing && (
                <Button
                  variant="outlined"
                  startIcon={<SaveIcon />}
                  onClick={handleSave}
                  disabled={saving || draftItems.length === 0}
                >
                  {saving ? t('shared.saving') : t('shared.save')}
                </Button>
              )}

              {!canEdit && list.claimable && (
                <Button variant="text" onClick={handleEnableEditing} disabled={saving}>
                  {saving ? t('shared.saving') : t('shared.enableEditing')}
                </Button>
              )}
            </Box>
          </>
        ) : null}
      </Container>
      <Footer />
    </Box>
  );
};
