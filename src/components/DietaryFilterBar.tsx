import React from 'react';
import { Box, Chip, Typography } from '@mui/material';
import { useLanguage } from '../context/LanguageContext';

export const DIETARY_LABEL_OPTIONS = [
  'vegan',
  'vegetarian',
  'gluten-free',
  'lactose-free',
  'organic',
  'sugar-free',
  'nut-free',
  'halal',
] as const;

export type DietaryLabelOption = (typeof DIETARY_LABEL_OPTIONS)[number];

interface DietaryFilterBarProps {
  selected: string[];
  onChange: (labels: string[]) => void;
}

export const DietaryFilterBar: React.FC<DietaryFilterBarProps> = ({ selected, onChange }) => {
  const { t } = useLanguage();

  const toggle = (label: string) => {
    if (selected.includes(label)) {
      onChange(selected.filter((l) => l !== label));
    } else {
      onChange([...selected, label]);
    }
  };

  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.75 }}>
        {t('filters.dietary')}
      </Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
        {DIETARY_LABEL_OPTIONS.map((label) => (
          <Chip
            key={label}
            label={t(`filters.label.${label}`)}
            size="small"
            clickable
            color={selected.includes(label) ? 'primary' : 'default'}
            variant={selected.includes(label) ? 'filled' : 'outlined'}
            onClick={() => toggle(label)}
            aria-pressed={selected.includes(label)}
          />
        ))}
      </Box>
    </Box>
  );
};
