import React from 'react';
import { Box, Chip, Typography } from '@mui/material';

interface FilterChipBarProps {
  chips: string[];
  active: string[];
  onToggle: (chip: string) => void;
}

function formatChipLabel(chip: string): string {
  return chip.charAt(0).toUpperCase() + chip.slice(1);
}

export const FilterChipBar: React.FC<FilterChipBarProps> = ({
  chips,
  active,
  onToggle,
}) => {
  if (chips.length === 0) return null;

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
      <Typography variant="body2" color="text.secondary">
        Verfijn:
      </Typography>
      {chips.map((chip) => {
        const selected = active.includes(chip);
        return (
          <Chip
            key={chip}
            size="small"
            label={formatChipLabel(chip)}
            color={selected ? 'primary' : 'default'}
            variant={selected ? 'filled' : 'outlined'}
            onClick={() => onToggle(chip)}
          />
        );
      })}
    </Box>
  );
};
