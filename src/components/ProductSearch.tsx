import React, { useState, useCallback, useRef } from 'react';
import {
  TextField,
  Box,
  Typography,
  Button,
  InputAdornment,
  IconButton,
  CircularProgress,
  Alert,
  Collapse
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { Grocery } from '../types';
import { findProductInSupermarkets } from '../services/rawProductData';
import { useLanguage } from '../context/LanguageContext';

interface ProductSearchProps {
  onAddGrocery: (grocery: Grocery) => void;
}

interface SupermarketProduct {
  n: string; // name
  l: string; // link
  p: number; // price
  s: string; // size/quantity
  supermarketName: string;
}

const ProductSearch: React.FC<ProductSearchProps> = ({ onAddGrocery }) => {
  // State declarations
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDebug, setShowDebug] = useState(false);
  const { t } = useLanguage();
  
  // Refs
  const abortControllerRef = useRef<AbortController | null>(null);

  // Dedicated search function
  const performSearch = useCallback(async () => {
    // Cancel any previous search
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    if (searchTerm.trim().length > 2) {
      // Reset previous errors
      setError(null);
      
      // Create a new AbortController
      abortControllerRef.current = new AbortController();
      
      // Search in supermarkets.json data
      setLoading(true);
      console.log(`Searching for: ${searchTerm}`);
      
      try {
        const results = await findProductInSupermarkets(searchTerm);
        
        // Check if the search was aborted
        if (abortControllerRef.current.signal.aborted) return;
        
        console.log('Search results:', results);
        
        const flatResults: SupermarketProduct[] = [];
        
        // Convert the results to a flat array with supermarket names
        Object.entries(results).forEach(([supermarketCode, products]) => {
          console.log(`Processing ${products.length} products from ${supermarketCode}`);
          
          const supermarket = supermarketCode.toUpperCase();
          products.forEach(product => {
            flatResults.push({
              ...product,
              supermarketName: supermarket
            });
          });
        });
        
        // Check if no results were found
        if (flatResults.length === 0) {
          setError(`No products found for "${searchTerm}". Please try a different search term.`);
        } else {
        const cheapestProduct = flatResults.reduce((cheapest, current) => {
          return current.p < cheapest.p ? current : cheapest;
        }, flatResults[0]);

        // Parse size information to determine unit
        let unit: 'kg' | 'gram' | 'liter' | 'ml' | 'piece' = 'piece';
        
        const sizeStr = cheapestProduct.s.toLowerCase();
        if (sizeStr.includes('kg')) {
          unit = 'kg';
        } else if (sizeStr.includes('g')) {
          unit = 'gram';
        } else if (sizeStr.includes('l') && !sizeStr.includes('ml')) {
          unit = 'liter';
        } else if (sizeStr.includes('ml')) {
          unit = 'ml';
        }
        
        // Try to extract numeric quantity
        const match = sizeStr.match(/(\d+(?:\.\d+)?)/);
        let quantity = 1;
        if (match) {
          quantity = parseFloat(match[1]);
        }
        
        const grocery: Grocery = {
          id: `supermarket-${Date.now()}`,
          name: cheapestProduct.n,
          unit: unit,
          quantity: quantity,
          variant: cheapestProduct.supermarketName
        };
        onAddGrocery(grocery);
        }
      } catch (error) {
        // Ignore aborted requests
        if (abortControllerRef.current?.signal.aborted) return;
        
        console.error('Error searching for products:', error);
        setError('An error occurred while searching. Please try again.');
      } finally {
        // Update loading state only if not aborted
        if (!abortControllerRef.current?.signal.aborted) {
          setLoading(false);
        }
      }
    } else if (searchTerm.trim().length > 0 && searchTerm.trim().length <= 2) {
      setError("Please enter at least 3 characters to search");
    }
  }, [onAddGrocery, searchTerm]);

  // Handle search when user presses Enter
  const handleSearchSubmit = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      performSearch();
    }
  }, [performSearch]);

  return (
    <>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          {t('search.title')}
        </Typography>
        
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
                <IconButton 
                  onClick={performSearch}
                  aria-label="search"
                  disabled={loading}
                >
                  <SearchIcon />
                </IconButton>
              </InputAdornment>
            )
          }}
        />
        
        {/* Loading indicator that doesn't block results */}
        {loading && (
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
            <CircularProgress size={16} sx={{ mr: 1 }} />
            <Typography variant="caption" color="text.secondary">
              Searching supermarkets...
            </Typography>
          </Box>
        )}
        
        {/* Error message */}
        {error && (
          <Alert severity="warning" sx={{ mt: 2 }} action={
            <Button color="inherit" size="small" onClick={() => setShowDebug(!showDebug)}>
              {showDebug ? 'Hide Debug' : 'Show Debug'}
            </Button>
          }>
            {error}
          </Alert>
        )}
        
        {/* Debug info */}
        <Collapse in={showDebug}>
          <Box sx={{ mt: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
            <Typography variant="subtitle2">Debug Information:</Typography>
            <Typography variant="body2">
              1. Check browser console for detailed logs<br />
              2. Verify that supermarkets.json exists in the public folder<br />
              3. Ensure supermarkets.json has the correct format (array of objects with p, c, u, i properties)<br />
              4. Each supermarket should have a "p" array with product objects (n, l, p, s properties)
            </Typography>
          </Box>
        </Collapse>
      </Box>
    </>
  );
};

export default ProductSearch;