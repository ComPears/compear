import { FormEvent, useState } from 'react';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import { Box, Button, Chip, Paper, Stack, TextField, Typography } from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
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

export function BriefEntry() {
  const { country } = useCountry(), { t } = useLanguage(), navigate = useNavigate();
  const [request, setRequest] = useState('');
  const submit = (event: FormEvent) => { event.preventDefault(); if (request.trim().length >= 2) navigate(`/${country.code}/brief?q=${encodeURIComponent(request.trim())}`); };
  return <Box sx={{ maxWidth: 960, mx: 'auto', mb: 4 }}>
    <Paper component="form" onSubmit={submit} variant="outlined" sx={{ p: { xs: 2, sm: 3 }, borderRadius: 4, borderColor: '#9aaf89', bgcolor: '#f0f3e8' }}>
      <TextField fullWidth multiline minRows={2} maxRows={4} label={t('brief.input')} placeholder={t('brief.placeholder')} value={request} onChange={event => setRequest(event.target.value)} slotProps={{ htmlInput: { maxLength: 400 }, inputLabel: { shrink: true } }} sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'white' } }} />
      <Stack direction={{ xs: 'column', sm: 'row' }} gap={2} alignItems={{ sm: 'center' }} justifyContent="space-between" sx={{ mt: 2 }}>
        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 550 }}>{t('explore.briefHint')}</Typography>
        <Button type="submit" variant="contained" endIcon={<ArrowForwardIcon />} disabled={request.trim().length < 2} sx={{ flexShrink: 0, minHeight: 48 }}>{t('brief.submit')}</Button>
      </Stack>
    </Paper>
    <Typography variant="caption" color="text.secondary" component="p" sx={{ mt: 2, mb: 1 }}>{t('explore.start')}</Typography>
    <Stack direction="row" gap={1} sx={{ overflowX: 'auto', pb: 1 }}>{[1, 2, 3].map(index => <Chip key={index} component={RouterLink} clickable to={`/${country.code}/brief?q=${encodeURIComponent(t(`brief.example${index}`))}`} label={t(`brief.example${index}`)} variant="outlined" sx={{ minHeight: 44, flexShrink: 0 }} />)}</Stack>
  </Box>;
}
