import { useEffect, useRef, useState } from 'react';
import { Link as RouterLink, useSearchParams } from 'react-router-dom';
import { Alert, Box, Button, Chip, CircularProgress, Container, Link, Paper, Stack, Tab, Tabs, TextField, Typography } from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import AppNavBar from '../components/AppNavBar';
import Footer from '../components/Footer';
import { fetchStores, isStoreAvailable, StoreInfo } from '../api/client';
import { BriefResponse, Constraint, searchBrief } from '../api/shopping';
import { useCountry } from '../context/CountryContext';
import { useLanguage } from '../context/LanguageContext';
import { constraintLabel } from '../utils/briefLabels';
import { formatMoney } from '../utils/formatMoney';
import { productPath } from '../utils/productSlug';
import { sanitizeProductLink } from '../utils/safeLink';
import { UnitPrice, OfferEvidence } from '../components/OfferEvidence';
import { OnlineShops } from '../components/OnlineShops';
import { briefSearchParams, readBriefChecks } from '../utils/briefNavigation';

type Section = 'matches' | 'unknown' | 'excluded';

export function ShoppingBriefPage() {
  const { country } = useCountry(), { t } = useLanguage();
  const [params, setParams] = useSearchParams();
  const [request, setRequest] = useState(params.get('q') ?? '');
  const [response, setResponse] = useState<BriefResponse | null>(null);
  const [explicitChecks, setExplicitChecks] = useState<Constraint[] | undefined>();
  const [queryEdit, setQueryEdit] = useState('');
  const [section, setSection] = useState<Section>('matches');
  const [stores, setStores] = useState<StoreInfo[]>([]), [retailerSelections, setRetailerSelections] = useState<Record<string, string[]>>({});
  const selected = retailerSelections[country.code] ?? [];
  const setSelected = (update: (current: string[]) => string[]) => setRetailerSelections(current => ({ ...current, [country.code]: update(current[country.code] ?? []) }));
  const [loading, setLoading] = useState(false), [error, setError] = useState(false);
  const abort = useRef<AbortController | null>(null);
  useEffect(() => {
    let active = true;
    fetchStores(country.code).then(value => { if (active) setStores(value); }).catch(() => undefined);
    return () => { active = false; abort.current?.abort(); };
  }, [country.code]);
  const submit = async (text = request, constraints?: Constraint[], offsets?: BriefResponse['offsets']) => {
    if (text.trim().length < 2) return;
    abort.current?.abort(); const controller = new AbortController(); abort.current = controller;
    setLoading(true); setError(false); setRequest(text); setExplicitChecks(constraints); setParams(briefSearchParams(text, constraints), { replace: true });
    try {
      const result = await searchBrief(text, country.code, constraints, selected, controller.signal, offsets);
      if (controller.signal.aborted) return;
      setResponse(result); setQueryEdit(result.brief.query); if (!offsets) setSection(result.matches.length ? 'matches' : result.unknown.length ? 'unknown' : 'excluded');
    } catch { if (!controller.signal.aborted) setError(true); }
    finally { if (!controller.signal.aborted) setLoading(false); }
  };
  useEffect(() => {
    setResponse(null); setError(false); setLoading(false); setExplicitChecks(undefined);
    try {
      const q = params.get('q'), checks = readBriefChecks(params.get('checks'));
      if (q) void submit(q, checks);
      else if (checks !== undefined) setError(true);
    } catch { setError(true); }
    /* Run a shared brief once on route/country entry. */
  }, [country.code]); // eslint-disable-line react-hooks/exhaustive-deps
  const results = response?.[section] ?? [];
  return <>
    <AppNavBar />
    <Container component="main" maxWidth="lg" sx={{ py: { xs: 3, md: 5 } }}>
      <Box sx={{ maxWidth: 830, mb: 3 }}>
        <Typography variant="overline" color="primary.main" sx={{ letterSpacing: '.16em' }}>{t('brief.eyebrow')}</Typography>
        <Typography component="h1" variant="h2" color="primary.dark" sx={{ fontSize: { xs: '2.4rem', md: '3.6rem' }, lineHeight: 1.08, mb: 2 }}>{t('brief.title')}</Typography>
        <Typography color="text.secondary" sx={{ maxWidth: 670 }}>{t('brief.subtitle')}</Typography>
      </Box>
      <Paper component="form" onSubmit={event => { event.preventDefault(); void submit(request, explicitChecks); }} variant="outlined" sx={{ p: { xs: 2, md: 3 }, borderColor: '#b6cbb8', borderRadius: 3, mb: 2 }}>
        <TextField fullWidth multiline minRows={2} maxRows={4} label={t('brief.input')} placeholder={t('brief.placeholder')} value={request} onChange={event => setRequest(event.target.value)} slotProps={{ htmlInput: { maxLength: 400 } }} />
        <Stack direction={{ xs: 'column', sm: 'row' }} gap={2} justifyContent="space-between" alignItems={{ sm: 'center' }} sx={{ mt: 2 }}>
          <Typography variant="caption" color="text.secondary" sx={{ maxWidth: 640 }}>{t('brief.disclaimer')}</Typography>
          <Button type="submit" variant="contained" endIcon={loading ? <CircularProgress size={18} color="inherit" /> : <ArrowForwardIcon />} disabled={loading || request.trim().length < 2} sx={{ minWidth: 180 }}>{t('brief.submit')}</Button>
        </Stack>
      </Paper>
      <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mb: 3 }}>{[1, 2, 3].map(index => <Chip key={index} label={t(`brief.example${index}`)} variant="outlined" onClick={() => void submit(t(`brief.example${index}`))} sx={{ minHeight: 44 }} />)}</Stack>
      <Typography variant="subtitle2" sx={{ mb: 1 }}>{t('brief.retailers')}</Typography>
      <Typography variant="caption" color="text.secondary">{t('brief.applyRetailers')}</Typography>
      <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mb: 3 }}>{stores.map(store => <Chip key={store.id} label={store.name} disabled={!isStoreAvailable(store)} variant={selected.includes(store.name) ? 'filled' : 'outlined'} color={selected.includes(store.name) ? 'primary' : 'default'} aria-pressed={selected.includes(store.name)} onClick={() => setSelected(current => current.includes(store.name) ? current.filter(s => s !== store.name) : [...current, store.name])} sx={{ minHeight: 44 }} />)}</Stack>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{t('brief.error')}</Alert>}
      {loading && <Typography role="status" sx={{ my: 2 }}>{t('search.searching')}</Typography>}
      {response && !loading && !error && <>
        <Paper variant="outlined" sx={{ bgcolor: '#f0f3e8', p: 2.5, mb: 3 }}>
          <Typography component="h2" variant="h6" sx={{ mb: 2 }}>{t('brief.interpreted')}</Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} gap={1} sx={{ mb: 2 }}>
            <TextField size="small" label={t('brief.productQuery')} value={queryEdit} onChange={event => setQueryEdit(event.target.value)} sx={{ flex: 1 }} />
            <Button variant="outlined" onClick={() => void submit(queryEdit, response.brief.constraints)}>{t('brief.submit')}</Button>
          </Stack>
          <Stack direction="row" gap={1} flexWrap="wrap">{response.brief.constraints.map((condition, index) => <Chip key={JSON.stringify(condition) + index} label={constraintLabel(condition, t, country.code)} onDelete={() => void submit(response.brief.query, response.brief.constraints.filter((_, i) => i !== index))} deleteIcon={<HighlightOffIcon titleAccess={t('brief.remove')} />} sx={{ height: 'auto', minHeight: 44, '& .MuiChip-label': { whiteSpace: 'normal' } }} />)}</Stack>
          {response.brief.warnings.map(warning => <Alert severity="info" key={warning} sx={{ mt: 1 }}>{t(warning === 'unsupported-dose-constraint' ? 'brief.unsupportedDose' : warning === 'unparsed-condition' ? 'brief.unparsed' : 'brief.noConstraints')}</Alert>)}
        </Paper>
        <Typography variant="caption" color="text.secondary">{t('brief.evaluated').replace('{count}', String(response.evaluated))}</Typography>
        <Tabs value={section} onChange={(_, value) => setSection(value)} variant="scrollable" scrollButtons="auto" aria-label={t('brief.interpreted')} sx={{ mb: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
          {(['matches', 'unknown', 'excluded'] as const).map((key, index) => <Tab key={key} value={key} label={`${t(['brief.pass', 'brief.unknown', 'brief.fail'][index])} (${response.counts[key]})`} />)}
        </Tabs>
        {response.counts[section] > 0 && <Stack direction={{ xs: 'column', sm: 'row' }} gap={1} alignItems={{ sm: 'center' }} justifyContent="space-between" sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary">{t('brief.page').replace('{from}', String((response.offsets?.[section] ?? 0) + 1)).replace('{to}', String((response.offsets?.[section] ?? 0) + results.length)).replace('{total}', String(response.counts[section]))}</Typography>
          <Stack direction="row" gap={1}>{[-1, 1].map(direction => <Button key={direction} variant="outlined" disabled={loading || (direction < 0 ? !(response.offsets?.[section]) : (response.offsets?.[section] ?? 0) + 30 >= response.counts[section])} onClick={() => void submit(request, response.brief.constraints, { matches: 0, unknown: 0, excluded: 0, ...response.offsets, [section]: (response.offsets?.[section] ?? 0) + direction * 30 })}>{t(direction < 0 ? 'brief.previous' : 'brief.next')}</Button>)}</Stack>
        </Stack>}
        {!results.length && <Alert severity="info">{t('brief.empty')}</Alert>}
        <Stack spacing={2}>{results.map(result => {
          const leader = response.unitLeaders.find(item => item.productId === result.product.id);
          return <Paper key={result.product.id} variant="outlined" sx={{ p: { xs: 2, sm: 2.5 }, borderLeft: '4px solid', borderLeftColor: result.status === 'pass' ? 'primary.main' : result.status === 'unknown' ? '#d5ae65' : '#c9cec8', minWidth: 0 }}>
            {leader && <Chip size="small" color="primary" variant="outlined" label={`${t('guides.leader')} / ${leader.basis}`} sx={{ mb: 1.5, height: 'auto', '& .MuiChip-label': { whiteSpace: 'normal' } }} />}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'minmax(0,1fr) 170px 170px' }, gap: 2, alignItems: 'center' }}>
              <Box sx={{ minWidth: 0 }}><Link component={RouterLink} to={productPath(country.code, result.product)} color="text.primary" underline="hover" fontWeight={750} sx={{ fontSize: '1.1rem' }}>{result.product.productName}</Link><Typography variant="body2" color="text.secondary">{result.product.store} · {result.product.packageSize}</Typography><OfferEvidence product={result.product} /></Box>
              <Box><Typography fontSize="1.45rem" fontWeight={800} color="primary.dark">{formatMoney(result.product.originalPrice, country.code)}</Typography><UnitPrice product={result.product} /></Box>
              <Button component={RouterLink} to={productPath(country.code, result.product)} variant="outlined">{t('brief.details')}</Button>
            </Box>
            <Box component="details" sx={{ mt: 1.5, '& summary': { cursor: 'pointer', minHeight: 44, display: 'flex', alignItems: 'center', fontWeight: 650 }, '& ul': { pl: 0, listStyle: 'none' } }}>
              <summary>{t('brief.details')}</summary>
              <ul>{result.assessments.map((assessment, index) => <Box component="li" key={index} sx={{ display: 'flex', gap: 1, py: 1, alignItems: 'flex-start' }}>
                {assessment.status === 'pass' ? <CheckCircleOutlineIcon color="success" /> : assessment.status === 'fail' ? <HighlightOffIcon color="error" /> : <HelpOutlineIcon color="warning" />}
                <Box><Typography variant="body2" fontWeight={650}>{constraintLabel(assessment.constraint, t, country.code)}</Typography><Typography variant="body2" color="text.secondary">{t(`brief.${assessment.code}`)}{assessment.actual !== undefined ? ` · ${assessment.actual}` : ''}</Typography></Box>
              </Box>)}</ul>
              {sanitizeProductLink(result.product.labelEvidence?.sourceUrl) && <Link href={sanitizeProductLink(result.product.labelEvidence?.sourceUrl)} target="_blank" rel="noopener noreferrer nofollow">{t('brief.source')}</Link>}
            </Box>
          </Paper>;
        })}</Stack>
        <Box component="details" sx={{ mt: 4, '& summary': { minHeight: 44, cursor: 'pointer', fontWeight: 700 } }}><summary>{t('explore.shops')}</summary><OnlineShops department="grocery" initialQuery={response.brief.query} /></Box>
      </>}
    </Container><Footer />
  </>;
}
