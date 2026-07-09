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

interface BarcodeScannerDialogProps {
  open: boolean;
  onClose: () => void;
  onDetected: (barcode: string) => void;
}

export const BarcodeScannerDialog: React.FC<BarcodeScannerDialogProps> = ({
  open,
  onClose,
  onDetected,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const readerRef = useRef<BrowserMultiFormatReader | null>(null);
  const controlsRef = useRef<IScannerControls | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [manualCode, setManualCode] = useState('');
  const [scanning, setScanning] = useState(false);

  const stopScanner = useCallback(() => {
    controlsRef.current?.stop();
    controlsRef.current = null;
    readerRef.current = null;
    setScanning(false);
  }, []);

  useEffect(() => {
    if (!open) {
      stopScanner();
      setError(null);
      setManualCode('');
      return;
    }

    let cancelled = false;

    const start = async () => {
      if (!videoRef.current) return;
      setError(null);
      setScanning(true);

      try {
        const reader = new BrowserMultiFormatReader();
        readerRef.current = reader;
        const controls = await reader.decodeFromVideoDevice(
          undefined,
          videoRef.current,
          (result, err) => {
            if (cancelled || !result) return;
            const text = result.getText().trim();
            if (!text) return;
            onDetected(text);
            stopScanner();
            onClose();
          }
        );
        if (cancelled) {
          controls.stop();
          return;
        }
        controlsRef.current = controls;
      } catch (err) {
        if (!cancelled) {
          setScanning(false);
          setError(
            'Camera niet beschikbaar. Voer de streepjescode handmatig in of geef cameratoegang.'
          );
        }
      }
    };

    start();

    return () => {
      cancelled = true;
      stopScanner();
    };
  }, [open, onClose, onDetected, stopScanner]);

  const submitManual = () => {
    const code = manualCode.trim();
    if (!code) return;
    onDetected(code);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Scan streepjescode</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Richt de camera op de EAN op de verpakking. Werkt het best op verpakte producten met een
          standaard barcode.
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
          />
          {scanning && (
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
              Scannen…
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
          label="Of typ EAN handmatig"
          placeholder="8710400012345"
          value={manualCode}
          onChange={(e) => setManualCode(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') submitManual();
          }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Annuleren</Button>
        <Button variant="contained" onClick={submitManual} disabled={!manualCode.trim()}>
          Zoeken
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
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        variant="outlined"
        startIcon={<QrCodeScannerIcon />}
        onClick={() => setOpen(true)}
        disabled={disabled}
      >
        Scan barcode
      </Button>
      <BarcodeScannerDialog
        open={open}
        onClose={() => setOpen(false)}
        onDetected={onDetected}
      />
    </>
  );
};
