import React, { useState, useCallback, useRef } from 'react';
import {
  TextField,
  Box,
  Card,
  CardContent,
  Typography,
  CardActionArea,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  InputAdornment,
  IconButton,
  Stack,
  CircularProgress,
  Alert,
  Collapse
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { Grocery } from '../types';
import { findProductInSupermarkets } from '../services/rawProductData';

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
  const [supermarketResults, setSupermarketResults] = useState<SupermarketProduct[]>([]);
  const [selectedSupermarketProduct, setSelectedSupermarketProduct] = useState<SupermarketProduct | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDebug, setShowDebug] = useState(false);
  
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
          
        console.log(`Total flattened results: ${flatResults.length}`);
        setSupermarketResults(flatResults);
        
        // Check if no results were found
        if (flatResults.length === 0) {
          setError(`No products found for "${searchTerm}". Please try a different search term.`);
        } else {
          // Automatically add the first product to the grocery list if we have results
          const firstProduct = flatResults[0];
          
          // Parse size information to determine unit
          let unit: 'kg' | 'gram' | 'liter' | 'ml' | 'piece' = 'piece';
          
          const sizeStr = firstProduct.s.toLowerCase();
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
            name: firstProduct.n,
            unit: unit,
            quantity: quantity,
            variant: firstProduct.supermarketName
          };
          
          // Add the grocery to the list
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

  // Handle product selection from supermarket data
  const handleSelectSupermarketProduct = useCallback((product: SupermarketProduct) => {
    setSelectedSupermarketProduct(product);
    
    // Try to extract numeric quantity from size string
    const sizeStr = product.s.toLowerCase();
    const match = sizeStr.match(/(\d+(?:\.\d+)?)/);
    if (match) {
      // Set quantity directly based on extracted value
      setQuantity(parseFloat(match[1]));
    } else {
      // Default to 1 if no quantity found
      setQuantity(1);
    }
    
    setShowModal(true);
  }, []);

  // Add product to grocery list
  const handleAddToList = useCallback(() => {
    if (selectedSupermarketProduct) {
      // Parse size information to determine unit
      let unit: 'kg' | 'gram' | 'liter' | 'ml' | 'piece' = 'piece';
      
      const sizeStr = selectedSupermarketProduct.s.toLowerCase();
      if (sizeStr.includes('kg')) {
        unit = 'kg';
      } else if (sizeStr.includes('g')) {
        unit = 'gram';
      } else if (sizeStr.includes('l') && !sizeStr.includes('ml')) {
        unit = 'liter';
      } else if (sizeStr.includes('ml')) {
        unit = 'ml';
      }
      
      const grocery: Grocery = {
        id: `supermarket-${Date.now()}`,
        name: selectedSupermarketProduct.n,
        unit: unit,
        quantity: quantity,
        variant: selectedSupermarketProduct.supermarketName
      };
      
      // Add grocery to the list and trigger parent component update
      onAddGrocery(grocery);
      
      // Close modal and reset the search
      setShowModal(false);
      setSearchTerm(''); // Clear search input after adding
      setSupermarketResults([]); // Clear results after adding
    }
  }, [onAddGrocery, quantity, selectedSupermarketProduct]);

  return (
    <>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Search for Products
        </Typography>
        
        <TextField
          label="Search for products (e.g., milk, bread, popcorn)"
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
        
        {supermarketResults.length > 0 && (
          <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 1 }}>
            Found {supermarketResults.length} products. The first item has been added for comparison.
            Click on other items to add them to your comparison list.
          </Typography>
        )}
      </Box>

      {/* Product selection modal */}
      <Dialog open={showModal} onClose={() => setShowModal(false)}>
        <DialogTitle>
          Add to Shopping List
        </DialogTitle>
        <DialogContent>
          {selectedSupermarketProduct && (
            <Stack spacing={3} sx={{ mt: 1 }}>
              <Box>
                <Typography variant="h6">
                  {selectedSupermarketProduct.n}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {selectedSupermarketProduct.supermarketName} • {selectedSupermarketProduct.s}
                </Typography>
                <Typography variant="body1" sx={{ mt: 1 }}>
                  €{selectedSupermarketProduct.p.toFixed(2)}
                </Typography>
              </Box>

              <TextField
                label="Quantity"
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(parseFloat(e.target.value) || 1)} 
                InputProps={{
                  inputProps: { min: 1, step: 1 }
                }}
                fullWidth
              />
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowModal(false)}>Cancel</Button>
          <Button 
            onClick={handleAddToList} 
            variant="contained" 
            color="primary"
          >
            Add to List
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ProductSearch;