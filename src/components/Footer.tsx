import React from 'react';
import { Box, Typography, Container, Link } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useCountry } from '../context/CountryContext';

const Footer: React.FC = () => {
  const { t } = useLanguage();
  const { country } = useCountry();
  const countryLinkSx = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 44,
    minHeight: 44,
    mx: -0.5,
  };

  return (
    <Box
      component="footer"
      sx={{
        py: 3,
        px: 2,
        mt: 'auto',
        backgroundColor: 'rgba(11, 110, 79, 0.06)',
        borderTop: '1px solid rgba(20, 35, 28, 0.08)',
      }}
    >
      <Container maxWidth="lg">
        <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 0.75 }}>
          <Link component={RouterLink} to={`/${country.code}/how-it-works`} color="inherit" underline="hover" fontWeight={700} sx={countryLinkSx}>
            {t('footer.methodology')}
          </Link>
          {' · '}
          <Link component={RouterLink} to={`/${country.code}/privacy`} color="inherit" underline="hover" fontWeight={700} sx={countryLinkSx}>
            {t('footer.privacy')}
          </Link>
          {' · '}
          {t('footer.liveIn')}{' '}
          <Link component={RouterLink} to="/nl" color="inherit" underline="hover" fontWeight={700} sx={countryLinkSx}>
            {t('footer.nl')}
          </Link>
          {' · '}
          <Link component={RouterLink} to="/uk" color="inherit" underline="hover" fontWeight={700} sx={countryLinkSx}>
            {t('footer.uk')}
          </Link>
          {' · '}
          <Link component={RouterLink} to="/de" color="inherit" underline="hover" fontWeight={700} sx={countryLinkSx}>
            {t('footer.de')}
          </Link>
        </Typography>
        <Typography variant="body2" color="text.secondary" align="center">
          {t('footer.madeWith')}
        </Typography>
      </Container>
    </Box>
  );
};

export default Footer;
