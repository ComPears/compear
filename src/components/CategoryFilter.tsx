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
  const categoriesToShow = availableCategories && availableCategories.length > 0
    ? availableCategories
    : CATEGORIES;

  const handleCategoryClick = (category: ProductCategory | 'All') => {
    onCategoryChange(category);
  };

  if (variant === 'dropdown') {
    return (
      <FormControl fullWidth sx={{ mb: 2, minWidth: 200 }}>
        <InputLabel id="category-filter-label">Category</InputLabel>
        <Select
          labelId="category-filter-label"
          id="category-filter"
          value={selectedCategory}
          label="Category"
          onChange={(e: SelectChangeEvent) => 
            onCategoryChange(e.target.value as ProductCategory | 'All')
          }
        >
          <MenuItem value="All">All Categories</MenuItem>
          {categoriesToShow.map((category) => (
            <MenuItem key={category} value={category}>
              {getCategoryIcon(category)} {category}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    );
  }

  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'medium' }}>
        Filter by Category:
      </Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        <Chip
          label="All"
          onClick={() => handleCategoryClick('All')}
          color={selectedCategory === 'All' ? 'primary' : 'default'}
          variant={selectedCategory === 'All' ? 'filled' : 'outlined'}
          sx={{ cursor: 'pointer' }}
        />
        {categoriesToShow.map((category) => (
          <Chip
            key={category}
            label={`${getCategoryIcon(category)} ${category}`}
            onClick={() => handleCategoryClick(category)}
            color={selectedCategory === category ? 'primary' : 'default'}
            variant={selectedCategory === category ? 'filled' : 'outlined'}
            sx={{ cursor: 'pointer' }}
          />
        ))}
      </Box>
    </Box>
  );
};

export default CategoryFilter;


