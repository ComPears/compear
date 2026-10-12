import React, { useEffect, useState } from 'react';
import { Alert } from '@mui/material';
import { fetchStores, isStoreAvailable, StoreInfo } from '../api/client';
import { useCountry } from '../context/CountryContext';
import { useLanguage } from '../context/LanguageContext';

export default function StoreAvailabilityNotice({ stores }: { stores?: StoreInfo[] }) {
  const { country } = useCountry();
  const { t } = useLanguage();
  const [loaded, setLoaded] = useState<StoreInfo[]>([]);
  useEffect(() => {
    if (stores) return;
    let cancelled = false;
    setLoaded([]);
    fetchStores(country.code).then((rows) => {
      if (!cancelled) setLoaded(rows);
    }).catch(() => { /* Do not claim availability when the status request fails. */ });
    return () => { cancelled = true; };
  }, [country.code, stores]);
  const allStores = stores ?? loaded;
  const unavailable = allStores.filter((store) => !isStoreAvailable(store));
  if (!unavailable.length) return null;
  const allUnavailable = unavailable.length === allStores.length;
  return (
    <Alert severity={allUnavailable ? 'warning' : 'info'} role="status" sx={{ my: 2, textAlign: 'left', overflowWrap: 'anywhere' }}>
      {t(allUnavailable ? 'stores.allPriceDataUnavailable' : 'stores.priceDataUnavailable').replace('{stores}', unavailable.map((store) => store.name).join(', '))}
    </Alert>
  );
}
