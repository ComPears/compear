import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Chip,
  CircularProgress,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { fetchProduct, fetchCompare, Product } from '../api/client';
import { useCountry } from '../context/CountryContext';
import AppNavBar from '../components/AppNavBar';
import { useBasketStore } from '../store/basketStore';

export const ProductPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { country } = useCountry();
  const navigate = useNavigate();
  const addToBasket = useBasketStore((s) => s.add);
  const [product, setProduct] = useState<Product | null>(null);
  const [compareList, setCompareList] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetchProduct(id)
      .then((p) => {
        setProduct(p);
        return fetchCompare(p.canonicalName);
      })
      .then((list) => setCompareList(list))
      .catch(() => setProduct(null))
      .finally(() => setLoading(false));
  }, [id]);

  const formatPrice = (n: number) => `€${n.toFixed(2)}`;

  if (loading) {
    return (
      <>
        <AppNavBar />
        <Container maxWidth="md" sx={{ py: 4, textAlign: 'center' }}>
          <CircularProgress />
        </Container>
      </>
    );
  }

  if (!product) {
    return (
      <>
        <AppNavBar />
        <Container maxWidth="md" sx={{ py: 4 }}>
          <Typography>Product niet gevonden.</Typography>
          <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(`/${country.code}/search`)}>
            Terug
          </Button>
        </Container>
      </>
    );
  }

  const sortedCompare = [...compareList].sort((a, b) => a.effectivePrice - b.effectivePrice);
  const cheapest = sortedCompare[0];

  return (
    <>
      <AppNavBar />
      <Container maxWidth="md" sx={{ py: 3, bgcolor: 'background.default' }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} sx={{ mb: 2 }} size="small">
          Terug
        </Button>
        <Typography variant="h5" gutterBottom fontWeight={600}>
          {product.productName}
        </Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        {product.store} · {product.packageSize}
        {product.brand && ` · ${product.brand}`}
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        {product.promoType != null && (
          <Chip color="secondary" label="Aanbieding" size="small" />
        )}
        {product.originalPrice > product.effectivePrice ? (
          <>
            <Typography sx={{ textDecoration: 'line-through' }}>
              {formatPrice(product.originalPrice)}
            </Typography>
            <Typography variant="h6" color="primary">
              {formatPrice(product.effectivePrice)}
            </Typography>
          </>
        ) : (
          <Typography variant="h6">{formatPrice(product.effectivePrice)}</Typography>
        )}
        <Typography variant="body2" color="text.secondary">
          {formatPrice(product.effectiveUnitPrice)}/kg
        </Typography>
      </Box>

      <Typography variant="subtitle2" gutterBottom>
        Vergelijk prijzen per winkel
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {sortedCompare.map((p) => (
          <Card key={p.id} variant="outlined">
            <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography>{p.store}</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {p.id === cheapest?.id && (
                  <Chip size="small" color="primary" label="Goedkoopste" />
                )}
                {p.originalPrice > p.effectivePrice ? (
                  <>
                    <Typography sx={{ textDecoration: 'line-through', fontSize: 'small' }}>
                      {formatPrice(p.originalPrice)}
                    </Typography>
                    <Typography fontWeight="bold">{formatPrice(p.effectivePrice)}</Typography>
                  </>
                ) : (
                  <Typography fontWeight="bold">{formatPrice(p.effectivePrice)}</Typography>
                )}
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>
        <Button variant="contained" onClick={() => addToBasket(product)} sx={{ mt: 2 }}>
          In mandje
        </Button>
      </Container>
    </>
  );
};
