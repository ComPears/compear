import React, { useMemo, useState } from 'react';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Box,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import ShareIcon from '@mui/icons-material/Share';
import { useBasketStore, BasketItem } from '../store/basketStore';
import AppNavBar from '../components/AppNavBar';
import { ShareListDialog } from '../components/ShareListDialog';
import { useLanguage } from '../context/LanguageContext';

function formatPrice(n: number) {
  return `€${n.toFixed(2)}`;
}

function totalCheapestPerItem(items: BasketItem[]): number {
  return items.reduce((sum, i) => sum + i.product.effectivePrice * i.quantity, 0);
}

function bestSingleStoreTotal(items: BasketItem[]): { total: number; store: string } | null {
  const byStore = new Map<string, number>();
  for (const item of items) {
    const store = item.product.store;
    const current = byStore.get(store) ?? 0;
    byStore.set(store, current + item.product.effectivePrice * item.quantity);
  }
  let best: { total: number; store: string } | null = null;
  byStore.forEach((total, store) => {
    if (best === null || total < best.total) best = { total, store };
  });
  return best;
}

export const BasketPage: React.FC = () => {
  const { items, remove, setQuantity, clear } = useBasketStore();
  const { t } = useLanguage();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [shareOpen, setShareOpen] = useState(false);

  const shareItems = useMemo(
    () =>
      items.map((i) => ({
        productId: i.product.id,
        productName: i.product.productName,
        store: i.product.store,
        quantity: i.quantity,
        effectivePrice: i.product.effectivePrice,
      })),
    [items]
  );

  const cheapestPerItemTotal = useMemo(() => totalCheapestPerItem(items), [items]);
  const singleStore = useMemo(() => bestSingleStoreTotal(items), [items]);
  const singleStoreTotal = singleStore?.total ?? 0;
  const savings = singleStoreTotal > 0 && cheapestPerItemTotal < singleStoreTotal
    ? singleStoreTotal - cheapestPerItemTotal
    : 0;

  if (items.length === 0) {
    return (
      <>
        <AppNavBar />
        <Container maxWidth="md" sx={{ py: 4, bgcolor: 'background.default' }}>
          <Typography variant="h5" gutterBottom fontWeight={600}>
            {t('basket.title')}
          </Typography>
          <Typography color="text.secondary">{t('basket.empty')}</Typography>
        </Container>
      </>
    );
  }

  return (
    <>
      <AppNavBar />
      <Container maxWidth="md" sx={{ py: 3, bgcolor: 'background.default' }}>
        <Typography variant="h5" gutterBottom fontWeight={600}>
          {t('basket.title')}
        </Typography>

        {isMobile ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 3 }}>
            {items.map(({ product, quantity }) => (
              <Card key={product.id} variant="outlined">
                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                  <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
                    {product.productName}
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      {product.store}
                    </Typography>
                    <Typography variant="h6" color="success.main" fontWeight={700}>
                      {formatPrice(product.effectivePrice * quantity)}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <IconButton size="small" onClick={() => setQuantity(product.id, quantity - 1)}>
                        <RemoveIcon fontSize="small" />
                      </IconButton>
                      <Typography sx={{ mx: 1, minWidth: 24, textAlign: 'center' }}>{quantity}</Typography>
                      <IconButton size="small" onClick={() => setQuantity(product.id, quantity + 1)}>
                        <AddIcon fontSize="small" />
                      </IconButton>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="caption" color="text.secondary">
                        {formatPrice(product.effectivePrice)} each
                      </Typography>
                      <IconButton size="small" onClick={() => remove(product.id)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        ) : (
          <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Product</TableCell>
                  <TableCell>Winkel</TableCell>
                  <TableCell align="right">Prijs</TableCell>
                  <TableCell align="center">Aantal</TableCell>
                  <TableCell align="right">Totaal</TableCell>
                  <TableCell />
                </TableRow>
              </TableHead>
              <TableBody>
                {items.map(({ product, quantity }) => (
                  <TableRow key={product.id}>
                    <TableCell>{product.productName}</TableCell>
                    <TableCell>{product.store}</TableCell>
                    <TableCell align="right">{formatPrice(product.effectivePrice)}</TableCell>
                    <TableCell align="center">
                      <IconButton size="small" onClick={() => setQuantity(product.id, quantity - 1)}>
                        <RemoveIcon fontSize="small" />
                      </IconButton>
                      {quantity}
                      <IconButton size="small" onClick={() => setQuantity(product.id, quantity + 1)}>
                        <AddIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                    <TableCell align="right">
                      {formatPrice(product.effectivePrice * quantity)}
                    </TableCell>
                    <TableCell>
                      <IconButton size="small" onClick={() => remove(product.id)}>
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        <Card variant="outlined">
          <CardContent>
            <Typography variant="subtitle2" gutterBottom>
              Optie 1: Per product bij de goedkoopste winkel
            </Typography>
            <Typography variant="h6">{formatPrice(cheapestPerItemTotal)}</Typography>
            <Typography variant="subtitle2" sx={{ mt: 2 }} gutterBottom>
              Optie 2: Alles bij één winkel {singleStore ? `(${singleStore.store})` : ''}
            </Typography>
            <Typography variant="h6">{formatPrice(singleStoreTotal)}</Typography>
            {savings > 0 && (
              <Typography color="primary" sx={{ mt: 2 }} fontWeight="bold">
                Je bespaart {formatPrice(savings)} door te splitsen.
              </Typography>
            )}
          </CardContent>
        </Card>
        <Button
          variant="outlined"
          color="error"
          onClick={() => {
            if (window.confirm(t('basket.clearConfirm'))) clear();
          }}
          sx={{ mt: 2, mr: 1 }}
        >
          {t('basket.clear')}
        </Button>
        <Button
          variant="contained"
          startIcon={<ShareIcon />}
          onClick={() => setShareOpen(true)}
          sx={{ mt: 2 }}
        >
          {t('shared.createLink')}
        </Button>
        <ShareListDialog
          open={shareOpen}
          onClose={() => setShareOpen(false)}
          listName={t('basket.shareDefaultName')}
          items={shareItems}
        />
      </Container>
    </>
  );
};
