import { ReactNode, useEffect, useState } from 'react';
import { Link as RouterLink, useParams } from 'react-router-dom';
import { Alert, Box, Button, Card, CardActionArea, Chip, CircularProgress, Container, MenuItem, Stack, TextField, Typography } from '@mui/material';
import AppNavBar from '../components/AppNavBar';
import Footer from '../components/Footer';
import NotFoundPage from '../components/NotFoundPage';
import { GuideShelf } from '../components/GuideShelf';
import { OnlineShops } from '../components/OnlineShops';
import { Seo, sitePath } from '../components/Seo';
import { useCountry } from '../context/CountryContext';
import { useLanguage } from '../context/LanguageContext';
import { fetchDeals, DealPage } from '../api/deals';
import { CATEGORIES, categorySlug, ProductCategory } from '../services/categoryService';
import { Department } from '../services/retailerDiscovery';
import { formatMoney } from '../utils/formatMoney';
import { checkedDate } from '../utils/offerEvidence';
import departments from '../config/shopping-departments.json';
import journal from '../config/journal.json';

function Layout({ title, description, path, noIndex = false, children }: { title: string; description: string; path: string; noIndex?: boolean; children: ReactNode }) {
  const { country } = useCountry();
  return <><Seo title={`${title} | ComPear`} description={description} path={`/${country.code}/${path}`} country={country.code} noIndex={noIndex} /><AppNavBar /><Container component="main" maxWidth="lg" sx={{ py: { xs: 2, md: 4 }, pb: 6 }}>
    <Box sx={{ maxWidth: 800, mb: 4 }}><Typography variant="overline" color="primary.main" sx={{ letterSpacing: '.14em' }}>COMPEARS</Typography><Typography component="h1" variant="h2" color="primary.dark" sx={{ fontSize: { xs: '2.4rem', md: '3.5rem' }, mb: 2 }}>{title}</Typography><Typography color="text.secondary">{description}</Typography></Box>{children}
  </Container><Footer /></>;
}

export function DepartmentPage() {
  const { departmentSlug } = useParams(), { country } = useCountry(), { t } = useLanguage();
  const department = departments.find(item => item.slug === departmentSlug);
  if (!department) return <NotFoundPage />;
  return <Layout title={t(`explore.${department.slug}`)} description={t('explore.departmentHint')} path={`departments/${department.slug}`} noIndex={department.slug === 'electronics'}>
    {department.slug === 'electronics' ? <Alert severity="info">{t('explore.electronicsHint')}</Alert> : <Stack direction="row" flexWrap="wrap" gap={1}>
      <Button component={RouterLink} to={department.categories.length === 1 ? `/${country.code}/categories/${categorySlug(department.categories[0] as ProductCategory)}` : `/${country.code}/search`} variant="contained">{t('explore.compare')}</Button>
      <Button component={RouterLink} to={`/${country.code}/brief`} variant="outlined">{t('brief.nav')}</Button>
      <Button component={RouterLink} to={`/${country.code}/deals`} variant="text">{t('explore.deals')}</Button>
    </Stack>}
    {department.sections.length > 0 && <GuideShelf sections={department.sections} />}
    <OnlineShops department={department.slug as Department} />
  </Layout>;
}

