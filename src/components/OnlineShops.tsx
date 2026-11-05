import { useEffect, useState } from 'react';
import { Box, Button, Card, TextField, Typography } from '@mui/material';
import ArrowOutwardIcon from '@mui/icons-material/ArrowOutward';
import { useCountry } from '../context/CountryContext';
import { useLanguage } from '../context/LanguageContext';
import { discoveryLink, discoveryShops, Department } from '../services/retailerDiscovery';

export function OnlineShops({ department, initialQuery = '' }: { department: Department; initialQuery?: string }) {
  const { country } = useCountry(), { t } = useLanguage();
  const [query, setQuery] = useState(initialQuery);
  useEffect(() => setQuery(initialQuery), [country.code, initialQuery]);
  return <Box component="section" aria-label={t('explore.shops')} sx={{ my: 5, p: { xs: 2, md: 3 }, border: '1px solid', borderColor: 'divider', borderRadius: 4, bgcolor: '#f0f3e8' }}>
    <Typography component="h2" variant="h4" color="primary.dark" sx={{ mb: 1 }}>{t('explore.shops')}</Typography>
    <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 750, mb: 3 }}>{t('explore.externalHint')}</Typography>
    <TextField label={t('explore.searchShops')} value={query} onChange={event => setQuery(event.target.value)} fullWidth slotProps={{ htmlInput: { maxLength: 200 } }} sx={{ maxWidth: 640, bgcolor: 'white', mb: 3 }} />
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2,minmax(0,1fr))' }, gap: 2 }}>
      {discoveryShops(country.code, department).map(shop => <Card key={shop.id} variant="outlined" sx={{ boxShadow: 'none', borderRadius: 3 }}><Box sx={{ p: 2.5 }}>
        <Typography component="h3" variant="h5">{shop.name}</Typography><Typography variant="caption" color="text.secondary" component="p" sx={{ my: 1.5 }}>{t('explore.external')}</Typography>
        <Button component="a" href={discoveryLink(country.code, shop.id, query)} target="_blank" rel="noopener noreferrer nofollow" referrerPolicy="no-referrer" endIcon={<ArrowOutwardIcon />} variant="outlined">{t(query.trim() && shop.queryParameter ? 'explore.searchAt' : 'explore.visit').replace('{shop}', shop.name)}</Button>
      </Box></Card>)}
    </Box>
  </Box>;
}
