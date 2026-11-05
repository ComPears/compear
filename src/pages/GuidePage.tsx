import { useEffect, useState } from 'react';
import { Link as RouterLink, useParams } from 'react-router-dom';
import { Alert, Box, Button, Chip, CircularProgress, Container, Paper, Stack, Typography } from '@mui/material';
import { fetchGuide, ShoppingGuide } from '../api/shopping';
import { useCountry } from '../context/CountryContext';
import { useLanguage } from '../context/LanguageContext';
import AppNavBar from '../components/AppNavBar';
import Footer from '../components/Footer';
import { Seo, sitePath } from '../components/Seo';
import { ProductGroupList } from '../components/ProductGroupList';
import { groupProducts } from '../utils/productGrouping';
import { formatMoney } from '../utils/formatMoney';
import { productPath } from '../utils/productSlug';
import guideTopics from '../config/shopping-guides.json';

export function GuidePage() {
  const { guideSlug = '' } = useParams(), { country } = useCountry(), { t } = useLanguage();
  const [guide, setGuide] = useState<ShoppingGuide | null>(null), [loading, setLoading] = useState(true);
  useEffect(() => { const controller = new AbortController(); setLoading(true); setGuide(null); fetchGuide(guideSlug, country.code, controller.signal).then(setGuide).catch(() => undefined).finally(() => { if (!controller.signal.aborted) setLoading(false); }); return () => controller.abort(); }, [guideSlug, country.code]);
  const title = guide ? `${guide.title} | ${t('guides.nav')}` : t('guides.nav');
  const topic = guideTopics.find(item => item.slug === guideSlug);
  return <><Seo title={`${title} | ComPear`} description={t('guides.method')} path={`/${country.code}/guides/${guideSlug}`} country={country.code} noIndex={!loading && !guide} structuredData={guide ? [{ '@context': 'https://schema.org', '@type': 'ItemList', name: title, numberOfItems: guide.products.length, itemListElement: guide.products.map((p, i) => ({ '@type': 'ListItem', position: i + 1, name: p.productName, url: sitePath(productPath(country.code, p)) })) }] : undefined} /><AppNavBar />
    <Container component="main" maxWidth="lg" sx={{ py: 4 }}>
      <Button component={RouterLink} to={`/${country.code}/guides`}>← {t('guides.nav')}</Button>
      <Typography component="h1" variant="h2" color="primary.dark" sx={{ my: 2, fontSize: { xs: '2.5rem', md: '3.5rem' } }}>{guide?.title ?? t('guides.nav')}</Typography>
      <Typography color="text.secondary" sx={{ maxWidth: 800, mb: 3 }}>{t('guides.method')}</Typography>
      {topic && <Alert severity="info" sx={{ mb: 3 }}>{topic.tips[country.code]}</Alert>}
      {loading ? <CircularProgress aria-label={t('search.searching')} /> : !guide || !guide.products.length ? <Alert severity="info">{t('guides.empty')}</Alert> : <>
        <Stack direction="row" gap={1} sx={{ mb: 3 }}><Chip label={t('guides.offers').replace('{count}', String(guide.offerCount))} /><Chip label={t('guides.stores').replace('{count}', String(guide.storeCount))} /></Stack>
        {guide.recommendation && <Paper variant="outlined" sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr auto' }, gap: 2, p: 3, bgcolor: 'primary.dark', color: 'white', mb: 3 }}>
          <Box><Typography variant="overline" sx={{ letterSpacing: '.1em' }}>{t('guides.leader')}</Typography><Typography component="h2" variant="h5" sx={{ mt: 1 }}>{guide.recommendation.product.productName}</Typography><Typography sx={{ mt: 0.5 }}>{guide.recommendation.product.store} · {guide.recommendation.product.packageSize}</Typography><Typography variant="caption" sx={{ display: 'block', mt: 1, maxWidth: 600, opacity: 0.8 }}>{t('guides.leaderHint')}</Typography></Box>
          <Box><Typography fontWeight={800} fontSize="2rem">{formatMoney(guide.recommendation.unitPrice, country.code)} / {guide.recommendation.basis}</Typography><Button component={RouterLink} to={productPath(country.code, guide.recommendation.product)} variant="contained" sx={{ mt: 1, bgcolor: '#dce9c2', color: 'primary.dark', '&:hover': { bgcolor: '#cbdba9' } }}>{t('brief.details')}</Button></Box>
        </Paper>}
        <ProductGroupList groups={groupProducts(guide.products)} />
      </>}
    </Container><Footer /></>;
}
