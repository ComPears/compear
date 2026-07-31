import React from 'react';
import { Box, Typography, Container, Link } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

const Footer: React.FC = () => {
  const { t } = useLanguage();

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
          {t('footer.liveIn')}{' '}
          <Link component={RouterLink} to="/nl" color="inherit" underline="hover" fontWeight={700}>
            {t('footer.nl')}
          </Link>
          {' · '}
          <Link component={RouterLink} to="/uk" color="inherit" underline="hover" fontWeight={700}>
            {t('footer.uk')}
          </Link>
          {' · '}
          {t('footer.comingSoonLabel')}{' '}
          <Link component={RouterLink} to="/de" color="inherit" underline="hover">
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
