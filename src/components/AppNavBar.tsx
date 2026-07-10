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
  Menu,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import PlaceIcon from '@mui/icons-material/Place';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import LanguageIcon from '@mui/icons-material/Language';
import TranslateIcon from '@mui/icons-material/Translate';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { useTheme, useMediaQuery } from '@mui/material';
import { useCountry, CountryCode, countries } from '../context/CountryContext';
import { useLanguage, LanguageCode } from '../context/LanguageContext';
import { useBasketStore } from '../store/basketStore';
import SuggestionDialog from './SuggestionDialog';

interface AppNavBarProps {
  onClearAll?: () => void;
  onHomeReset?: () => void;
}

export const AppNavBar: React.FC<AppNavBarProps> = ({
  onClearAll,
  onHomeReset,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { country, setCountry } = useCountry();
  const { language, setLanguage, t } = useLanguage();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const basketCount = useBasketStore((s) => s.items.length);
  const [suggestionDialogOpen, setSuggestionDialogOpen] = useState(false);
  const [mobileMenuAnchor, setMobileMenuAnchor] = useState<null | HTMLElement>(null);

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
    setMobileMenuAnchor(null);
  };

  const handleLanguageChange = () => {
    const newLanguage: LanguageCode = language === 'en' ? (country.code as LanguageCode) : 'en';
    if (['en', 'nl', 'de'].includes(newLanguage)) {
      setLanguage(newLanguage);
    }
    setMobileMenuAnchor(null);
  };

  const handleCartClick = () => {
    navigate(`${base}/basket`);
  };

  const handleSearchNav = () => {
    if (isSearch) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    navigate(`${base}/search`);
  };

  const navIconButtons = (
    <>
      <Tooltip title={t('nav.search')}>
        <IconButton
          color="inherit"
          onClick={handleSearchNav}
          aria-label={t('nav.search')}
          size="small"
          sx={isSearch ? { bgcolor: 'rgba(255,255,255,0.12)' } : undefined}
        >
          <SearchIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title={t('nav.stores')}>
        <IconButton
          color="inherit"
          onClick={() => navigate(`${base}/stores`)}
          aria-label={t('nav.stores')}
          size="small"
        >
          <PlaceIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title={t('nav.receipts')}>
        <IconButton
          color="inherit"
          onClick={() => navigate(`${base}/receipts`)}
          aria-label={t('nav.receipts')}
          size="small"
        >
          <ReceiptLongIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    </>
  );

  const navTextButtons = (
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
        {t('nav.search')}
      </Button>
      <Button
        color="inherit"
        startIcon={<PlaceIcon />}
        onClick={() => navigate(`${base}/stores`)}
        sx={{ minWidth: 'auto' }}
      >
        {t('nav.stores')}
      </Button>
      <Button
        color="inherit"
        startIcon={<ReceiptLongIcon />}
        onClick={() => navigate(`${base}/receipts`)}
        sx={{ minWidth: 'auto' }}
      >
        {t('nav.receipts')}
      </Button>
    </>
  );

  return (
    <>
      <AppBar position="static" elevation={0} sx={{ mb: { xs: 2, sm: 3 }, bgcolor: 'primary.main' }}>
        <Toolbar
          sx={{
            px: { xs: 1, sm: 3 },
            py: { xs: 0.75, sm: 1 },
            minHeight: { xs: 'auto', sm: 64 },
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: 'stretch',
            gap: { xs: 0.5, md: 1 },
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
              minWidth: 0,
            }}
          >
            <Typography
              variant="h6"
              component="button"
              onClick={handleLogoClick}
              aria-label={t('nav.home')}
              sx={{
                flexShrink: 0,
                fontSize: { xs: '1rem', sm: '1.35rem' },
                fontWeight: 700,
                letterSpacing: '-0.02em',
                color: 'inherit',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                p: 0,
                mr: { xs: 0.5, sm: 1 },
                '&:hover': { opacity: 0.92 },
              }}
            >
              {t('app.title')}
            </Typography>

            {country.available && !isMobile && (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flex: 1,
                  minWidth: 0,
                  gap: 0.5,
                }}
              >
                {navTextButtons}
              </Box>
            )}

            <Box display="flex" alignItems="center" sx={{ gap: { xs: 0.25, sm: 1 }, flexShrink: 0 }}>
              {!isMobile && (
                <>
                  <FormControl sx={{ minWidth: 120 }} size="small">
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
                          <LanguageIcon sx={{ mr: 1 }} />
                          {countries.find((c) => c.code === selected)?.name || 'Country'}
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
                    <IconButton color="inherit" onClick={handleLanguageChange}>
                      <TranslateIcon />
                    </IconButton>
                  </Tooltip>

                  <Tooltip title={t('nav.suggestion')}>
                    <IconButton
                      color="inherit"
                      onClick={() => setSuggestionDialogOpen(true)}
                      aria-label={t('nav.suggestion')}
                      aria-haspopup="dialog"
                    >
                      <LightbulbIcon />
                    </IconButton>
                  </Tooltip>

                  <Divider
                    orientation="vertical"
                    flexItem
                    sx={{ bgcolor: 'rgba(255, 255, 255, 0.3)' }}
                  />
                </>
              )}

              {country.available && (
                <>
                  <IconButton
                    color="inherit"
                    onClick={handleCartClick}
                    aria-label={t('nav.openBasket')}
                    size={isMobile ? 'small' : 'medium'}
                  >
                    <Badge badgeContent={basketCount > 0 ? basketCount : undefined} color="secondary">
                      <ShoppingCartIcon fontSize={isMobile ? 'small' : 'medium'} />
                    </Badge>
                  </IconButton>

                  {isMobile ? (
                    <>
                      {onClearAll && (
                        <Button
                          color="inherit"
                          startIcon={<DeleteSweepIcon fontSize="small" />}
                          onClick={onClearAll}
                          size="small"
                          sx={{ minWidth: 'auto', px: 0.75, whiteSpace: 'nowrap' }}
                        >
                          {t('app.clearAll')}
                        </Button>
                      )}
                      <IconButton
                        color="inherit"
                        onClick={(e) => setMobileMenuAnchor(e.currentTarget)}
                        aria-label="Menu"
                        size="small"
                      >
                        <MoreVertIcon fontSize="small" />
                      </IconButton>
                    </>
                  ) : (
                    onClearAll && (
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
          </Box>

          {country.available && isMobile && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
                gap: 0.25,
                pb: 0.25,
              }}
            >
              {navIconButtons}
            </Box>
          )}
        </Toolbar>
      </AppBar>

      <Menu
        anchorEl={mobileMenuAnchor}
        open={Boolean(mobileMenuAnchor)}
        onClose={() => setMobileMenuAnchor(null)}
      >
        <Box sx={{ px: 2, py: 1, minWidth: 200 }}>
          <FormControl fullWidth size="small">
            <Select value={country.code} onChange={handleCountryChange}>
              {countries.map((option) => (
                <MenuItem key={option.code} value={option.code}>
                  {option.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
        <MenuItem onClick={handleLanguageChange}>
          <TranslateIcon fontSize="small" sx={{ mr: 1 }} />
          {language === 'en' ? t('nav.switchToLocal') : t('nav.switchToEnglish')}
        </MenuItem>
        <MenuItem
          onClick={() => {
            setMobileMenuAnchor(null);
            setSuggestionDialogOpen(true);
          }}
        >
          <LightbulbIcon fontSize="small" sx={{ mr: 1 }} />
          {t('nav.suggestion')}
        </MenuItem>
      </Menu>

      <SuggestionDialog open={suggestionDialogOpen} onClose={() => setSuggestionDialogOpen(false)} />
    </>
  );
};

export default AppNavBar;
