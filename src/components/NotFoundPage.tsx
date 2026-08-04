import React from 'react';
import {
  Container,
  Typography,
  Box,
  AppBar,
  Toolbar,
  Paper,
  Button,
} from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import Footer from './Footer';
import { CountryProvider } from '../context/CountryContext';
import { LanguageProvider, useLanguage } from '../context/LanguageContext';

/**
 * 404 Page Component displayed for invalid country codes / unknown routes.
 * Wrapped with Country + Language providers so Footer works outside CountryLayout.
 */
const NotFoundPageContent: React.FC = () => {
  const { t } = useLanguage();

  const getCurrentPath = (): string => {
    try {
      const pathSegments = window.location.pathname.split('/').filter(Boolean);
      return pathSegments[0] || '';
    } catch {
      return '';
    }
  };

  const navigateToCountry = (countryCode: string) => {
    window.location.href = `/${countryCode}`;
  };

  const invalidCode = getCurrentPath();

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
      }}
    >
      <AppBar position="static" sx={{ mb: 4 }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            {t('app.title')}
          </Typography>
        </Toolbar>
      </AppBar>

      <Container
        maxWidth="md"
        sx={{ flex: '1 0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <Paper elevation={3} sx={{ p: 5, textAlign: 'center', width: '100%' }}>
          <ErrorOutlineIcon sx={{ fontSize: 80, color: 'error.main', mb: 2 }} />
          <Typography variant="h4" gutterBottom>
            {t('404.title')}
          </Typography>
          <Typography variant="body1" paragraph>
            {t('404.notSupported').replace('{code}', invalidCode)}
          </Typography>
          <Typography variant="body1" paragraph sx={{ mb: 4 }}>
            {t('404.supportedCountries')}
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
            <Button variant="contained" color="primary" onClick={() => navigateToCountry('nl')}>
              {t('404.goTo')}
            </Button>
            <Button variant="outlined" onClick={() => navigateToCountry('uk')}>
              {t('404.uk')}
            </Button>
            <Button variant="outlined" onClick={() => navigateToCountry('de')}>
              {t('404.germany')}
            </Button>
          </Box>
        </Paper>
      </Container>

      <Footer />
    </Box>
  );
};

const NotFoundPage: React.FC = () => {
  return (
    <CountryProvider initialCountryCode="nl">
      <LanguageProvider initialLanguage="en">
        <NotFoundPageContent />
      </LanguageProvider>
    </CountryProvider>
  );
};

export default NotFoundPage;
