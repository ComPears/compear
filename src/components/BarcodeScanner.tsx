import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
} from '@mui/material';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import { BrowserMultiFormatReader, IScannerControls } from '@zxing/browser';
import { useLanguage } from '../context/LanguageContext';

interface BarcodeScannerDialogProps {
  open: boolean;
  onClose: () => void;
  onDetected: (barcode: string) => void;
}

function cameraErrorMessage(err: unknown, t: (key: string) => string): string {
  if (err instanceof DOMException) {
    if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
      return t('search.cameraDenied');
    }
    if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
      return t('search.cameraNotFound');
    }
    if (err.name === 'NotReadableError') {
      return t('search.cameraInUse');
    }
  }
  return t('search.cameraUnavailable');
}

export const BarcodeScannerDialog: React.FC<BarcodeScannerDialogProps> = ({
  open,
  onClose,
  onDetected,
}) => {
  const { t } = useLanguage();
  const videoRef = useRef<HTMLVideoElement>(null);
  const readerRef = useRef<BrowserMultiFormatReader | null>(null);
  const controlsRef = useRef<IScannerControls | null>(null);
  const activeRef = useRef(false);
  const [error, setError] = useState<string | null>(null);
  const [manualCode, setManualCode] = useState('');
  const [scanning, setScanning] = useState(false);

  const stopScanner = useCallback(() => {
    activeRef.current = false;
    controlsRef.current?.stop();
    controlsRef.current = null;
    readerRef.current = null;
    const video = videoRef.current;
    if (video?.srcObject instanceof MediaStream) {
      video.srcObject.getTracks().forEach((track) => track.stop());
      video.srcObject = null;
    }
    setScanning(false);
  }, []);

  const startScanner = useCallback(async () => {
    stopScanner();
    activeRef.current = true;

    // Dialog enter animation finishes before onEntered; retry once if ref is late.
    let video = videoRef.current;
    if (!video) {
      await new Promise((r) => requestAnimationFrame(r));
      video = videoRef.current;
    }
    if (!video) {
      setError(t('search.cameraUnavailable'));
      return;
    }

    setError(null);
    setScanning(true);

    try {
      const reader = new BrowserMultiFormatReader();
      readerRef.current = reader;
      const controls = await reader.decodeFromConstraints(
        {
          video: {
            facingMode: { ideal: 'environment' },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
        },
        video,
        (result) => {
          if (!activeRef.current || !result) return;
          const text = result.getText().trim();
          if (!text) return;
          onDetected(text);
          stopScanner();
          onClose();
        }
      );
      if (!activeRef.current) {
        controls.stop();
        return;
      }
      controlsRef.current = controls;
      try {
        await video.play();
      } catch {
        // Some browsers auto-play after srcObject is set by zxing.
      }
    } catch (err) {
      if (activeRef.current) {
        setScanning(false);
        setError(cameraErrorMessage(err, t));
      }
    }
  }, [onClose, onDetected, stopScanner, t]);

  useEffect(() => () => stopScanner(), [stopScanner]);

  const handleClose = () => {
    stopScanner();
    onClose();
  };

  const submitManual = () => {
    const code = manualCode.trim();
    if (!code) return;
    onDetected(code);
    handleClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="sm"
      TransitionProps={{
        onEntered: () => {
          void startScanner();
        },
        onExited: () => {
          stopScanner();
          setError(null);
          setManualCode('');
        },
      }}
    >
      <DialogTitle>{t('search.scanTitle')}</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {t('search.scanHint')}
        </Typography>

        <Box
          sx={{
            position: 'relative',
            width: '100%',
            aspectRatio: '4 / 3',
            bgcolor: 'grey.900',
            borderRadius: 2,
            overflow: 'hidden',
            mb: 2,
          }}
        >
          <video
            ref={videoRef}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            muted
            playsInline
            autoPlay
          />
          {scanning && !error && (
            <Typography
              variant="caption"
              sx={{
                position: 'absolute',
                bottom: 8,
                left: 8,
                color: 'common.white',
                bgcolor: 'rgba(0,0,0,0.5)',
                px: 1,
                py: 0.5,
                borderRadius: 1,
              }}
            >
              {t('search.scanning')}
            </Typography>
          )}
        </Box>

        {error && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <TextField
          fullWidth
          size="small"
          label={t('search.manualEan')}
          placeholder="8710400012345"
          value={manualCode}
          onChange={(e) => setManualCode(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') submitManual();
          }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>{t('search.cancel')}</Button>
        <Button variant="contained" onClick={submitManual} disabled={!manualCode.trim()}>
          {t('search.searchButton')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

interface BarcodeScanButtonProps {
  onDetected: (barcode: string) => void;
  disabled?: boolean;
}

export const BarcodeScanButton: React.FC<BarcodeScanButtonProps> = ({
  onDetected,
  disabled,
}) => {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        variant="outlined"
        startIcon={<QrCodeScannerIcon />}
        onClick={() => setOpen(true)}
        disabled={disabled}
      >
        {t('search.scanButton')}
      </Button>
      <BarcodeScannerDialog
        open={open}
        onClose={() => setOpen(false)}
        onDetected={onDetected}
      />
    </>
  );
};
