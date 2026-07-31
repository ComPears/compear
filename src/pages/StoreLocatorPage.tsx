import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  List,
  ListItemButton,
  ListItemText,
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

type ChainOption = { slug: string; label?: string; labelKey?: 'search.allStores' };

const NL_CHAINS: ChainOption[] = [
  { slug: '', labelKey: 'search.allStores' },
  { slug: 'albert-heijn', label: 'Albert Heijn' },
  { slug: 'jumbo', label: 'Jumbo' },
  { slug: 'aldi', label: 'ALDI' },
  { slug: 'dirk', label: 'Dirk' },
  { slug: 'lidl', label: 'Lidl' },
  { slug: 'coop', label: 'Coop' },
  { slug: 'plus', label: 'PLUS' },
];

const UK_CHAINS: ChainOption[] = [
  { slug: '', labelKey: 'search.allStores' },
  { slug: 'tesco', label: 'Tesco' },
  { slug: 'sainsburys', label: "Sainsbury's" },
  { slug: 'asda', label: 'Asda' },
  { slug: 'morrisons', label: 'Morrisons' },
  { slug: 'aldi-uk', label: 'Aldi' },
  { slug: 'lidl-uk', label: 'Lidl' },
];

const CHAIN_LABELS: Record<string, string> = {
  'albert-heijn': 'Albert Heijn',
  jumbo: 'Jumbo',
  aldi: 'ALDI',
  dirk: 'Dirk',
  lidl: 'Lidl',
  coop: 'Coop',
  plus: 'PLUS',
  tesco: 'Tesco',
  sainsburys: "Sainsbury's",
  asda: 'Asda',
  morrisons: 'Morrisons',
  'aldi-uk': 'Aldi',
  'lidl-uk': 'Lidl',
};

function chainLabel(chain: string, fallback: string): string {
  return CHAIN_LABELS[chain] ?? fallback;
}

/** Prefer city / street so rows don’t all read “Albert Heijn / Albert Heijn”. */
function storePrimary(loc: StoreLocation): string {
  const chain = chainLabel(loc.chain, loc.name);
  if (loc.city?.trim()) return `${chain} · ${loc.city.trim()}`;
  if (loc.address && loc.address !== loc.name) {
    const street = loc.address.split(',')[0]?.trim();
    if (street) return `${chain} · ${street}`;
  }
  return chain;
}

function storeSecondary(loc: StoreLocation): string {
  const parts: string[] = [];
  if (loc.address && loc.address !== loc.name) {
    parts.push(loc.address);
  } else if (loc.city?.trim() && loc.name !== loc.city) {
    parts.push(chainLabel(loc.chain, loc.name));
  }
  if (loc.distanceKm != null) {
    parts.push(`${loc.distanceKm.toFixed(1)} km`);
  }
  return parts.join(' · ');
}

function mapsUrl(loc: StoreLocation): string {
  if (loc.lat && loc.lng) {
    return `https://www.google.com/maps/search/?api=1&query=${loc.lat},${loc.lng}`;
  }
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${storePrimary(loc)}, ${loc.address}`
  )}`;
}

