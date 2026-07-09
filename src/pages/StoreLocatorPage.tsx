import React, { useCallback, useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  CircularProgress,
  Alert,
  Chip,
  Paper,
} from '@mui/material';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import AppNavBar from '../components/AppNavBar';
import { fetchStoreLocations, StoreLocation } from '../api/client';
import { useLanguage } from '../context/LanguageContext';
import { useCountry } from '../context/CountryContext';

const CHAINS = [
  { slug: '', labelKey: 'search.allStores' as const },
  { slug: 'albert-heijn', label: 'Albert Heijn' },
  { slug: 'jumbo', label: 'Jumbo' },
  { slug: 'aldi', label: 'ALDI' },
  { slug: 'dirk', label: 'Dirk' },
  { slug: 'lidl', label: 'Lidl' },
  { slug: 'coop', label: 'Coop' },
  { slug: 'plus', label: 'PLUS' },
];

function mapsUrl(loc: StoreLocation): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${loc.name}, ${loc.address}`)}`;
}

export const StoreLocatorPage: React.FC = () => {
  const { t } = useLanguage();
  const { country } = useCountry();
  const [chain, setChain] = useState('');
  const [locations, setLocations] = useState<StoreLocation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [locating, setLocating] = useState(false);

  const loadLocations = useCallback(
    async (lat?: number, lng?: number) => {
      if (!country.available) return;
      setLoading(true);
      setError(null);
      try {
        const data = await fetchStoreLocations({
          chain: chain || undefined,
          lat,
          lng,
          radius: 25,
          limit: 30,
        });
        setLocations(data);
      } catch {
        setError(t('stores.loadError'));
        setLocations([]);
      } finally {
        setLoading(false);
      }
    },
    [chain, country.available, t]
  );

  useEffect(() => {
    loadLocations(coords?.lat, coords?.lng);
  }, [loadLocations, coords]);

  const handleNearMe = () => {
    if (!navigator.geolocation) {
      setError(t('stores.geoUnsupported'));
      return;
    }
    setLocating(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocating(false);
      },
      (err) => {
        setLocating(false);
        if (err.code === err.PERMISSION_DENIED) {
          setError(t('stores.geoDeniedHint'));
        } else if (err.code === err.TIMEOUT) {
          setError(t('stores.geoTimeout'));
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          setError(t('stores.geoUnavailable'));
        } else {
          setError(t('stores.geoDenied'));
        }
      },
      { enableHighAccuracy: false, timeout: 15000, maximumAge: 60000 }
    );
  };

  if (!country.available) {
    return (
      <>
        <AppNavBar />
        <Container maxWidth="md" sx={{ py: 4 }}>
          <Alert severity="info">{t('app.comingSoon')}</Alert>
        </Container>
      </>
    );
  }

  return (
    <>
      <AppNavBar />
      <Container maxWidth="md" sx={{ py: 3 }}>
        <Typography variant="h5" fontWeight={600} gutterBottom>
          {t('stores.title')}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {t('stores.subtitle')}
        </Typography>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2, alignItems: 'center' }}>
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel>{t('search.storeFilter')}</InputLabel>
            <Select
              value={chain}
              label={t('search.storeFilter')}
              onChange={(e) => setChain(e.target.value)}
            >
              {CHAINS.map((c) => (
                <MenuItem key={c.slug || 'all'} value={c.slug}>
                  {'labelKey' in c && c.labelKey ? t(c.labelKey) : c.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button
            variant="outlined"
            startIcon={locating ? <CircularProgress size={18} /> : <MyLocationIcon />}
            onClick={handleNearMe}
            disabled={locating}
          >
            {locating ? t('stores.locating') : t('stores.nearMe')}
          </Button>
          {coords && (
            <Chip
              label={t('stores.usingLocation')}
              onDelete={() => setCoords(null)}
              size="small"
            />
          )}
        </Box>

        {error && (
          <Alert severity="warning" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : locations.length === 0 ? (
          <Typography color="text.secondary">{t('stores.noneFound')}</Typography>
        ) : (
          <List component={Paper} variant="outlined">
            {locations.map((loc) => (
              <ListItem key={loc.id} divider>
                <ListItemText
                  primary={loc.name}
                  secondary={
                    <>
                      {loc.address}
                      {loc.distanceKm != null && <> · {loc.distanceKm.toFixed(1)} km</>}
                    </>
                  }
                />
                <ListItemSecondaryAction>
                  <IconButton
                    edge="end"
                    aria-label={t('stores.openMaps')}
                    href={mapsUrl(loc)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <OpenInNewIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        )}
      </Container>
    </>
  );
};
