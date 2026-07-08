import React, { useCallback, useMemo, useRef, useState } from 'react';
import { Box, Typography, CircularProgress, Alert, Chip } from '@mui/material';
import { Grocery } from '../types';
import { fetchProducts, Product } from '../api/client';
import { useLanguage } from '../context/LanguageContext';
import CategoryFilter from './CategoryFilter';
import { ProductCategory, filterByCategory } from '../services/categoryService';
import { ProductSearchBar } from './ProductSearchBar';
import { ProductSortBar } from './ProductSortBar';
import { FilterChipBar } from './FilterChipBar';
import { ProductGroupList } from './ProductGroupList';
import {
  SortMode,
  buildSuggestions,
  groupProducts,
  sortGroups,
} from '../utils/productGrouping';
import { extractFilterChips, filterByChip } from '../utils/filterChips';

interface ProductSearchProps {
  onAddGrocery: (grocery: Grocery) => void;
}

function productToGrocery(product: Product): Grocery {
  let unit: Grocery['unit'] = 'piece';
  const sizeStr = product.packageSize.toLowerCase();

  if (sizeStr.includes('kg')) unit = 'kg';
  else if (sizeStr.includes('g')) unit = 'gram';
  else if (sizeStr.includes('l') && !sizeStr.includes('ml')) unit = 'liter';
  else if (sizeStr.includes('ml')) unit = 'ml';

  const match = sizeStr.match(/(\d+(?:\.\d+)?)/);
  const quantity = match ? parseFloat(match[1]) : 1;

  return {
    id: `supermarket-${Date.now()}-${Math.random()}`,
    name: product.productName,
    unit,
    quantity,
    variant: product.store,
    searchKeyword: product.productName,
  };
}

const ProductSearch: React.FC<ProductSearchProps> = ({ onAddGrocery }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | 'All'>('All');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [sort, setSort] = useState<SortMode>('relevance');
  const [activeChips, setActiveChips] = useState<string[]>([]);
  const { t } = useLanguage();
  const abortControllerRef = useRef<AbortController | null>(null);

  const resolveSearchQuery = useCallback((): { search?: string; category?: string } | null => {
    const term = searchTerm.trim();
    if (term.length >= 2) {
      return {
        search: term,
        category: selectedCategory !== 'All' ? selectedCategory : undefined,
      };
    }
    if (selectedCategory !== 'All') {
      return { category: selectedCategory };
    }
    return null;
  }, [searchTerm, selectedCategory]);

  const performSearch = useCallback(async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const query = resolveSearchQuery();
    if (!query) {
      if (searchTerm.trim().length > 0 && searchTerm.trim().length <= 2) {
        setError(t('error.minCharacters'));
      }
      return;
    }

    setError(null);
    abortControllerRef.current = new AbortController();
    setLoading(true);
    setActiveChips([]);

    try {
      const fetched = await fetchProducts(query);
      if (abortControllerRef.current.signal.aborted) return;

      let list = fetched;
      if (selectedCategory !== 'All' && query.search) {
        list = filterByCategory(list, selectedCategory);
      }

      setProducts(list);
      setError(
        list.length === 0
          ? t('error.noProductsFound').replace(
              '{searchTerm}',
              searchTerm.trim() || selectedCategory
            )
          : null
      );
    } catch (searchError) {
      if (abortControllerRef.current?.signal.aborted) return;
      console.error('Error searching for products:', searchError);
      setProducts([]);
      setError(t('error.searchFailed'));
    } finally {
      if (!abortControllerRef.current?.signal.aborted) {
        setLoading(false);
      }
    }
  }, [resolveSearchQuery, searchTerm, selectedCategory, t]);

  const filteredProducts = useMemo(() => {
    let list = products;
    for (const chip of activeChips) {
      list = filterByChip(list, chip);
    }
    return list;
  }, [products, activeChips]);

  const groups = useMemo(
    () => sortGroups(groupProducts(filteredProducts), sort, searchTerm),
    [filteredProducts, sort, searchTerm]
  );

  const filterChips = useMemo(() => extractFilterChips(products), [products]);
  const suggestions = useMemo(() => buildSuggestions(products, 8), [products]);

  const handleAddProduct = useCallback(
    (product: Product) => {
      onAddGrocery(productToGrocery(product));
      setProducts([]);
      setSearchTerm('');
      setActiveChips([]);
    },
    [onAddGrocery]
  );

  const toggleChip = (chip: string) => {
    setActiveChips((prev) =>
      prev.includes(chip) ? prev.filter((c) => c !== chip) : [...prev, chip]
    );
  };

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        {t('search.title')}
      </Typography>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontStyle: 'italic' }}>
        Product names are shown in Dutch as they appear in Dutch supermarkets. The interface
        language can be changed using the language switcher.
      </Typography>
      <Typography variant="body2" color="primary" sx={{ mb: 2 }}>
        Prices come from ComPears scraped supermarket data. Results are grouped by product with store prices side by side.
      </Typography>

      <CategoryFilter
        selectedCategory={selectedCategory}
        onCategoryChange={(category) => {
          setSelectedCategory(category);
          if (category !== 'All') {
            setSearchTerm('');
            setTimeout(() => performSearch(), 100);
          } else {
            setProducts([]);
          }
        }}
        variant="chips"
      />

      <ProductSearchBar
        value={searchTerm}
        onChange={setSearchTerm}
        suggestions={suggestions}
        loading={loading}
        label={t('search.placeholder')}
        placeholder={t('search.placeholder')}
        onSubmit={performSearch}
      />

      {loading && (
        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, gap: 1 }}>
          <CircularProgress size={16} />
          <Typography variant="caption" color="text.secondary">
            {t('search.searching')}
          </Typography>
        </Box>
      )}

      {error && (
        <Alert severity="warning" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}

      {products.length > 0 && (
        <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <ProductSortBar value={sort} onChange={setSort} />
          <FilterChipBar chips={filterChips} active={activeChips} onToggle={toggleChip} />
          <Chip
            size="small"
            variant="outlined"
            label={`${groups.length} productgroepen · ${filteredProducts.length} resultaten`}
          />
          <ProductGroupList
            groups={groups}
            onAddProduct={handleAddProduct}
            addButtonLabel="Toevoegen"
          />
        </Box>
      )}
    </Box>
  );
};

export default ProductSearch;