function osmEmbedUrl(locations: StoreLocation[], selected?: StoreLocation | null): string | null {
  const points = locations.filter((l) => Number.isFinite(l.lat) && Number.isFinite(l.lng));
  if (points.length === 0) return null;
  const focus = selected && Number.isFinite(selected.lat) ? selected : points[0];
  const lats = points.map((p) => p.lat);
  const lngs = points.map((p) => p.lng);
  const pad = 0.02;
  const minLat = Math.min(...lats) - pad;
  const maxLat = Math.max(...lats) + pad;
  const minLng = Math.min(...lngs) - pad;
  const maxLng = Math.max(...lngs) + pad;
  return `https://www.openstreetmap.org/export/embed.html?bbox=${minLng}%2C${minLat}%2C${maxLng}%2C${maxLat}&layer=mapnik&marker=${focus.lat}%2C${focus.lng}`;
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
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const chains = country.code === 'uk' ? UK_CHAINS : NL_CHAINS;

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
          radius: lat != null ? 25 : undefined,
          limit: lat != null ? 40 : 30,
        });
        setLocations(data);
        setSelectedId(data[0]?.id ?? null);
      } catch {
        setError(t('stores.loadError'));
        setLocations([]);
        setSelectedId(null);
      } finally {
        setLoading(false);
      }
    },
    [chain, country.available, t]
  );

  useEffect(() => {
    loadLocations(coords?.lat, coords?.lng);
  }, [loadLocations, coords]);

  const selected = useMemo(
    () => locations.find((l) => l.id === selectedId) ?? null,
    [locations, selectedId]
  );

  const mapUrl = useMemo(() => osmEmbedUrl(locations, selected), [locations, selected]);

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
        <Container component="main" maxWidth="md" sx={{ py: 4 }}>
          <Alert severity="info">{t('app.comingSoon')}</Alert>
        </Container>
      </>
    );
  }

  return (
    <>
      <AppNavBar />
      <Container component="main" maxWidth="md" sx={{ py: 3 }}>
        <Typography
          component="h1"
          variant="h4"
          sx={{ fontWeight: 650, color: 'primary.dark', mb: 0.75 }}
        >
          {t('stores.title')}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
          {t('stores.subtitle')}
        </Typography>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2, alignItems: 'center' }}>
          {chains.map((c) => {
            const label = c.labelKey ? t(c.labelKey) : c.label;
            const active = chain === c.slug;
            return (
              <Chip
                key={c.slug || 'all'}
                label={label}
                clickable
                color={active ? 'primary' : 'default'}
                variant={active ? 'filled' : 'outlined'}
                onClick={() => setChain(c.slug)}
                sx={{ fontWeight: 600 }}
              />
            );
          })}
        </Box>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mb: 2, alignItems: 'center' }}>
          <Button
            variant="contained"
            startIcon={locating ? <CircularProgress size={18} color="inherit" /> : <MyLocationIcon />}
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
              color="primary"
              variant="outlined"
            />
          )}
          {!coords && (
            <Typography variant="caption" color="text.secondary">
              {t('stores.nearMeHint')}
            </Typography>
          )}
        </Box>

        {error && (
          <Alert severity="warning" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box
            role="status"
            aria-live="polite"
            aria-label={t('stores.locating')}
            sx={{ display: 'flex', justifyContent: 'center', py: 4 }}
          >
            <CircularProgress />
          </Box>
        ) : locations.length === 0 ? (
          <Typography color="text.secondary">{t('stores.noneFound')}</Typography>
        ) : (
          <Box className="cp-fade-up" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {mapUrl && (
              <Box
                sx={{
                  borderRadius: 2,
                  overflow: 'hidden',
                  border: '1px solid',
                  borderColor: 'divider',
                  height: { xs: 220, sm: 280 },
                  bgcolor: 'rgba(11, 110, 79, 0.04)',
                }}
              >
                <Box
                  component="iframe"
                  title={t('stores.mapTitle')}
                  src={mapUrl}
                  sx={{ border: 0, width: '100%', height: '100%', display: 'block' }}
                  loading="lazy"
                />
              </Box>
            )}

            <List
              component={Paper}
              variant="outlined"
              disablePadding
              aria-label={t('stores.resultsStatus').replace('{count}', String(locations.length))}
            >
              <Typography
                component="li"
                role="status"
                aria-live="polite"
                sx={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)' }}
              >
                {t('stores.resultsStatus').replace('{count}', String(locations.length))}
              </Typography>
              {locations.map((loc) => {
                const primary = storePrimary(loc);
                const secondary = storeSecondary(loc);
                const selectedRow = loc.id === selectedId;
                return (
                  <ListItemButton
                    key={loc.id}
                    selected={selectedRow}
                    onClick={() => setSelectedId(loc.id)}
                    divider
                    sx={{ alignItems: 'flex-start', py: 1.25 }}
                  >
                    <ListItemText
                      primary={primary}
                      secondary={secondary || undefined}
                      primaryTypographyProps={{ fontWeight: 650 }}
                      secondaryTypographyProps={{ sx: { mt: 0.25 } }}
                    />
                    <IconButton
                      edge="end"
                      aria-label={t('stores.openMapsFor').replace('{store}', primary)}
                      href={mapsUrl(loc)}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      sx={{ minWidth: 44, minHeight: 44, mt: 0.25 }}
                    >
                      <OpenInNewIcon />
                    </IconButton>
                  </ListItemButton>
                );
              })}
            </List>
          </Box>
        )}

        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>
          <a
            href="https://www.openstreetmap.org/copyright"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'inherit' }}
          >
            {t('stores.osmAttribution')}
          </a>
        </Typography>
      </Container>
    </>
  );
};
