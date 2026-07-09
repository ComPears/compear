import React, { useMemo } from 'react';
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
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { useBasketStore, BasketItem } from '../store/basketStore';
import AppNavBar from '../components/AppNavBar';

function formatPrice(n: number) {
  return `€${n.toFixed(2)}`;
}

/** Cheapest per item: for each basket line pick the product's effectivePrice (we already have one product per line; if we had multiple offers we'd pick min). */
function totalCheapestPerItem(items: BasketItem[]): number {
  return items.reduce((sum, i) => sum + i.product.effectivePrice * i.quantity, 0);
}

/** Best single store: for each store, sum (for each item: that store's price for that product, or skip if not available). We don't have "same product at multiple stores" in one basket line - each line is one product. So single-store total = pick one store and sum each item's price only if we have that product at that store. Actually our basket items are single products (one store each). So "single store" means: group basket items by store, then total per store = sum of (price * qty) for items at that store. The "best single store" is the store that has all items and minimal total, or the store with minimal total among those that have the most items. */
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
            Winkelmand
          </Typography>
          <Typography color="text.secondary">Je mandje is leeg.</Typography>
        </Container>
      </>
    );
  }

  return (
    <>
      <AppNavBar />
      <Container maxWidth="md" sx={{ py: 3, bgcolor: 'background.default' }}>
        <Typography variant="h5" gutterBottom fontWeight={600}>
          Winkelmand
        </Typography>
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
                  <IconButton
                    size="small"
                    onClick={() => setQuantity(product.id, quantity - 1)}
                  >
                    <RemoveIcon fontSize="small" />
                  </IconButton>
                  {quantity}
                  <IconButton
                    size="small"
                    onClick={() => setQuantity(product.id, quantity + 1)}
                  >
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
      <Button variant="outlined" onClick={clear} sx={{ mt: 2 }}>
        Mandje legen
      </Button>
      </Container>
    </>
  );
}
