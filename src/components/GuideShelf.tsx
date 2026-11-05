import { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Alert, Box, Button, Card, CardActionArea, Chip, Skeleton, Stack, Tab, Tabs, Typography } from '@mui/material';
import LocalCafeOutlinedIcon from '@mui/icons-material/LocalCafeOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import SpaOutlinedIcon from '@mui/icons-material/SpaOutlined';
import ArrowOutwardIcon from '@mui/icons-material/ArrowOutward';
import { fetchGuides, GuideSummary } from '../api/shopping';
import { useCountry } from '../context/CountryContext';
import { useLanguage } from '../context/LanguageContext';
import { formatMoney } from '../utils/formatMoney';

export function GuideShelf({ full = false, sections = ['breakfast', 'pantry', 'household', 'family'] }: { full?: boolean; sections?: string[] }) {
  const { country } = useCountry(), { t } = useLanguage();
  const [guides, setGuides] = useState<GuideSummary[]>([]), [loading, setLoading] = useState(true), [failed, setFailed] = useState(false);
  const [section, setSection] = useState(sections[0] ?? 'breakfast');
  const selectedSection = sections.includes(section) ? section : sections[0];
  useEffect(() => { let active = true; setLoading(true); setFailed(false); fetchGuides(country.code).then(value => { if (active) setGuides(value); }).catch(() => { if (active) setFailed(true); }).finally(() => { if (active) setLoading(false); }); return () => { active = false; }; }, [country.code]);
  return <Box component="section" sx={{ my: 5 }} aria-label={t('guides.nav')}>
    <Stack direction={{ xs: 'column', sm: 'row' }} gap={2} justifyContent="space-between" sx={{ mb: 2 }}>
      <Box><Typography component={full ? 'h1' : 'h2'} variant={full ? 'h2' : 'h4'} color="primary.dark" sx={{ fontSize: { xs: '2rem', md: full ? '3.3rem' : '2.5rem' } }}>{t('guides.title')}</Typography><Typography color="text.secondary" sx={{ mt: 1, maxWidth: 650 }}>{t('guides.subtitle')}</Typography></Box>
      {!full && <Button component={RouterLink} to={`/${country.code}/guides`} endIcon={<ArrowOutwardIcon />}>{t('guides.nav')}</Button>}
    </Stack>
    <Tabs value={selectedSection} onChange={(_, value) => setSection(value)} variant="scrollable" scrollButtons="auto" allowScrollButtonsMobile aria-label={t('guides.nav')} sx={{ mb: 3 }}>{sections.map(key => <Tab key={key} value={key} label={t(`guides.${key}`)} />)}</Tabs>
    {failed && <Alert severity="info">{t('guides.empty')}</Alert>}
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2,minmax(0,1fr))', md: 'repeat(3,minmax(0,1fr))' }, gap: { xs: 1.5, md: 2.5 } }}>
      {loading ? [1, 2, 3].map(id => <Skeleton key={id} variant="rounded" height={220} />) : guides.filter(guide => guide.section === selectedSection).map((guide, index) => <Card key={guide.slug} variant="outlined" sx={{ boxShadow: 'none', borderRadius: 3, bgcolor: index % 2 ? '#f0f3e8' : '#fff' }}>
        <CardActionArea component={RouterLink} to={`/${country.code}/guides/${guide.slug}`} sx={{ p: { xs: 2, md: 3 }, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'space-between', minHeight: 240 }}>
          <Box aria-hidden="true" sx={{ width: 64, height: 64, borderRadius: '50% 50% 42% 42%', display: 'grid', placeItems: 'center', bgcolor: '#e1e9d6', color: 'primary.dark', mb: 3 }}>{section === 'breakfast' ? <LocalCafeOutlinedIcon sx={{ fontSize: 34 }} /> : section === 'pantry' ? <Inventory2OutlinedIcon sx={{ fontSize: 34 }} /> : <SpaOutlinedIcon sx={{ fontSize: 34 }} />}</Box>
          <Typography component="h3" variant="h5" sx={{ fontSize: { xs: '1.2rem', md: '1.5rem' }, mb: 1 }}>{guide.title}</Typography>
          {guide.lowPackPrice != null && <Typography fontWeight={750} color="primary.dark">{t('search.fromPrice').replace('{price}', formatMoney(guide.lowPackPrice, country.code))}</Typography>}
          <Stack direction="row" gap={0.75} flexWrap="wrap" sx={{ mt: 1, minWidth: 0, maxWidth: '100%' }}><Chip size="small" variant="outlined" label={t('guides.offers').replace('{count}', String(guide.offerCount))} sx={{ height: 'auto', maxWidth: '100%', '& .MuiChip-label': { whiteSpace: 'normal', lineHeight: 1.4, py: 0.4 } }} /><Typography variant="caption" color="text.secondary">{t('guides.stores').replace('{count}', String(guide.storeCount))}</Typography></Stack>
        </CardActionArea>
      </Card>)}
    </Box>
  </Box>;
}