export function DealsPage() {
  const { country } = useCountry(), { t, language } = useLanguage();
  const [sort, setSort] = useState('saving'), [category, setCategory] = useState(''), [offset, setOffset] = useState(0), [retry, setRetry] = useState(0);
  const [page, setPage] = useState<DealPage | null>(null), [loading, setLoading] = useState(true), [error, setError] = useState(false);
  useEffect(() => { setOffset(0); setCategory(''); }, [country.code]);
  useEffect(() => {
    const controller = new AbortController(); setLoading(true); setError(false); setPage(null);
    fetchDeals(country.code, { sort, category, offset }, controller.signal).then(result => { if (!controller.signal.aborted) setPage(result); }).catch(() => { if (!controller.signal.aborted) setError(true); }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [country.code, sort, category, offset, retry]);
  return <Layout title={t('explore.deals')} description={t('explore.dealsHint')} path="deals">
    <Stack direction={{ xs: 'column', sm: 'row' }} gap={2} sx={{ mb: 3 }}>
      <TextField select label={t('explore.sort')} value={sort} onChange={event => { setSort(event.target.value); setOffset(0); }} sx={{ minWidth: 240 }}>{['saving', 'percent', 'price'].map(value => <MenuItem key={value} value={value}>{t(`explore.${value}`)}</MenuItem>)}</TextField>
      <TextField select label={t('filters.category')} value={category} onChange={event => { setCategory(event.target.value); setOffset(0); }} sx={{ minWidth: 220 }}><MenuItem value="">{t('filters.category.all')}</MenuItem>{CATEGORIES.filter(value => value !== 'Other').map(value => <MenuItem key={value} value={value}>{categoryName(value, language)}</MenuItem>)}</TextField>
    </Stack>
    <Alert severity="info" sx={{ mb: 3 }}>{t('explore.dealConditions')}</Alert>
    {loading && <Box role="status" aria-label={t('search.searching')} sx={{ py: 5 }}><CircularProgress /></Box>}
    {error && <Alert severity="error" action={<Button onClick={() => setRetry(value => value + 1)}>{t('explore.retry')}</Button>}>{t('explore.error')}</Alert>}
    {page && !page.items.length && <Alert severity="info">{t('explore.dealsEmpty')}</Alert>}
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2,minmax(0,1fr))', md: 'repeat(3,minmax(0,1fr))' }, gap: 2 }}>
      {page?.items.map(deal => <Card key={deal.id} variant="outlined" sx={{ p: 2.5, borderRadius: 3, boxShadow: 'none', display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        <Typography variant="overline" color="primary.main">{deal.store}</Typography><Typography component="h2" variant="h5">{deal.productName}</Typography><Typography variant="body2" color="text.secondary">{deal.packageSize}</Typography>
        <Box><Typography variant="caption">{t('explore.offerPrice')}</Typography><Typography fontWeight={800} fontSize="1.7rem" color="primary.dark">{formatMoney(deal.effectivePrice, country.code)}</Typography><Typography variant="body2">{t('explore.standard')}: {formatMoney(deal.originalPrice, country.code)}</Typography></Box>
        {deal.priceType === 'loyalty' && <Chip size="small" label={t('evidence.memberPrice')} color="warning" />}
        <Typography variant="caption" color="text.secondary">{deal.promoQuantity && deal.promoQuantity > 1 ? t('explore.quantity').replace('{count}', String(deal.promoQuantity)) : t('explore.quantityUnknown')}</Typography>
        <Typography variant="caption" color="text.secondary">{checkedDate(deal.scrapedAt, language) ? t('evidence.checked').replace('{date}', checkedDate(deal.scrapedAt, language)!) : t('evidence.dateUnknown')}</Typography>
        <Typography variant="caption" color="text.secondary">{deal.promoValidUntil && Number.isFinite(Date.parse(deal.promoValidUntil)) ? t('explore.ends').replace('{date}', new Date(deal.promoValidUntil).toLocaleDateString(language)) : t('explore.validityUnknown')}</Typography>
        <Button component={RouterLink} to={`/${country.code}/product/${encodeURIComponent(deal.id)}`} variant="outlined" sx={{ mt: 'auto' }}>{t('brief.details')}</Button>
      </Card>)}
    </Box>
    {page && page.total > 0 && <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 3 }}><Button disabled={!offset || loading} onClick={() => setOffset(value => Math.max(0, value - 24))}>{t('brief.previous')}</Button><Typography variant="body2">{offset + 1}–{offset + page.items.length} / {page.total}</Typography><Button disabled={offset + page.items.length >= page.total || loading} onClick={() => setOffset(value => value + 24)}>{t('brief.next')}</Button></Stack>}
  </Layout>;
}

function categoryName(category: string, language: string) {
  const labels = language === 'nl' ? ['Groente & fruit', 'Zuivel & eieren', 'Vlees & vis', 'Dranken', 'Bakkerij', 'Snacks', 'Diepvries', 'Voorraadkast', 'Verzorging', 'Huishouden', 'Overig'] : language === 'de' ? ['Obst & Gemüse', 'Milchprodukte & Eier', 'Fleisch & Fisch', 'Getränke', 'Backwaren', 'Snacks', 'Tiefkühlprodukte', 'Vorräte', 'Körperpflege', 'Haushalt', 'Sonstiges'] : CATEGORIES;
  return labels[CATEGORIES.indexOf(category as typeof CATEGORIES[number])] ?? category;
}

export function JournalPage() {
  const { country } = useCountry(), { t, language } = useLanguage();
  const { articleSlug } = useParams();
  const article = journal.find(item => item.slug === articleSlug);
  if (articleSlug && !article) return <NotFoundPage />;
  if (article) {
    const copy = article[language];
    return <Layout title={copy.title} description={copy.intro} path={`journal/${article.slug}`}>
      <Seo title={`${copy.title} | ComPear`} description={copy.intro} path={`/${country.code}/journal/${article.slug}`} country={country.code} structuredData={{ '@context': 'https://schema.org', '@type': 'Article', headline: copy.title, description: copy.intro, inLanguage: language, mainEntityOfPage: sitePath(`/${country.code}/journal/${article.slug}`), author: { '@type': 'Organization', name: 'Compears', url: sitePath('/') } }} />
      <Box component="article" sx={{ maxWidth: 750 }}>{copy.sections.map(([heading, body]) => <Box component="section" key={heading} sx={{ mb: 4 }}><Typography component="h2" variant="h4" sx={{ mb: 1.5 }}>{heading}</Typography><Typography sx={{ lineHeight: 1.9 }}>{body}</Typography></Box>)}</Box>
      <Stack direction="row" flexWrap="wrap" gap={2}><Button component={RouterLink} to={`/${country.code}/brief`} variant="contained">{t('brief.nav')}</Button><Button component={RouterLink} to={`/${country.code}/journal`}>{t('explore.journal')}</Button></Stack>
    </Layout>;
  }
  return <Layout title={t('explore.journal')} description={t('explore.journalHint')} path="journal">
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2,minmax(0,1fr))' }, gap: 3 }}>{journal.map((item, index) => <Card key={item.slug} variant="outlined" sx={{ borderRadius: 4, bgcolor: index ? '#edf1e4' : '#fff', boxShadow: 'none' }}><CardActionArea component={RouterLink} to={`/${country.code}/journal/${item.slug}`} sx={{ p: { xs: 3, md: 4 }, height: '100%' }}><Typography variant="overline" color="primary.main">0{index + 1}</Typography><Typography component="h2" variant="h4" sx={{ my: 2 }}>{item[language].title}</Typography><Typography color="text.secondary" sx={{ mb: 3 }}>{item[language].intro}</Typography><Typography fontWeight={700} color="primary.main">{t('explore.read')} ↗</Typography></CardActionArea></Card>)}</Box>
  </Layout>;
}

export function ShoppingSpacePage() {
  const { country } = useCountry(), { t } = useLanguage();
  return <Layout title={t('explore.space')} description={t('explore.spaceHint')} path="space" noIndex>
    <Alert severity="info" sx={{ mb: 3 }}>{t('explore.spaceNotice')}</Alert>
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3,minmax(0,1fr))' }, gap: 2 }}>{[['basket', 'nav.openBasket', 'explore.basketHint'], ['alerts', 'alerts.nav', 'explore.watchHint'], ['receipts', 'nav.receipts', 'explore.receiptHint']].map(([path, label, hint]) => <Card key={path} variant="outlined" sx={{ borderRadius: 3, boxShadow: 'none' }}><CardActionArea component={RouterLink} to={`/${country.code}/${path}`} sx={{ p: 3, height: '100%' }}><Typography component="h2" variant="h5" sx={{ mb: 2 }}>{t(label)} ↗</Typography><Typography variant="body2" color="text.secondary">{t(hint)}</Typography></CardActionArea></Card>)}</Box>
  </Layout>;
}
