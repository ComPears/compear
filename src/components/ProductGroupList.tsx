import React, { useState } from 'react';
import {
  Box,
  Typography,
  Chip,
  Button,
  Collapse,
  IconButton,
  Avatar,
  Paper,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { Product } from '../api/client';
import { ProductGroup } from '../utils/productGrouping';
import { toSupermarketShortName } from '../utils/productMapper';
import { getSupermarketLogo } from '../services/supermarketService';
import { useCountry } from '../context/CountryContext';
import { useBasketStore } from '../store/basketStore';
import { useLanguage } from '../context/LanguageContext';
import { formatMoney } from '../utils/formatMoney';
import { productPath } from '../utils/productSlug';

interface ProductGroupListProps {
  groups: ProductGroup[];
  showDeals?: boolean;
  emptyMessage?: string;
  onAddProduct?: (product: Product) => void;
  addButtonLabel?: string;
}

function StorePriceChip({
  product,
  isCheapest,
  showSize,
  onClick,
}: {
  product: Product;
  isCheapest: boolean;
  showSize?: boolean;
  onClick: () => void;
}) {
  const { t } = useLanguage();
  const { country } = useCountry();
  const short = toSupermarketShortName(product.store);
  const logo = getSupermarketLogo(short);
  const onSale = product.promoType != null && product.effectivePrice < product.originalPrice;
  return (
    <Chip
      size="small"
      variant={isCheapest ? 'filled' : 'outlined'}
      color={isCheapest ? 'primary' : 'default'}
      onClick={onClick}
      avatar={
        logo ? (
          <Avatar
            src={logo}
            alt=""
            sx={{ width: 20, height: 20, bgcolor: 'common.white' }}
            imgProps={{ loading: 'lazy' }}
          />
        ) : undefined
      }
      aria-label={t('search.openProduct').replace('{product}', product.productName)}
      label={
        <Box component="span" sx={{ display: 'inline-flex', gap: 0.5, alignItems: 'baseline', flexWrap: 'wrap' }}>
          <strong>{short}</strong>
          {showSize && product.packageSize && (
            <Box component="span" sx={{ opacity: 0.85, fontWeight: 500 }}>
              {product.packageSize}
            </Box>
          )}
          <Box component="span" sx={{ fontWeight: 700 }}>
            {formatMoney(product.effectivePrice, country.code)}
          </Box>
          {isCheapest && (
            <Box component="span" sx={{ fontSize: '0.72rem', opacity: 0.86 }}>
              · {t('label.cheapest')}
            </Box>
          )}
          {onSale && (
            <Box component="span" sx={{ opacity: 0.7, textDecoration: 'line-through', ml: 0.25 }}>
              {formatMoney(product.originalPrice, country.code)}
            </Box>
          )}
        </Box>
      }
      sx={{
        height: 'auto',
        py: 0.65,
        px: 0.25,
        borderWidth: isCheapest ? 0 : 1.5,
        '& .MuiChip-label': { whiteSpace: 'normal', pl: logo ? 0.5 : 1 },
        '& .MuiChip-avatar': { ml: 0.75, mr: -0.25 },
      }}
    />
  );
}

function CompactProductRow({
  product,
  showDeal,
  onOpen,
  onAdd,
}: {
  product: Product;
  showDeal?: boolean;
  onOpen: () => void;
  onAdd: () => void;
}) {
  const { t } = useLanguage();
  const { country } = useCountry();
  const onSale = product.promoType != null && product.effectivePrice < product.originalPrice;
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: { xs: 'stretch', sm: 'center' },
        flexDirection: { xs: 'column', sm: 'row' },
        gap: 1,
        py: 0.75,
        px: 1,
        borderRadius: 1,
        '&:hover': { bgcolor: 'action.hover' },
      }}
    >
      <Box
        component={RouterLink}
        to={productPath(country.code, product)}
        aria-label={t('search.openProduct').replace('{product}', product.productName)}
        sx={{
          flex: 1,
          minWidth: 0,
          cursor: 'pointer',
          border: 0,
          textDecoration: 'none',
          p: 0,
          bgcolor: 'transparent',
          color: 'inherit',
          textAlign: 'left',
          '&:focus-visible': { outline: '2px solid', outlineColor: 'primary.main', outlineOffset: 2 },
        }}
        onClick={onOpen}
      >
        <Typography variant="body2" noWrap>
          {toSupermarketShortName(product.store)} · {product.productName}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {product.packageSize} · {formatMoney(product.effectiveUnitPrice, country.code)}/kg
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.75, flexShrink: 0 }}>
        {showDeal && onSale && (
          <Chip size="small" color="secondary" label={product.promoType ?? 'Deal'} />
        )}
        {onSale && (
          <Typography variant="caption" sx={{ textDecoration: 'line-through', color: 'text.secondary' }}>
            {formatMoney(product.originalPrice, country.code)}
          </Typography>
        )}
        <Typography variant="body2" fontWeight={700} color="primary.main">
          {formatMoney(product.effectivePrice, country.code)}
        </Typography>
        <Button
          size="small"
          variant="outlined"
          onClick={onAdd}
          aria-label={t('search.addProduct').replace('{product}', product.productName)}
          sx={{ minWidth: 44, minHeight: 44 }}
        >
          {t('search.addButton')}
        </Button>
      </Box>
    </Box>
  );
}

