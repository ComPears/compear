import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  CardActionArea,
  Chip,
  CircularProgress,
  Button,
  Grid,
  Paper,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { fetchDeals, fetchDealsDigest, Product, DealsDigest } from '../api/client';
import { useCountry } from '../context/CountryContext';
import { PagesNavBar } from '../components/PagesNavBar';
import { useBasketStore } from '../store/basketStore';

export const DealsPage: React.FC = () => {
  const { country } = useCountry();
  const navigate = useNavigate();
  const addToBasket = useBasketStore((s) => s.add);
  const [products, setProducts] = useState<Product[]>([]);
  const [digest, setDigest] = useState<DealsDigest | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchDeals(), fetchDealsDigest()])
      .then(([deals, weeklyDigest]) => {
        setProducts(deals);
        setDigest(weeklyDigest);
      })
      .catch(() => {
        setProducts([]);
        setDigest(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const formatPrice = (n: number) => `€${n.toFixed(2)}`;

  return (
    <>
      <PagesNavBar />
      <Container maxWidth="lg" sx={{ py: 3, bgcolor: 'background.default' }}>
        <Typography variant="h5" gutterBottom fontWeight={600}>
          Aanbiedingen
        </Typography>

        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {!loading && digest && (
          <Paper variant="outlined" sx={{ p: 2, mb: 3, bgcolor: 'background.paper' }}>
            <Typography variant="h6" gutterBottom>
              Week {digest.weekLabel} — Deals digest
            </Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Typography variant="body2" color="text.secondary">
                  Total deals
                </Typography>
                <Typography variant="h5">{digest.totalDeals}</Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Typography variant="body2" color="text.secondary">
                  Potential savings
                </Typography>
                <Typography variant="h5" color="primary">
                  {formatPrice(digest.totalPotentialSavings)}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Typography variant="body2" color="text.secondary">
                  Stores with deals
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                  {Object.entries(digest.byStore).map(([store, count]) => (
                    <Chip key={store} size="small" label={`${store}: ${count}`} />
                  ))}
                </Box>
              </Grid>
            </Grid>

            {digest.topSavings.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Top savings this week
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {digest.topSavings.slice(0, 5).map((deal) => (
                    <Box
                      key={deal.id}
                      sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1 }}
                    >
                      <Typography variant="body2">
                        {deal.productName} · {deal.store}
                      </Typography>
                      <Chip size="small" color="success" label={`Save ${formatPrice(deal.savings)}`} />
                    </Box>
                  ))}
                </Box>
              </Box>
            )}
          </Paper>
        )}

        {!loading && products.length === 0 && (
          <Typography color="text.secondary">Geen aanbiedingen gevonden.</Typography>
        )}

        {!loading && products.length > 0 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {products.slice(0, 200).map((p) => (
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
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip size="small" color="secondary" label={p.promoType || 'Aanbieding'} />
                    <Typography sx={{ textDecoration: 'line-through' }}>
                      {formatPrice(p.originalPrice)}
                    </Typography>
                    <Typography fontWeight="bold" color="primary">
                      {formatPrice(p.effectivePrice)}
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
