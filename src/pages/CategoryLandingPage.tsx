import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Breadcrumbs, CircularProgress, Container, Link, Typography } from '@mui/material';
import { Link as RouterLink, useParams } from 'react-router-dom';
import { fetchProducts, Product } from '../api/client';
import AppNavBar from '../components/AppNavBar';
import Footer from '../components/Footer';
import { ProductGroupList } from '../components/ProductGroupList';
import { Seo, sitePath } from '../components/Seo';
import { useCountry } from '../context/CountryContext';
import { useLanguage } from '../context/LanguageContext';
import { categoryFromSlug, categorySlug } from '../services/categoryService';
import { groupProducts } from '../utils/productGrouping';
import { productPath } from '../utils/productSlug';

export const CategoryLandingPage: React.FC = () => {
  const { categorySlug: slug = '' } = useParams<{ categorySlug: string }>();
  const { country } = useCountry();
  const { t } = useLanguage();
  const category = categoryFromSlug(slug);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(Boolean(category));
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!category) return;
    const controller = new AbortController();
    setLoading(true);
    setFailed(false);
    fetchProducts({ category, limit: 200 }, country.code, { signal: controller.signal })
      .then(setProducts)
      .catch((error) => {
        if (error?.name !== 'CanceledError') setFailed(true);
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [category, country.code]);

  const groups = useMemo(() => groupProducts(products), [products]);
  const title = t('category.title').replace('{category}', category ?? slug);
  const description = t('category.description')
    .replace('{category}', category ?? slug)
    .replace('{country}', country.name);
  const path = `/${country.code}/categories/${category ? categorySlug(category) : slug}`;
  const schema = category ? [
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'ComPear', item: sitePath(`/${country.code}`) },
        { '@type': 'ListItem', position: 2, name: category },
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: title,
      numberOfItems: groups.length,
      itemListElement: groups.slice(0, 50).map((group, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: group.displayName,
        url: sitePath(productPath(country.code, group.cheapest)),
      })),
    },
  ] : undefined;

  return (
    <>
      <Seo title={`${title} | ComPear`} description={description} path={path} country={country.code} noIndex={!category} structuredData={schema} />
      <AppNavBar />
      <Container component="main" maxWidth="lg" sx={{ py: { xs: 2, sm: 3 }, minHeight: '65vh' }}>
        <Breadcrumbs sx={{ mb: 2 }}>
          <Link component={RouterLink} to={`/${country.code}`} color="inherit">{t('nav.home')}</Link>
          <Typography color="text.primary">{category ?? slug}</Typography>
        </Breadcrumbs>
        <Typography component="h1" variant="h3" color="primary.dark" fontWeight={750} sx={{ fontSize: { xs: '2rem', sm: '2.7rem' } }}>
          {title}
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 1, mb: 3, maxWidth: 700 }}>{description}</Typography>
        {loading ? <CircularProgress aria-label={t('category.loading')} /> : failed ? (
          <Alert severity="error">{t('error.loadProducts')}</Alert>
        ) : !category || groups.length === 0 ? (
          <Alert severity="info">{t('category.empty')}</Alert>
        ) : (
          <ProductGroupList groups={groups} />
        )}
      </Container>
      <Footer />
    </>
  );
};
