import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, IconButton, Badge } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import HomeIcon from '@mui/icons-material/Home';
import { useCountry } from '../context/CountryContext';
import { useBasketStore } from '../store/basketStore';

export const PagesNavBar: React.FC = () => {
  const navigate = useNavigate();
  const { country } = useCountry();
  const basketCount = useBasketStore((s) => s.items.reduce((n, i) => n + i.quantity, 0));
  const base = `/${country.code}`;

  return (
    <AppBar position="static" elevation={0} sx={{ mb: 2, bgcolor: 'primary.main' }}>
      <Toolbar sx={{ gap: 0.5, minHeight: { xs: 52, sm: 56 } }}>
        <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 700, letterSpacing: '-0.02em' }}>
          ComPear
        </Typography>
        <Button color="inherit" startIcon={<HomeIcon />} onClick={() => navigate(base)}>
          Home
        </Button>
        <Button color="inherit" startIcon={<SearchIcon />} onClick={() => navigate(`${base}/search`)}>
          Zoek
        </Button>
        <Button color="inherit" startIcon={<LocalOfferIcon />} onClick={() => navigate(`${base}/deals`)}>
          Aanbiedingen
        </Button>
        <Button color="inherit" startIcon={<ReceiptLongIcon />} onClick={() => navigate(`${base}/receipts`)}>
          Bonnen
        </Button>
        <IconButton color="inherit" onClick={() => navigate(`${base}/basket`)}>
          <Badge badgeContent={basketCount} color="secondary">
            <ShoppingCartIcon />
          </Badge>
        </IconButton>
      </Toolbar>
    </AppBar>
  );
};
