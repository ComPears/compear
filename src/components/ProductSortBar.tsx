import React from 'react';
import { Box, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import { SortMode } from '../utils/productGrouping';

interface ProductSortBarProps {
  value: SortMode;
  onChange: (value: SortMode) => void;
  showDiscount?: boolean;
}

const SORT_LABELS: Record<SortMode, string> = {
  relevance: 'Relevantie',
  price: 'Prijs',
  unitPrice: 'Prijs/kg',
  discount: 'Korting',
};

export const ProductSortBar: React.FC<ProductSortBarProps> = ({
  value,
  onChange,
  showDiscount = false,
}) => {
  const modes: SortMode[] = showDiscount
    ? ['relevance', 'price', 'unitPrice', 'discount']
    : ['relevance', 'price', 'unitPrice'];

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
      <Typography variant="body2" color="text.secondary">
        Sorteer:
      </Typography>
      <ToggleButtonGroup
        size="small"
        exclusive
        value={value}
        onChange={(_e, next: SortMode | null) => {
          if (next) onChange(next);
        }}
      >
        {modes.map((mode) => (
          <ToggleButton key={mode} value={mode}>
            {SORT_LABELS[mode]}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
    </Box>
  );
};