const ProductGroupListComponent: React.FC<ProductGroupListProps> = ({
  groups,
  showDeals = false,
  emptyMessage,
  onAddProduct,
  addButtonLabel,
}) => {
  const navigate = useNavigate();
  const { country } = useCountry();
  const addToBasket = useBasketStore((s) => s.add);
  const { t } = useLanguage();
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const handleAdd = (product: Product) => {
    if (onAddProduct) {
      onAddProduct(product);
      return;
    }
    addToBasket(product);
  };

  if (groups.length === 0) {
    return (
      <Typography color="text.secondary" sx={{ py: 2 }}>
        {emptyMessage ?? t('search.noResults')}
      </Typography>
    );
  }

  return (
    <Box className="cp-fade-up" sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' }, gap: 1.5 }}>
      {groups.map((group) => {
        const isOpen = expanded[group.key] ?? false;
        const offers = group.storeOffers;
        const hasMultipleStores = offers.length > 1;
        const hasMultipleSizes =
          new Set(group.products.map((p) => p.packageSize.trim())).size > 1;
        const hasExpandableDetails = group.products.length > offers.length;
        const showExpand = hasMultipleStores && (hasExpandableDetails || hasMultipleSizes);
        const cheapestId = group.cheapest.id;
        const showSizeOnChips = hasMultipleSizes;
        const nextOffer = offers[1];
        const spread =
          hasMultipleStores && nextOffer
            ? nextOffer.effectivePrice - group.cheapest.effectivePrice
            : 0;

        return (
          <Paper
            key={group.key}
            variant="outlined"
            sx={{
              overflow: 'hidden',
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2,
              p: { xs: 1.5, sm: 2 },
              bgcolor: 'background.paper',
              boxShadow: '0 10px 30px rgba(20, 35, 28, 0.05)',
              transition: 'transform 160ms ease, box-shadow 160ms ease',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 14px 36px rgba(20, 35, 28, 0.09)',
              },
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'flex-start', flexDirection: { xs: 'column', sm: 'row' }, gap: 1 }}>
              <Box
                component={RouterLink}
                to={productPath(country.code, group.cheapest)}
                aria-label={t('search.openProduct').replace('{product}', group.displayName)}
                sx={{
                  flex: 1,
                  minWidth: 0,
                  cursor: 'pointer',
                  border: 0,
                  p: 0,
                  bgcolor: 'transparent',
                  color: 'inherit',
                  textDecoration: 'none',
                  textAlign: 'left',
                  '&:focus-visible': { outline: '2px solid', outlineColor: 'primary.main', outlineOffset: 2 },
                }}
              >
                <Typography variant="subtitle1" fontWeight={700} sx={{ lineHeight: 1.3 }}>
                  {group.displayName}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
                  {group.packageSize && `${group.packageSize} · `}
                  {t('search.fromPrice').replace('{price}', formatMoney(group.cheapest.effectivePrice, country.code))}
                  {hasMultipleStores
                    ? ` · ${t('search.storeCount').replace('{count}', String(offers.length))}`
                    : ` · ${toSupermarketShortName(group.cheapest.store)}`}
                </Typography>
                {spread > 0.01 && (
                  <Typography variant="caption" color="secondary.main" fontWeight={700} sx={{ display: 'block', mt: 0.35 }}>
                    {t('search.saveVsNext')
                      .replace('{amount}', formatMoney(spread, country.code))
                      .replace('{store}', toSupermarketShortName(group.cheapest.store))}
                  </Typography>
                )}
                {!hasMultipleStores && (
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.35 }}>
                    {t('search.compareAfterAdd')}
                  </Typography>
                )}
              </Box>
              <Box sx={{ display: 'flex', width: { xs: '100%', sm: 'auto' }, gap: 0.5 }}>
                <Button
                  size="small"
                  variant="contained"
                  startIcon={<CompareArrowsIcon />}
                  onClick={() => handleAdd(group.cheapest)}
                  aria-label={t('search.compareProduct').replace('{product}', group.displayName)}
                  sx={{ minHeight: 44, flex: { xs: 1, sm: 'initial' }, flexShrink: 0 }}
                >
                  {addButtonLabel ?? t('search.addButton')}
                </Button>
                {showExpand && (
                  <IconButton
                    size="small"
                    aria-label={t(isOpen ? 'search.collapseGroup' : 'search.expandGroup').replace('{product}', group.displayName)}
                    aria-expanded={isOpen}
                    aria-controls={`product-group-${group.key}`}
                    onClick={() =>
                      setExpanded((prev) => ({ ...prev, [group.key]: !isOpen }))
                    }
                    sx={{ minWidth: 44, minHeight: 44 }}
                  >
                    {isOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  </IconButton>
                )}
              </Box>
            </Box>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mt: 1.1 }}>
              {offers.map((product, offerIndex) => (
                <StorePriceChip
                  key={`${product.id}-${offerIndex}`}
                  product={product}
                  isCheapest={product.id === cheapestId}
                  showSize={showSizeOnChips}
                  onClick={() => navigate(productPath(country.code, product))}
                />
              ))}
            </Box>

            <Collapse in={isOpen}>
              <Box id={`product-group-${group.key}`} sx={{ mt: 1, bgcolor: 'rgba(11, 110, 79, 0.04)', borderRadius: 1 }}>
                {group.products.map((product, productIndex) => (
                  <CompactProductRow
                    key={`${product.id}-${productIndex}`}
                    product={product}
                    showDeal={showDeals}
                    onOpen={() => undefined}
                    onAdd={() => handleAdd(product)}
                  />
                ))}
              </Box>
            </Collapse>
          </Paper>
        );
      })}
    </Box>
  );
};

export const ProductGroupList = React.memo(ProductGroupListComponent);
