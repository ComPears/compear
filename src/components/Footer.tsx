import React from 'react';
import { Box, Typography, Container, Link, Stack } from '@mui/material';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useCountry, CountryCode, countries } from '../context/CountryContext';

const Footer: React.FC = () => {
  const { t } = useLanguage();
  const { country } = useCountry();
  const location = useLocation();

  const pathForCountry = (code: CountryCode) => {
    const rest = location.pathname.replace(/^\/[a-z]{2}(?=\/|$)/, '') || '';
    return `/${code}${rest}${location.search}`;
  };

  const linkSx = {
    color: 'inherit',
    fontWeight: 700,
    textUnderlineOffset: 3,
    px: 0.25,
    py: 0.25,
    borderRadius: 0.5,
    '&:hover': { textDecoration: 'underline' },
  } as const;

  const countryLinkSx = (code: CountryCode) => ({
    ...linkSx,
    fontWeight: country.code === code ? 800 : 700,
    color: country.code === code ? 'text.primary' : 'inherit',
    textDecoration: country.code === code ? 'underline' : 'none',
  });

  const liveCountries = countries.filter((c) => c.available);

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
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={{ xs: 1.25, sm: 0 }}
          alignItems="center"
          justifyContent="center"
          flexWrap="wrap"
          useFlexGap
          sx={{
            columnGap: { sm: 1.5 },
            rowGap: 1,
            mb: 1,
            color: 'text.secondary',
          }}
        >
          <Stack direction="row" spacing={1.25} alignItems="center" flexWrap="wrap" useFlexGap justifyContent="center">
            <Link
              component={RouterLink}
              to={`/${country.code}/how-it-works`}
              underline="hover"
              variant="body2"
              sx={linkSx}
            >
              {t('footer.methodology')}
            </Link>
            <Box component="span" aria-hidden sx={{ opacity: 0.45 }}>
              ·
            </Box>
            <Link
              component={RouterLink}
              to={`/${country.code}/privacy`}
              underline="hover"
              variant="body2"
              sx={linkSx}
            >
              {t('footer.privacy')}
            </Link>
          </Stack>

          <Box
            component="span"
            aria-hidden
            sx={{ display: { xs: 'none', sm: 'inline' }, opacity: 0.45, mx: 0.25 }}
          >
            ·
          </Box>

          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            flexWrap="wrap"
            useFlexGap
            justifyContent="center"
            component="nav"
            aria-label={t('footer.liveIn')}
          >
            <Typography variant="body2" color="text.secondary" component="span">
              {t('footer.liveIn')}
            </Typography>
            {liveCountries.map((c, index) => (
              <React.Fragment key={c.code}>
                {index > 0 && (
                  <Box component="span" aria-hidden sx={{ opacity: 0.45 }}>
                    ·
                  </Box>
                )}
                <Link
                  component={RouterLink}
                  to={pathForCountry(c.code)}
                  underline="hover"
                  variant="body2"
                  aria-current={country.code === c.code ? 'page' : undefined}
                  sx={countryLinkSx(c.code)}
                >
                  {t(`footer.${c.code}`)}
                </Link>
              </React.Fragment>
            ))}
          </Stack>
        </Stack>

        <Typography variant="body2" color="text.secondary" align="center">
          {t('footer.madeWith')}
        </Typography>
      </Container>
    </Box>
  );
};

export default Footer;
