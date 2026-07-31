import React from 'react';
import { Card, CardContent, Container, Stack, Typography } from '@mui/material';
import AppNavBar from '../components/AppNavBar';
import Footer from '../components/Footer';
import { Seo } from '../components/Seo';
import { useCountry } from '../context/CountryContext';
import { useLanguage } from '../context/LanguageContext';

export const TrustPage: React.FC = () => {
  const { country } = useCountry();
  const { t } = useLanguage();
  const sections = ['matching', 'freshness', 'independence', 'privacy'] as const;
  return (
    <>
      <Seo
        title={`${t('trust.title')} | ComPear`}
        description={t('trust.intro')}
        path={`/${country.code}/how-it-works`}
        country={country.code}
      />
      <AppNavBar />
      <Container component="main" maxWidth="md" sx={{ py: { xs: 3, sm: 5 } }}>
        <Typography component="h1" variant="h3" color="primary.dark" fontWeight={750}>{t('trust.title')}</Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mt: 1, mb: 3 }}>{t('trust.intro')}</Typography>
        <Stack spacing={2}>
          {sections.map((section) => (
            <Card key={section} variant="outlined">
              <CardContent>
                <Typography component="h2" variant="h6" fontWeight={750}>{t(`trust.${section}Title`)}</Typography>
                <Typography color="text.secondary" sx={{ mt: 0.75 }}>{t(`trust.${section}Body`)}</Typography>
              </CardContent>
            </Card>
          ))}
        </Stack>
      </Container>
      <Footer />
    </>
  );
};
