import React, { useCallback, useEffect, useState } from 'react';
import {
  Snackbar,
  Paper,
  Box,
  Button,
  IconButton,
  Typography,
  Stack,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import InstallMobileIcon from '@mui/icons-material/InstallMobile';
import IosShareIcon from '@mui/icons-material/IosShare';
import { useLanguage } from '../context/LanguageContext';

// The event is not yet in the TS DOM lib; describe the parts we use.
interface BeforeInstallPromptEvent extends Event {
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
  prompt: () => Promise<void>;
}

const DISMISS_KEY = 'pwa-install-dismissed-at';
// Don't nag: stay quiet for two weeks after a dismissal or an install.
const DISMISS_COOLDOWN_MS = 14 * 24 * 60 * 60 * 1000;

function isStandalone(): boolean {
  return (
    window.matchMedia?.('(display-mode: standalone)').matches === true ||
    (window.navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

function isIos(): boolean {
  const ua = window.navigator.userAgent;
  const iOSDevice = /iphone|ipad|ipod/i.test(ua);
  // iPadOS 13+ presents as desktop Safari; detect the touch-capable Mac.
  const iPadOs = navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1;
  return iOSDevice || iPadOs;
}

function isIosSafari(): boolean {
  const ua = window.navigator.userAgent;
  return isIos() && /safari/i.test(ua) && !/crios|fxios|edgios/i.test(ua);
}

function recentlyHandled(): boolean {
  try {
    const raw = localStorage.getItem(DISMISS_KEY);
    if (!raw) return false;
    const ts = Number(raw);
    return Number.isFinite(ts) && Date.now() - ts < DISMISS_COOLDOWN_MS;
  } catch {
    return false;
  }
}

function remember(): void {
  try {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
  } catch {
    /* storage may be unavailable (private mode) */
  }
}

export const InstallPrompt: React.FC = () => {
  const { t } = useLanguage();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [variant, setVariant] = useState<'android' | 'ios' | null>(null);

  useEffect(() => {
    if (isStandalone() || recentlyHandled()) return undefined;

    const onBeforeInstall = (event: Event) => {
      // Suppress the default mini-infobar so we can show a branded prompt.
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
      setVariant('android');
    };

    const onInstalled = () => {
      remember();
      setDeferredPrompt(null);
      setVariant(null);
    };

    window.addEventListener('beforeinstallprompt', onBeforeInstall);
    window.addEventListener('appinstalled', onInstalled);

    // iOS Safari never fires beforeinstallprompt, so show manual instructions
    // after a short delay to avoid competing with first paint.
    let iosTimer: number | undefined;
    if (isIosSafari()) {
      iosTimer = window.setTimeout(() => setVariant('ios'), 3000);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall);
      window.removeEventListener('appinstalled', onInstalled);
      if (iosTimer) window.clearTimeout(iosTimer);
    };
  }, []);

  const handleDismiss = useCallback(() => {
    remember();
    setVariant(null);
  }, []);

  const handleInstall = useCallback(async () => {
    if (!deferredPrompt) return;
    remember();
    setVariant(null);
    await deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
  }, [deferredPrompt]);

  if (!variant) return null;

  const isIosVariant = variant === 'ios';

  return (
    <Snackbar
      open
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      sx={{ px: { xs: 1, sm: 0 }, bottom: { xs: 12, sm: 24 } }}
    >
      <Paper
        elevation={8}
        role="dialog"
        aria-label={t('pwa.install.title')}
        sx={{
          width: '100%',
          maxWidth: 460,
          p: 2,
          borderRadius: 3,
          borderTop: 3,
          borderColor: 'primary.main',
        }}
      >
        <Stack direction="row" spacing={1.5} alignItems="flex-start">
          <Box
            component="img"
            src="/icon-maskable-192.png"
            alt=""
            sx={{ width: 44, height: 44, borderRadius: 2, flexShrink: 0 }}
          />
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="subtitle1" fontWeight={700} gutterBottom>
              {t('pwa.install.title')}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {isIosVariant ? t('pwa.install.iosBody') : t('pwa.install.body')}
            </Typography>

            {isIosVariant ? (
              <Stack
                direction="row"
                spacing={0.75}
                alignItems="center"
                sx={{ mt: 1.5, color: 'text.secondary' }}
              >
                <IosShareIcon fontSize="small" color="primary" />
                <Typography variant="caption">
                  {t('pwa.install.iosHint')}
                </Typography>
              </Stack>
            ) : (
              <Stack direction="row" spacing={1} sx={{ mt: 1.5 }}>
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<InstallMobileIcon />}
                  onClick={handleInstall}
                >
                  {t('pwa.install.action')}
                </Button>
                <Button size="small" color="inherit" onClick={handleDismiss}>
                  {t('pwa.install.dismiss')}
                </Button>
              </Stack>
            )}
          </Box>

          <IconButton
            size="small"
            edge="end"
            aria-label={t('pwa.install.close')}
            onClick={handleDismiss}
            sx={{ mt: -0.5, mr: -0.5 }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Stack>
      </Paper>
    </Snackbar>
  );
};

export default InstallPrompt;
