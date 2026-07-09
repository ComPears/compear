import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Badge,
  MenuItem,
  Select,
  FormControl,
  SelectChangeEvent,
  Divider,
  Tooltip,
  Box,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import PlaceIcon from '@mui/icons-material/Place';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import LanguageIcon from '@mui/icons-material/Language';
import TranslateIcon from '@mui/icons-material/Translate';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import { useTheme, useMediaQuery } from '@mui/material';
import { useCountry, CountryCode, countries } from '../context/CountryContext';
import { useLanguage, LanguageCode } from '../context/LanguageContext';
import { useComparisonStore } from '../store/comparisonStore';
import SuggestionDialog from './SuggestionDialog';

interface AppNavBarProps {
  onCartClick?: () => void;
  onClearAll?: () => void;
  onHomeReset?: () => void;
}

export const AppNavBar: React.FC<AppNavBarProps> = ({
  onCartClick,
  onClearAll,
  onHomeReset,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { country, setCountry } = useCountry();
  const { language, setLanguage, t } = useLanguage();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const listCount = useComparisonStore((s) => s.items.length);
  const [suggestionDialogOpen, setSuggestionDialogOpen] = useState(false);

  const base = `/${country.code}`;
  const isHome = location.pathname === base || location.pathname === `${base}/`;
  const isSearch = location.pathname === `${base}/search`;

  const handleLogoClick = () => {
    if (isHome && onHomeReset) {
      onHomeReset();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      navigate(base);
    }
  };

  const handleCountryChange = (event: SelectChangeEvent<string>) => {
    const newCode = event.target.value as CountryCode;
    setCountry(newCode);
    const rest = location.pathname.replace(/^\/[a-z]{2}/, '') || '';
    navigate(`/${newCode}${rest}`);
  };

  const handleLanguageChange = () => {
    const newLanguage: LanguageCode = language === 'en' ? (country.code as LanguageCode) : 'en';
    if (['en', 'nl', 'de'].includes(newLanguage)) {
      setLanguage(newLanguage);
    }
  };

  const handleCartClick = () => {
    if (onCartClick) {
      onCartClick();
    } else if (listCount > 0) {
      navigate(base);
    } else {
      navigate(`${base}/basket`);
    }
  };

  const handleSearchNav = () => {
    if (isSearch) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    navigate(`${base}/search`);
  };

  return (
    <>
      <AppBar position="static" elevation={0} sx={{ mb: { xs: 2, sm: 3 }, bgcolor: 'primary.main' }}>
        <Toolbar sx={{ px: { xs: 1.5, sm: 3 }, py: 1, minHeight: { xs: 56, sm: 64 }, gap: 0.5 }}>
          <Typography
            variant="h6"
            component="button"
            onClick={handleLogoClick}
            aria-label={t('nav.home')}
            sx={{
              flexGrow: 1,
              fontSize: { xs: '1.1rem', sm: '1.35rem' },
              fontWeight: 700,
              letterSpacing: '-0.02em',
              minWidth: 0,
              textAlign: 'left',
              color: 'inherit',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              p: 0,
              '&:hover': { opacity: 0.92 },
            }}
          >
            {t('app.title')}
          </Typography>

          {country.available && (
            <>
              <Button
                color="inherit"
                startIcon={<SearchIcon />}
                onClick={handleSearchNav}
                sx={{
                  minWidth: 'auto',
                  ...(isSearch ? { bgcolor: 'rgba(255,255,255,0.12)' } : {}),
                }}
              >
                {isMobile ? '' : t('nav.search')}
              </Button>
              <Button
                color="inherit"
                startIcon={<LocalOfferIcon />}
                onClick={() => navigate(`${base}/deals`)}
                sx={{ minWidth: 'auto' }}
              >
                {isMobile ? '' : t('nav.deals')}
              </Button>
              <Button
                color="inherit"
                startIcon={<PlaceIcon />}
                onClick={() => navigate(`${base}/stores`)}
                sx={{ minWidth: 'auto', display: { xs: 'none', md: 'inline-flex' } }}
              >
                {t('nav.stores')}
              </Button>
              <Tooltip title={t('nav.stores')}>
                <IconButton
                  color="inherit"
                  onClick={() => navigate(`${base}/stores`)}
                  aria-label={t('nav.stores')}
                  size="small"
                  sx={{ display: { xs: 'inline-flex', md: 'none' } }}
                >
                  <PlaceIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Button
                color="inherit"
                startIcon={<ReceiptLongIcon />}
                onClick={() => navigate(`${base}/receipts`)}
                sx={{ minWidth: 'auto', display: { xs: 'none', sm: 'inline-flex' } }}
              >
                {t('nav.receipts')}
              </Button>
              <Tooltip title={t('nav.receipts')}>
                <IconButton
                  color="inherit"
                  onClick={() => navigate(`${base}/receipts`)}
                  aria-label={t('nav.receipts')}
                  size="small"
                  sx={{ display: { xs: 'inline-flex', sm: 'none' } }}
                >
                  <ReceiptLongIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </>
          )}

          <Box display="flex" alignItems="center" sx={{ gap: { xs: 0.5, sm: 1 } }}>
            <FormControl sx={{ minWidth: { xs: 80, sm: 120 }, mr: { xs: 0.5, sm: 1 } }} size="small">
              <Select
                value={country.code}
                onChange={handleCountryChange}
                displayEmpty
                sx={{
                  color: 'white',
                  '.MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.5)' },
                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'white' },
                  '.MuiSvgIcon-root': { color: 'white' },
                }}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <LanguageIcon sx={{ mr: { xs: 0.5, sm: 1 } }} />
                    {isMobile
                      ? selected.toUpperCase()
                      : countries.find((c) => c.code === selected)?.name || 'Country'}
                  </Box>
                )}
              >
                {countries.map((option) => (
                  <MenuItem key={option.code} value={option.code}>
                    {option.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Tooltip title={language === 'en' ? t('nav.switchToLocal') : t('nav.switchToEnglish')}>
              <IconButton
                color="inherit"
                onClick={handleLanguageChange}
                size={isMobile ? 'small' : 'medium'}
              >
                <TranslateIcon fontSize={isMobile ? 'small' : 'medium'} />
              </IconButton>
            </Tooltip>

            <Tooltip title={t('nav.suggestion')}>
              <IconButton
                color="inherit"
                onClick={() => setSuggestionDialogOpen(true)}
                aria-label={t('nav.suggestion')}
                aria-haspopup="dialog"
              >
                <LightbulbIcon fontSize={isMobile ? 'small' : 'medium'} />
              </IconButton>
            </Tooltip>

            <Divider
              orientation="vertical"
              flexItem
              sx={{
                bgcolor: 'rgba(255, 255, 255, 0.3)',
                display: { xs: 'none', sm: 'block' },
              }}
            />

            {country.available && (
              <>
                <IconButton
                  color="inherit"
                  onClick={handleCartClick}
                  aria-label={
                    listCount > 0 ? t('nav.openCheapest') : t('nav.openBasket')
                  }
                  size={isMobile ? 'small' : 'medium'}
                >
                  <Badge badgeContent={listCount > 0 ? listCount : undefined} color="secondary">
                    <ShoppingCartIcon fontSize={isMobile ? 'small' : 'medium'} />
                  </Badge>
                </IconButton>
                {onClearAll && listCount > 0 && (
                  isMobile ? (
                    <Tooltip title={t('app.clearAll')}>
                      <IconButton color="inherit" onClick={onClearAll} size="small">
                        <DeleteSweepIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  ) : (
                    <Button
                      color="inherit"
                      startIcon={<DeleteSweepIcon />}
                      onClick={onClearAll}
                      sx={{ minWidth: 'auto' }}
                    >
                      {t('app.clearAll')}
                    </Button>
                  )
                )}
              </>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      <SuggestionDialog open={suggestionDialogOpen} onClose={() => setSuggestionDialogOpen(false)} />
    </>
  );
};

export default AppNavBar;
