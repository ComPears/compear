import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Alert,
  IconButton,
  Box,
} from '@mui/material';
import ShareIcon from '@mui/icons-material/Share';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { createSharedList, SharedListItem } from '../api/client';
import { useLanguage } from '../context/LanguageContext';
import { useCountry } from '../context/CountryContext';

interface ShareListDialogProps {
  open: boolean;
  onClose: () => void;
  listName: string;
  items: SharedListItem[];
}

export const ShareListDialog: React.FC<ShareListDialogProps> = ({
  open,
  onClose,
  listName,
  items,
}) => {
  const { t } = useLanguage();
  const { country } = useCountry();
  const [name, setName] = useState(listName);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await createSharedList(name, items);
      const url = `${window.location.origin}/${country.code}/shared/${list.id}`;
      setShareUrl(url);
    } catch {
      setError(t('shared.createError'));
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  };

  const handleClose = () => {
    setShareUrl(null);
    setError(null);
    setCopied(false);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>{t('shared.title')}</DialogTitle>
      <DialogContent>
        {!shareUrl ? (
          <>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {t('shared.description')}
            </Typography>
            <TextField
              fullWidth
              label={t('shared.listName')}
              value={name}
              onChange={(e) => setName(e.target.value)}
              sx={{ mb: 2 }}
            />
            {error && <Alert severity="error">{error}</Alert>}
          </>
        ) : (
          <>
            <Alert severity="success" sx={{ mb: 2 }}>
              {t('shared.created')}
            </Alert>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField fullWidth size="small" value={shareUrl} InputProps={{ readOnly: true }} />
              <IconButton onClick={handleCopy} aria-label={t('shared.copyLink')}>
                <ContentCopyIcon />
              </IconButton>
            </Box>
            {copied && (
              <Typography variant="caption" color="primary" sx={{ mt: 1, display: 'block' }}>
                {t('shared.copied')}
              </Typography>
            )}
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>{shareUrl ? t('search.cancel') : t('shared.close')}</Button>
        {!shareUrl && (
          <Button
            variant="contained"
            startIcon={<ShareIcon />}
            onClick={handleShare}
            disabled={loading || items.length === 0}
          >
            {loading ? t('shared.creating') : t('shared.createLink')}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};
