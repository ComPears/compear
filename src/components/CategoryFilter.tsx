import React from 'react';
import {
  Box,
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Typography,
} from '@mui/material';
import { ProductCategory, CATEGORIES, getCategoryIcon } from '../services/categoryService';
import { useLanguage } from '../context/LanguageContext';

interface CategoryFilterProps {
  selectedCategory: ProductCategory | 'All';
  onCategoryChange: (category: ProductCategory | 'All') => void;
  availableCategories?: ProductCategory[];
  variant?: 'chips' | 'dropdown';
}

const CategoryFilter: React.FC<CategoryFilterProps> = ({
  selectedCategory,
  onCategoryChange,
  availableCategories,
  variant = 'chips',
}) => {
  const { t } = useLanguage();
  const categoryLabel = (category: ProductCategory) => t(`filters.category.${category}`);
  const categoriesToShow = availableCategories && availableCategories.length > 0
    ? availableCategories
    : CATEGORIES;

  const handleCategoryClick = (category: ProductCategory | 'All') => {
    onCategoryChange(category);
  };

  if (variant === 'dropdown') {
    return (
      <FormControl fullWidth sx={{ mb: 2, minWidth: 200 }}>
        <InputLabel id="category-filter-label">{t('filters.category')}</InputLabel>
        <Select
          labelId="category-filter-label"
          id="category-filter"
          value={selectedCategory}
          label={t('filters.category')}
          onChange={(e: SelectChangeEvent) => 
            onCategoryChange(e.target.value as ProductCategory | 'All')
          }
        >
          <MenuItem value="All">{t('filters.category.all')}</MenuItem>
          {categoriesToShow.map((category) => (
            <MenuItem key={category} value={category}>
              {getCategoryIcon(category)} {categoryLabel(category)}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    );
  }

  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'medium' }}>
        {t('filters.category')}:
      </Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        <Chip
          label={t('filters.category.all')}
          onClick={() => handleCategoryClick('All')}
          color={selectedCategory === 'All' ? 'primary' : 'default'}
          variant={selectedCategory === 'All' ? 'filled' : 'outlined'}
          sx={{ cursor: 'pointer' }}
          aria-pressed={selectedCategory === 'All'}
        />
        {categoriesToShow.map((category) => (
          <Chip
            key={category}
            label={`${getCategoryIcon(category)} ${categoryLabel(category)}`}
            onClick={() => handleCategoryClick(category)}
            color={selectedCategory === category ? 'primary' : 'default'}
            variant={selectedCategory === category ? 'filled' : 'outlined'}
            sx={{ cursor: 'pointer' }}
            aria-pressed={selectedCategory === category}
          />
        ))}
      </Box>
    </Box>
  );
};

export default CategoryFilter;


