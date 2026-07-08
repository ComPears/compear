import React, { useCallback, useMemo, useRef, useState } from 'react';
import { Box, Typography, CircularProgress, Alert, Chip } from '@mui/material';
import { Grocery } from '../types';
import { findProductInSupermarkets } from '../services/rawProductData';
import { fetchProducts, Product } from '../api/client';
import { SearchResultProduct } from '../utils/productMapper';
import { useLanguage } from '../context/LanguageContext';
import { useCountry } from '../context/CountryContext';
import CategoryFilter from './CategoryFilter';
import { ProductCategory } from '../services/categoryService';
import { ProductSearchBar } from './ProductSearchBar';
import { ProductSortBar } from './ProductSortBar';
import { FilterChipBar } from './FilterChipBar';
import { ProductGroupList } from './ProductGroupList';
import {
  SortMode,
  buildSuggestions,
  CATEGORY_SEARCH_SEEDS,
  extractFilterChips,
  filterByCategory,
  filterByChip,
  groupProducts,
  sortGroups,
} from '../utils/productGrouping';

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
  const [legacyResults, setLegacyResults] = useState<SearchResultProduct[]>([]);
  const [sort, setSort] = useState<SortMode>('relevance');
  const [activeChips, setActiveChips] = useState<string[]>([]);
  const { t } = useLanguage();
  const { country } = useCountry();
  const abortControllerRef = useRef<AbortController | null>(null);

  const resolveSearchQuery = useCallback((): string | null => {
    const term = searchTerm.trim();
    if (term.length >= 2) return term;
    if (selectedCategory !== 'All') return CATEGORY_SEARCH_SEEDS[selectedCategory];
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
      if (country.code === 'nl') {
        try {
          const fetched = await fetchProducts({ search: query });
          if (abortControllerRef.current.signal.aborted) return;
          let list = fetched;
          if (selectedCategory !== 'All') {
            list = filterByCategory(list, selectedCategory);
          }
          setProducts(list);
          setLegacyResults([]);
          setError(
            list.length === 0
              ? t('error.noProductsFound').replace('{searchTerm}', searchTerm.trim() || query)
              : null
          );
        } catch (backendError) {
          console.warn('Backend search failed, falling back to static data:', backendError);
          setProducts([]);
          await loadLegacyResults(query);
        }
      } else {
        setProducts([]);
        await loadLegacyResults(query);
      }
    } catch (searchError) {
      if (abortControllerRef.current?.signal.aborted) return;
      console.error('Error searching for products:', searchError);
      setError(t('error.searchFailed'));
    } finally {
      if (!abortControllerRef.current?.signal.aborted) {
        setLoading(false);
      }
    }

    async function loadLegacyResults(legacyQuery: string) {
      const flatResults: SearchResultProduct[] = [];
      const results = await findProductInSupermarkets(legacyQuery);
      if (abortControllerRef.current?.signal.aborted) return;

      Object.entries(results).forEach(([supermarketCode, legacyProducts]) => {
        const supermarket = supermarketCode.toUpperCase();
        legacyProducts.forEach((product) => {
          flatResults.push({
            ...product,
            supermarketName: supermarket,
          });
        });
      });

      if (flatResults.length === 0) {
        setError(t('error.noProductsFound').replace('{searchTerm}', legacyQuery));
        setLegacyResults([]);
      } else {
        setLegacyResults(flatResults.sort((a, b) => a.p - b.p));
        setError(null);
      }
    }
  }, [resolveSearchQuery, country.code, searchTerm, selectedCategory, t]);

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

  const handleAddLegacy = useCallback(
    (product: SearchResultProduct) => {
      let unit: Grocery['unit'] = 'piece';
      const sizeStr = product.s.toLowerCase();
      if (sizeStr.includes('kg')) unit = 'kg';
      else if (sizeStr.includes('g')) unit = 'gram';
      else if (sizeStr.includes('l') && !sizeStr.includes('ml')) unit = 'liter';
      else if (sizeStr.includes('ml')) unit = 'ml';
      const match = sizeStr.match(/(\d+(?:\.\d+)?)/);
      const quantity = match ? parseFloat(match[1]) : 1;

      onAddGrocery({
        id: `supermarket-${Date.now()}-${Math.random()}`,
        name: product.n,
        unit,
        quantity,
        variant: product.supermarketName,
        searchKeyword: product.n,
      });
      setLegacyResults([]);
      setSearchTerm('');
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
            setLegacyResults([]);
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

      {legacyResults.length > 0 && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 'medium', mb: 2 }}>
            Search Results ({legacyResults.length} found):
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {legacyResults.slice(0, 20).map((product, index) => (
              <Box
                key={`${product.n}-${product.supermarketName}-${index}`}
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  p: 1.5,
                  border: 1,
                  borderColor: 'divider',
                  borderRadius: 1,
                }}
              >
                <Box>
                  <Typography variant="subtitle2">{product.n}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {product.supermarketName} · {product.s}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography fontWeight={700} color="primary.main">
                    €{product.p.toFixed(2)}
                  </Typography>
                  <Chip
                    size="small"
                    color="primary"
                    label="Add"
                    onClick={() => handleAddLegacy(product)}
                  />
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default ProductSearch;
