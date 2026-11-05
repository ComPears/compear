import { Link as RouterLink, useLocation } from 'react-router-dom';
import { Box, Button, Stack } from '@mui/material';
import { useCountry } from '../context/CountryContext';
import { useLanguage } from '../context/LanguageContext';
import departments from '../config/shopping-departments.json';

export function DepartmentNav() {
  const { country } = useCountry(), { t } = useLanguage();
  const location = useLocation();
  return <Box component="nav" aria-label={t('explore.departments')} sx={{ bgcolor: '#edf1e4', borderBottom: '1px solid', borderColor: 'divider', px: 2 }}>
    <Stack direction="row" gap={{ xs: 1, sm: 3 }} sx={{ maxWidth: 1200, mx: 'auto', overflowX: 'auto', py: .5 }}>
      {departments.map(department => { const active = location.pathname.replace(/\/$/, '') === `/${country.code}/departments/${department.slug}`; return <Button key={department.slug} component={RouterLink} to={`/${country.code}/departments/${department.slug}`} color="primary" aria-current={active ? 'page' : undefined} sx={{ flexShrink: 0, minHeight: 44, whiteSpace: 'nowrap', ...(active ? { bgcolor: '#dce6cc' } : {}) }}>{t(`explore.${department.slug}`)}</Button>; })}
    </Stack>
  </Box>;
}
