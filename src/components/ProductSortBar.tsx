import React from 'react';
import { Box, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import { SortMode } from '../utils/productGrouping';
import { useLanguage } from '../context/LanguageContext';

interface ProductSortBarProps {
  value: SortMode;
  onChange: (value: SortMode) => void;
  showDiscount?: boolean;
}

export const ProductSortBar: React.FC<ProductSortBarProps> = ({
  value,
  onChange,
  showDiscount = false,
}) => {
  const { t } = useLanguage();
  const modes: SortMode[] = showDiscount
    ? ['relevance', 'price', 'unitPrice', 'discount']
    : ['relevance', 'price', 'unitPrice'];

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
      <Typography variant="body2" color="text.secondary">
        {t('search.sort')}:
      </Typography>
      <ToggleButtonGroup
        size="small"
        exclusive
        value={value}
        aria-label={t('search.sort')}
        onChange={(_e, next: SortMode | null) => {
          if (next) onChange(next);
        }}
      >
        {modes.map((mode) => (
          <ToggleButton key={mode} value={mode}>
            {t(`search.sort.${mode}`)}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
    </Box>
  );
};
