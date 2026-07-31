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
    <Box
      sx={{
        display: 'flex',
        alignItems: { xs: 'stretch', sm: 'center' },
        flexDirection: { xs: 'column', sm: 'row' },
        gap: 0.75,
        width: { xs: '100%', sm: 'auto' },
      }}
    >
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
        sx={{
          width: { xs: '100%', sm: 'auto' },
          '& .MuiToggleButton-root': {
            flex: { xs: 1, sm: 'initial' },
            px: { xs: 1, sm: 1.5 },
            minHeight: 44,
          },
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
