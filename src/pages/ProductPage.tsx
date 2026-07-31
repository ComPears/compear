import React, { useEffect, useMemo, useState } from 'react';
import { Link as RouterLink, useParams } from 'react-router-dom';
import {
  Alert,
  Box,
  Breadcrumbs,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Divider,
  Link,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { fetchCompare, fetchProduct, fetchProductBySlug, Product } from '../api/client';
import { useCountry } from '../context/CountryContext';
import { useLanguage } from '../context/LanguageContext';
import AppNavBar from '../components/AppNavBar';
import Footer from '../components/Footer';
import { Seo } from '../components/Seo';
import { useBasketStore } from '../store/basketStore';
import { usePriceTrackingStore } from '../store/priceTrackingStore';
import { formatMoney } from '../utils/formatMoney';
import { productPath, productSlug } from '../utils/productSlug';
import { sanitizeProductLink } from '../utils/safeLink';
import { categorySlug } from '../services/categoryService';

function newestTimestamp(products: Product[]): string | null {
  const values = products
    .map((product) => product.scrapedAt)
    .filter((value): value is string => Boolean(value) && Number.isFinite(Date.parse(value as string)));
  return values.sort((a, b) => Date.parse(b) - Date.parse(a))[0] ?? null;
}

export const ProductPage: React.FC = () => {
  const { id, slug } = useParams<{ id?: string; slug?: string }>();
  const { country } = useCountry();
  const { t, language } = useLanguage();
  const addToBasket = useBasketStore((state) => state.add);
  const tracked = usePriceTrackingStore((state) => state.tracked);
  const recordPrice = usePriceTrackingStore((state) => state.record);
  const setTarget = usePriceTrackingStore((state) => state.setTarget);
  const removeTracking = usePriceTrackingStore((state) => state.remove);
  const [product, setProduct] = useState<Product | null>(null);
  const [offers, setOffers] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [targetInput, setTargetInput] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const request = slug
      ? fetchProductBySlug(slug, country.code).then((result) => result)
      : fetchProduct(id ?? '', country.code).then(async (selected) => ({
          product: selected,
          offers: await fetchCompare(selected.canonicalName, selected.identityKey, country.code),
        }));

    request
      .then((result) => {
        if (cancelled) return;
        setProduct(result.product);
        setOffers(result.offers.length > 0 ? result.offers : [result.product]);
      })
      .catch(() => {
        if (!cancelled) {
          setProduct(null);
          setOffers([]);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [country.code, id, slug]);

  const sortedOffers = useMemo(
    () => [...offers].sort((a, b) => a.effectivePrice - b.effectivePrice),
    [offers]
  );
  const currentSlug = product ? productSlug(product) : slug ?? '';
  const trackingKey = `${country.code}:${currentSlug}`;
  const tracking = tracked.find((item) => item.key === trackingKey);
  const lowPrice = sortedOffers[0]?.effectivePrice ?? product?.effectivePrice ?? 0;
  const highPrice = sortedOffers[sortedOffers.length - 1]?.effectivePrice ?? lowPrice;

  useEffect(() => {
    if (!product || sortedOffers.length === 0) return;
    recordPrice(
      {
        key: trackingKey,
        country: country.code,
        slug: currentSlug,
        productName: product.productName,
      },
      {
        recordedAt: new Date().toISOString(),
        lowPrice,
        highPrice,
        offerCount: sortedOffers.length,
      }
    );
  }, [country.code, currentSlug, highPrice, lowPrice, product, recordPrice, sortedOffers.length, trackingKey]);

  const money = (value: number) => formatMoney(value, country.code);
  const locale = country.code === 'uk' ? 'en-GB' : country.code === 'nl' ? 'nl-NL' : language;
  const updatedAt = newestTimestamp(sortedOffers);

  if (loading) {
    return (
      <>
        <AppNavBar />
        <Container component="main" maxWidth="md" sx={{ py: 7, textAlign: 'center' }}>
          <CircularProgress aria-label={t('product.loading')} />
        </Container>
      </>
    );
  }

  if (!product) {
    return (
      <>
        <Seo
          title={`${t('product.notFound')} | ComPear`}
          description={t('product.notFoundDescription')}
          path={`/${country.code}/products/${slug ?? id ?? 'not-found'}`}
          country={country.code}
          noIndex
        />
        <AppNavBar />
        <Container component="main" maxWidth="md" sx={{ py: 6 }}>
          <Alert severity="warning" sx={{ mb: 2 }}>{t('product.notFound')}</Alert>
          <Button component={RouterLink} to={`/${country.code}/search`} variant="contained">
            {t('product.backToSearch')}
          </Button>
        </Container>
      </>
    );
  }

  const canonicalPath = productPath(country.code, product);
  const description = t('product.seoDescription')
    .replace('{product}', product.productName)
    .replace('{stores}', String(sortedOffers.length))
    .replace('{price}', money(lowPrice));
  const structuredData = [
    {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product.productName,
      description,
      brand: product.brand ? { '@type': 'Brand', name: product.brand } : undefined,
      gtin13: product.barcode && product.barcode.length === 13 ? product.barcode : undefined,
      sku: product.identityKey,
      offers: {
        '@type': 'AggregateOffer',
        lowPrice,
        highPrice,
        offerCount: sortedOffers.length,
        priceCurrency: country.code === 'uk' ? 'GBP' : 'EUR',
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'ComPear', item: `https://compears.shop/${country.code}` },
        { '@type': 'ListItem', position: 2, name: product.category, item: `https://compears.shop/${country.code}/categories/${categorySlug(product.category ?? 'Other')}` },
        { '@type': 'ListItem', position: 3, name: product.productName },
      ],
    },
  ];

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Seo
        title={`${product.productName} Prices | ComPear`}
        description={description}
        path={canonicalPath}
        country={country.code}
        structuredData={structuredData}
      />
      <AppNavBar />
      <Container component="main" maxWidth="md" sx={{ py: { xs: 2, sm: 3 }, flex: 1 }}>
        <Breadcrumbs sx={{ mb: 2 }} aria-label={t('product.breadcrumbs')}>
          <Link component={RouterLink} to={`/${country.code}`} color="inherit">{t('nav.home')}</Link>
          <Link component={RouterLink} to={`/${country.code}/categories/${categorySlug(product.category ?? 'Other')}`} color="inherit">
            {product.category}
          </Link>
          <Typography color="text.primary" noWrap sx={{ maxWidth: { xs: 180, sm: 360 } }}>{product.productName}</Typography>
        </Breadcrumbs>

        <Paper variant="outlined" sx={{ p: { xs: 2, sm: 3 }, mb: 2.5 }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" gap={2}>
            <Box>
              <Typography component="h1" variant="h4" fontWeight={750} color="primary.dark">
                {product.productName}
              </Typography>
              <Typography color="text.secondary" sx={{ mt: 0.5 }}>
                {[product.brand, product.packageSize, product.category].filter(Boolean).join(' · ')}
              </Typography>
            </Box>
            <Box sx={{ minWidth: 160 }}>
              <Typography variant="caption" color="text.secondary">{t('product.bestCurrentPrice')}</Typography>
              <Typography variant="h4" color="primary.main" fontWeight={800}>{money(lowPrice)}</Typography>
              <Typography variant="caption" color="text.secondary">
                {t('product.offerCount').replace('{count}', String(sortedOffers.length))}
              </Typography>
            </Box>
          </Stack>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mt: 2 }}>
            <Button variant="contained" startIcon={<AddShoppingCartIcon />} onClick={() => addToBasket(sortedOffers[0] ?? product)}>
              {t('product.addToList')}
            </Button>
            {tracking?.targetPrice != null ? (
              <Button variant="outlined" color="secondary" onClick={() => removeTracking(trackingKey)}>
                {t('product.removeAlert')}
              </Button>
            ) : (
              <Box sx={{ display: 'flex', gap: 1, flex: 1 }}>
                <TextField
                  size="small"
                  type="number"
                  value={targetInput}
                  onChange={(event) => setTargetInput(event.target.value)}
                  label={t('product.targetPrice')}
                  inputProps={{ min: 0.01, step: 0.01 }}
                  sx={{ maxWidth: 150 }}
                />
                <Button
                  variant="outlined"
                  startIcon={<NotificationsActiveIcon />}
                  disabled={!Number.isFinite(Number(targetInput)) || Number(targetInput) <= 0}
                  onClick={() => setTarget(trackingKey, Number(targetInput))}
                >
                  {t('product.setAlert')}
                </Button>
              </Box>
            )}
          </Stack>
          {tracking?.targetPrice != null && (
            <Alert severity={lowPrice <= tracking.targetPrice ? 'success' : 'info'} sx={{ mt: 2 }}>
              {lowPrice <= tracking.targetPrice
                ? t('product.alertReached').replace('{price}', money(tracking.targetPrice))
                : t('product.alertActive').replace('{price}', money(tracking.targetPrice))}
            </Alert>
          )}
        </Paper>

        <Typography component="h2" variant="h5" fontWeight={700} sx={{ mb: 1.5 }}>
          {t('product.compareHeading')}
        </Typography>
        <Stack spacing={1.25}>
          {sortedOffers.map((offer, index) => {
            const source = sanitizeProductLink(offer.productUrl);
            return (
              <Card key={offer.id} variant="outlined">
                <CardContent sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', gap: 1.5, alignItems: { sm: 'center' } }}>
                  <Box sx={{ minWidth: 0 }}>
                    <Stack direction="row" spacing={0.75} alignItems="center" flexWrap="wrap" useFlexGap>
                      <Typography fontWeight={750}>{offer.store}</Typography>
                      {index === 0 && <Chip size="small" color="primary" label={t('label.cheapest')} />}
                      {offer.promoType != null && <Chip size="small" color="secondary" label={t('product.deal')} />}
                      <Chip size="small" variant="outlined" label={t('product.exactMatch')} />
                    </Stack>
                    <Typography variant="body2" sx={{ mt: 0.5 }}>{offer.productName}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {offer.packageSize}
                      {offer.scrapedAt && ` · ${t('product.checked')} ${new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(new Date(offer.scrapedAt))}`}
                    </Typography>
                  </Box>
                  <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1.5} sx={{ flexShrink: 0 }}>
                    <Box sx={{ textAlign: 'right' }}>
                      {offer.originalPrice > offer.effectivePrice && (
                        <Typography variant="caption" color="text.secondary" sx={{ textDecoration: 'line-through', display: 'block' }}>
                          {money(offer.originalPrice)}
                        </Typography>
                      )}
                      <Typography variant="h6" fontWeight={800}>{money(offer.effectivePrice)}</Typography>
                      <Typography variant="caption" color="text.secondary">{money(offer.effectiveUnitPrice)}/{t('product.unit')}</Typography>
                    </Box>
                    {source && (
                      <Button component="a" href={source} target="_blank" rel="noopener noreferrer nofollow" endIcon={<OpenInNewIcon />}>
                        {t('product.viewSource')}
                      </Button>
                    )}
                  </Stack>
                </CardContent>
              </Card>
            );
          })}
        </Stack>

        <Paper variant="outlined" sx={{ p: 2.5, mt: 2.5 }}>
          <Typography component="h2" variant="h6" fontWeight={700}>{t('product.priceTracking')}</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {t('product.priceTrackingHint')}
          </Typography>
          <Divider sx={{ my: 1.5 }} />
          <Stack spacing={0.75}>
            {(tracking?.history ?? []).slice(-6).reverse().map((snapshot) => (
              <Box key={snapshot.recordedAt} sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
                <Typography variant="body2">{new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(new Date(snapshot.recordedAt))}</Typography>
                <Typography variant="body2" fontWeight={700}>
                  {money(snapshot.lowPrice)} – {money(snapshot.highPrice)} · {snapshot.offerCount} {t('product.offers')}
                </Typography>
              </Box>
            ))}
          </Stack>
        </Paper>

        <Alert severity="info" sx={{ mt: 2.5 }}>
          {t('product.disclaimer')}
          {updatedAt && ` ${t('product.latestCatalogUpdate')} ${new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(updatedAt))}.`}
        </Alert>
      </Container>
      <Footer />
    </Box>
  );
};
