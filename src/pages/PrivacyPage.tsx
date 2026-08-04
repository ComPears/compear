import React from 'react';
import { Box, Container, Typography } from '@mui/material';
import AppNavBar from '../components/AppNavBar';
import Footer from '../components/Footer';
import { Seo } from '../components/Seo';
import { useCountry } from '../context/CountryContext';
import { useLanguage } from '../context/LanguageContext';

export const PrivacyPage: React.FC = () => {
  const { country } = useCountry();
  const { t } = useLanguage();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Seo
        title={`${t('privacy.title')} | ComPear`}
        description={t('privacy.intro')}
        path={`/${country.code}/privacy`}
        country={country.code}
      />
      <AppNavBar />
      <Container component="main" maxWidth="md" sx={{ flex: '1 0 auto', py: { xs: 3, sm: 5 } }}>
        <Typography component="h1" variant="h3" color="primary.dark" fontWeight={750}>
          {t('privacy.title')}
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mt: 1, mb: 3 }}>
          {t('privacy.intro')}
        </Typography>
        <Typography paragraph>{t('privacy.receipts')}</Typography>
        <Typography paragraph>{t('privacy.basket')}</Typography>
        <Typography paragraph>{t('privacy.ocr')}</Typography>
        <Typography paragraph>{t('privacy.email')}</Typography>
        <Typography paragraph>{t('privacy.retention')}</Typography>
      </Container>
      <Footer />
    </Box>
  );
};
