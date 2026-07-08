import React, { useState, useCallback, useRef } from 'react';
import {
  TextField,
  Box,
  Typography,
  CircularProgress,
  IconButton,
  InputAdornment,
  Alert,
  Card,
  CardContent,
  Button,
  Chip,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import { Grocery } from '../types';
import { findProductInSupermarkets } from '../services/rawProductData';
import { fetchProducts } from '../api/client';
import { productToSearchResult, SearchResultProduct } from '../utils/productMapper';
import { useLanguage } from '../context/LanguageContext';
import { useCountry } from '../context/CountryContext';
import CategoryFilter from './CategoryFilter';
import { ProductCategory } from '../services/categoryService';

interface ProductSearchProps {
  onAddGrocery: (grocery: Grocery) => void;
}

const ProductSearch: React.FC<ProductSearchProps> = ({ onAddGrocery }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | 'All'>('All');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<SearchResultProduct[]>([]);
  const { t } = useLanguage();
  const { country } = useCountry();
  const abortControllerRef = useRef<AbortController | null>(null);

  const buildSearchQuery = useCallback((): string => {
    const term = searchTerm.trim();
    if (selectedCategory !== 'All' && term) {
      return `${term} ${selectedCategory}`;
    }
    if (selectedCategory !== 'All') {
      return selectedCategory;
    }
    return term;
  }, [searchTerm, selectedCategory]);

  const performSearch = useCallback(async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const query = buildSearchQuery();
    const hasSearch = query.length > 2;

    if (!hasSearch) {
      if (searchTerm.trim().length > 0 && searchTerm.trim().length <= 2) {
        setError(t('error.minCharacters'));
      }
      return;
    }

    setError(null);
    abortControllerRef.current = new AbortController();
    setLoading(true);

    try {
      let flatResults: SearchResultProduct[] = [];

      if (country.code === 'nl') {
        try {
          const products = await fetchProducts({ search: query });
          if (abortControllerRef.current.signal.aborted) return;
          flatResults = products.map(productToSearchResult);
        } catch (backendError) {
          console.warn('Backend search failed, falling back to static data:', backendError);
        }
      }

      if (flatResults.length === 0) {
        const results = await findProductInSupermarkets(query);
        if (abortControllerRef.current.signal.aborted) return;

        Object.entries(results).forEach(([supermarketCode, products]) => {
          const supermarket = supermarketCode.toUpperCase();
          products.forEach((product) => {
            flatResults.push({
              ...product,
              supermarketName: supermarket,
            });
          });
        });
      }

      if (flatResults.length === 0) {
        setError(t('error.noProductsFound').replace('{searchTerm}', query));
        setSearchResults([]);
      } else {
        setSearchResults(flatResults.sort((a, b) => a.p - b.p));
        setError(null);
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
  }, [buildSearchQuery, country.code, searchTerm, t]);

  const handleSearchSubmit = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        performSearch();
      }
    },
    [performSearch]
  );

  const handleAddProduct = useCallback(
    (product: SearchResultProduct) => {
      let unit: 'kg' | 'gram' | 'liter' | 'ml' | 'piece' = 'piece';
      const sizeStr = product.s.toLowerCase();

      if (sizeStr.includes('kg')) {
        unit = 'kg';
      } else if (sizeStr.includes('g')) {
        unit = 'gram';
      } else if (sizeStr.includes('l') && !sizeStr.includes('ml')) {
        unit = 'liter';
      } else if (sizeStr.includes('ml')) {
        unit = 'ml';
      }

      const match = sizeStr.match(/(\d+(?:\.\d+)?)/);
      const quantity = match ? parseFloat(match[1]) : 1;

      const grocery: Grocery = {
        id: `supermarket-${Date.now()}-${Math.random()}`,
        name: product.n,
        unit,
        quantity,
        variant: product.supermarketName,
        searchKeyword: product.n,
      };

      onAddGrocery(grocery);
      setSearchResults([]);
      setSearchTerm('');
    },
    [onAddGrocery]
  );

  return (
    <>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          {t('search.title')}
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontStyle: 'italic' }}>
          Product names are shown in Dutch as they appear in Dutch supermarkets. The interface
          language can be changed using the language switcher.
        </Typography>
        <Typography variant="body2" color="primary" sx={{ mb: 2 }}>
          Prices come from ComPears scraped supermarket data. Search by product name or category.
        </Typography>

        <CategoryFilter
          selectedCategory={selectedCategory}
          onCategoryChange={(category) => {
            setSelectedCategory(category);
            if (category !== 'All') {
              setSearchTerm('');
              setTimeout(() => performSearch(), 100);
            } else {
              setSearchResults([]);
            }
          }}
          variant="chips"
        />

        <TextField
          label={t('search.placeholder')}
          variant="outlined"
          fullWidth
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={handleSearchSubmit}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                {loading ? <CircularProgress color="inherit" size={20} /> : null}
                <IconButton onClick={performSearch} aria-label="search" disabled={loading}>
                  <SearchIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
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

        {searchResults.length > 0 && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'medium', mb: 2 }}>
              Search Results ({searchResults.length} found):
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {searchResults.map((product, index) => (
                <Card key={`${product.n}-${product.supermarketName}-${index}`} variant="outlined">
                  <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'medium', mb: 0.5 }}>
                          {product.n}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
                          <Chip label={product.supermarketName} size="small" variant="outlined" />
                          {product.category && (
                            <Chip label={product.category} size="small" variant="outlined" color="primary" />
                          )}
                          <Typography variant="body2" color="text.secondary">
                            {product.s}
                          </Typography>
                        </Box>
                      </Box>
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                          €{product.p.toFixed(2)}
                        </Typography>
                        <Button
                          variant="contained"
                          size="small"
                          startIcon={<AddShoppingCartIcon />}
                          onClick={() => handleAddProduct(product)}
                        >
                          Add
                        </Button>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>
          </Box>
        )}
      </Box>
    </>
  );
};

export default ProductSearch;
