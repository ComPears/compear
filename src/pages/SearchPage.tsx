import React, { useState, useEffect } from 'react';
import {
  Container,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  Card,
  CardContent,
  CardActionArea,
  Chip,
  FormControlLabel,
  Checkbox,
  CircularProgress,
  Button,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useNavigate } from 'react-router-dom';
import { fetchProducts, fetchStores, Product, StoreInfo } from '../api/client';
import { useCountry } from '../context/CountryContext';
import { PagesNavBar } from '../components/PagesNavBar';
import { useBasketStore } from '../store/basketStore';

export const SearchPage: React.FC = () => {
  const { country } = useCountry();
  const navigate = useNavigate();
  const addToBasket = useBasketStore((s) => s.add);
  const [query, setQuery] = useState('');
  const [storeFilter, setStoreFilter] = useState<string>('');
  const [dealsOnly, setDealsOnly] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [stores, setStores] = useState<StoreInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchStores().then((data) => {
      if (!cancelled) setStores(data);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!country.available) return;
    setLoading(true);
    setSearched(true);
    const params: { search?: string; store?: string } = {};
    if (query.trim()) params.search = query.trim();
    if (storeFilter) params.store = storeFilter;
    fetchProducts(params)
      .then((data) => {
        let list = data;
        if (dealsOnly) list = list.filter((p) => p.promoType != null && p.effectivePrice < p.originalPrice);
        setProducts(list);
      })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [query, storeFilter, dealsOnly, country.available]);

  const formatPrice = (n: number) => `€${n.toFixed(2)}`;
  const isCheapest = (p: Product) => {
    const sameName = products.filter(
      (x) => x.canonicalName === p.canonicalName || x.productName === p.productName
    );
    if (sameName.length <= 1) return true;
    return p.effectivePrice <= Math.min(...sameName.map((x) => x.effectivePrice));
  };

  return (
    <>
      <PagesNavBar />
      <Container maxWidth="lg" sx={{ py: 3, bgcolor: 'background.default' }}>
        <Typography variant="h5" gutterBottom fontWeight={600}>
          Zoek producten
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Bijv. eieren, melk..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel>Winkel</InputLabel>
            <Select
              value={storeFilter}
              label="Winkel"
              onChange={(e) => setStoreFilter(e.target.value)}
            >
              <MenuItem value="">Alle</MenuItem>
              {stores.map((s) => (
                <MenuItem key={s.id} value={s.slug}>
                  {s.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControlLabel
            control={
              <Checkbox
                checked={dealsOnly}
                onChange={(e) => setDealsOnly(e.target.checked)}
              />
            }
            label="Alleen aanbiedingen"
          />
        </Box>
      </Box>

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {!loading && searched && products.length === 0 && (
        <Typography color="text.secondary">Geen producten gevonden.</Typography>
      )}

      {!loading && products.length > 0 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {products.slice(0, 100).map((p) => (
            <Card key={p.id} variant="outlined" sx={{ overflow: 'hidden' }}>
              <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                <CardActionArea onClick={() => navigate(`/${country.code}/product/${p.id}`)} sx={{ flex: 1, minWidth: 0 }}>
                  <Box sx={{ p: 1 }}>
                    <Typography variant="subtitle1">{p.productName}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {p.store} · {p.packageSize}
                    </Typography>
                  </Box>
                </CardActionArea>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                  {isCheapest(p) && (
                    <Chip size="small" color="primary" label="Goedkoopste" />
                  )}
                  {p.promoType != null && (
                    <Chip size="small" color="secondary" label="Aanbieding" />
                  )}
                  {p.originalPrice > p.effectivePrice ? (
                    <>
                      <Typography component="span" sx={{ textDecoration: 'line-through', mr: 1 }}>
                        {formatPrice(p.originalPrice)}
                      </Typography>
                      <Typography component="span" fontWeight="bold" color="primary">
                        {formatPrice(p.effectivePrice)}
                      </Typography>
                    </>
                  ) : (
                    <Typography fontWeight="bold">{formatPrice(p.effectivePrice)}</Typography>
                  )}
                  <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                    {formatPrice(p.effectiveUnitPrice)}/kg
                  </Typography>
                  <Button size="small" variant="outlined" onClick={(e) => { e.stopPropagation(); addToBasket(p); }}>
                    In mandje
                  </Button>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}
      </Container>
    </>
  );
};
