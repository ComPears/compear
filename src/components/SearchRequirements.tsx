import { useId, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, Box, Button, InputAdornment, MenuItem, Paper, Stack, TextField, Typography } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { useCountry } from '../context/CountryContext';
import { useLanguage } from '../context/LanguageContext';
import type { Constraint } from '../api/shopping';
import { briefSearchParams, positiveAmount } from '../utils/briefNavigation';

const CLAIMS = ['vegan', 'vegetarian', 'gluten-free', 'lactose-free', 'halal', 'no-added-sugar'];

export function SearchRequirements({ productQuery, disabled = false }: { productQuery: string; disabled?: boolean }) {
  const { country } = useCountry(), { t } = useLanguage(), navigate = useNavigate();
  const panelId = useId();
  const [open, setOpen] = useState(false), [pack, setPack] = useState(''), [unit, setUnit] = useState(''), [claim, setClaim] = useState('');
  const [basis, setBasis] = useState<'kg' | 'l' | 'item'>('l');
  const currency = country.code === 'uk' ? '£' : '€';
  const maximumPack = positiveAmount(pack), maximumUnit = positiveAmount(unit, 4);
  const invalidPack = Boolean(pack.trim()) && maximumPack === undefined;
  const invalidUnit = Boolean(unit.trim()) && maximumUnit === undefined;
  const checks: Constraint[] = [];
  if (maximumPack !== undefined) checks.push({ kind: 'price', maximum: maximumPack });
  if (maximumUnit !== undefined) checks.push({ kind: 'unit-price', maximum: maximumUnit, basis });
  if (CLAIMS.includes(claim)) checks.push({ kind: 'claim', value: claim });
  const hasQuery = productQuery.trim().length >= 2 && productQuery.trim().length <= 400;
  const canApply = !disabled && hasQuery && checks.length > 0 && !invalidPack && !invalidUnit;

  return <Box sx={{ mt: 1 }}>
    <Button type="button" onClick={() => setOpen(value => !value)} aria-expanded={open} aria-controls={open ? panelId : undefined} endIcon={open ? <ExpandLessIcon /> : <ExpandMoreIcon />} sx={{ minHeight: 44, px: 1 }}>{t('requirements.add')}</Button>
    {open && <Paper id={panelId} component="form" aria-label={t('requirements.title')} onSubmit={event => { event.preventDefault(); if (canApply) navigate(`/${country.code}/brief?${briefSearchParams(productQuery, checks)}`); }} variant="outlined" sx={{ mt: 1, p: { xs: 2, sm: 2.5 }, bgcolor: '#f0f3e8', borderRadius: 3 }}>
      <Typography component="h2" variant="h6" sx={{ mb: 1 }}>{t('requirements.title')}</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>{t('requirements.hint')}</Typography>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1.5fr 1.2fr' }, gap: 2 }}>
        <TextField label={t('requirements.packPrice')} value={pack} onChange={event => setPack(event.target.value)} error={invalidPack} helperText={invalidPack ? t('requirements.invalid') : t('requirements.optional')} slotProps={{ htmlInput: { inputMode: 'decimal', maxLength: 12 }, input: { startAdornment: <InputAdornment position="start">{currency}</InputAdornment> } }} />
        <Stack direction="row" gap={1} sx={{ minWidth: 0 }}>
          <TextField label={t('requirements.unitPrice')} value={unit} onChange={event => setUnit(event.target.value)} error={invalidUnit} helperText={invalidUnit ? t('requirements.invalid') : t('requirements.optional')} sx={{ flex: 1, minWidth: 0 }} slotProps={{ htmlInput: { inputMode: 'decimal', maxLength: 12 }, input: { startAdornment: <InputAdornment position="start">{currency}</InputAdornment> } }} />
          <TextField select label={t('requirements.basis')} value={basis} onChange={event => setBasis(event.target.value as typeof basis)} sx={{ minWidth: 100 }}>{(['kg', 'l', 'item'] as const).map(value => <MenuItem key={value} value={value}>{value === 'item' ? t('evidence.item') : value}</MenuItem>)}</TextField>
        </Stack>
        <TextField select label={t('requirements.claim')} value={claim} onChange={event => setClaim(event.target.value)} helperText={t('requirements.optional')}><MenuItem value="">{t('requirements.any')}</MenuItem>{CLAIMS.map(value => <MenuItem key={value} value={value}>{t(`labels.${value}`)}</MenuItem>)}</TextField>
      </Box>
      <Alert severity="info" sx={{ mt: 1 }}>{t('requirements.evidence')}</Alert>
      <Stack direction={{ xs: 'column', sm: 'row' }} gap={1} alignItems={{ sm: 'center' }} sx={{ mt: 2 }}>
        <Button type="submit" variant="contained" disabled={!canApply} sx={{ minHeight: 44 }}>{t('requirements.apply')}</Button>
        <Button type="button" disabled={!pack && !unit && !claim} onClick={() => { setPack(''); setUnit(''); setClaim(''); }} sx={{ minHeight: 44 }}>{t('requirements.clear')}</Button>
        {!hasQuery && <Typography variant="caption" color="text.secondary">{t('requirements.productHint')}</Typography>}
      </Stack>
    </Paper>}
  </Box>;
}
