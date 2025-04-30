import React, { useState, useEffect } from 'react';
import {
  TextField,
  Box,
  Card,
  CardContent,
  Typography,
  CardActionArea,
  CardMedia,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  InputAdornment,
  IconButton,
  Stack,
  Autocomplete,
  CircularProgress,
  Alert,
  Collapse
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { ProductVariant, Grocery } from '../types';
import { searchProducts } from '../services/productService';
import { findProductInSupermarkets } from '../services/realPriceService';

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
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<ProductVariant[]>([]);
  const [supermarketResults, setSupermarketResults] = useState<SupermarketProduct[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<ProductVariant | null>(null);
  const [selectedSupermarketProduct, setSelectedSupermarketProduct] = useState<SupermarketProduct | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDebug, setShowDebug] = useState(false);

  // Handle search input changes
  useEffect(() => {
    const performSearch = async () => {
      if (searchTerm.trim().length > 2) {
        // Reset previous errors
        setError(null);
        
        // Search in local product database - this should be fast and synchronous
        const localResults = searchProducts(searchTerm);
        setSearchResults(localResults);
        
        // Search in supermarkets.json data - keep the UI responsive during this async search
        setLoading(true);
        try {
          console.log(`Searching for: ${searchTerm}`);
          
          const results = await findProductInSupermarkets(searchTerm);
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
          
          // Check if no results were found in either search
          // @ts-ignore - Suppressing type error as this is checking if both searches returned empty
          if (flatResults.length === 0 && localResults.length === 0) {
            setError(`No products found for "${searchTerm}". Check if supermarkets.json is loaded correctly.`);
          }
        } catch (error) {
          console.error('Error searching supermarkets:', error);
          setError(`Error searching supermarkets: ${error instanceof Error ? error.message : String(error)}`);
        } finally {
          setLoading(false);
        }
      } else if (searchTerm.trim().length === 0) {
        // Clear results only when search is empty
        setSearchResults([]);
        setSupermarketResults([]);
      }
    };
    
    // Use a debounce to prevent too many searches while typing
    const debounceTimeout = setTimeout(() => {
      performSearch();
    }, 300);
    
    return () => clearTimeout(debounceTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

  // Handle product selection from product database
  const handleSelectProduct = (product: ProductVariant) => {
    setSelectedProduct(product);
    setSelectedSupermarketProduct(null);
    setQuantity(product.defaultQuantity);
    setShowModal(true);
    setSearchTerm('');
    setInputValue('');
  };

  // Handle product selection from supermarket data
  const handleSelectSupermarketProduct = (product: SupermarketProduct) => {
    setSelectedSupermarketProduct(product);
    setSelectedProduct(null);
    setQuantity(1); // Default quantity
    setShowModal(true);
    setSearchTerm('');
    setInputValue('');
  };

  // Add product to grocery list
  const handleAddToList = () => {
    if (selectedProduct) {
      const grocery: Grocery = {
        id: selectedProduct.id,
        name: selectedProduct.name,
        unit: selectedProduct.unit,
        quantity: quantity,
        variant: selectedProduct.variant
        // brand is intentionally omitted as requested
      };
      
      onAddGrocery(grocery);
      setShowModal(false);
      setSearchTerm('');
      setInputValue('');
      setSearchResults([]);
      setSupermarketResults([]);
    } else if (selectedSupermarketProduct) {
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
      
      // Try to extract numeric quantity
      const match = sizeStr.match(/(\d+(?:\.\d+)?)/);
      if (match) {
        // Use the extracted quantity as the default
        setQuantity(parseFloat(match[1]));
      }
      
      const grocery: Grocery = {
        id: `supermarket-${Date.now()}`,
        name: selectedSupermarketProduct.n,
        unit: unit,
        quantity: quantity,
        variant: selectedSupermarketProduct.supermarketName
        // brand is intentionally omitted as requested
      };
      
      onAddGrocery(grocery);
      setShowModal(false);
      setSearchTerm('');
      setInputValue('');
      setSearchResults([]);
      setSupermarketResults([]);
    }
  };

  // Combine all search results for autocomplete
  const allOptions = [
    ...searchResults.map(item => ({ 
      type: 'product' as const, 
      item
    })),
    ...supermarketResults.map(item => ({ 
      type: 'supermarket' as const, 
      item 
    }))
  ];

  return (
    <>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Search for Products
        </Typography>
        
        <Autocomplete
          freeSolo
          options={allOptions}
          getOptionLabel={(option) => {
            if (typeof option === 'string') return option;
            
            if (option.type === 'product') {
              return `${option.item.name} - ${option.item.variant}`;
            } else {
              return `${option.item.n} (${option.item.supermarketName}) - ${option.item.s}`;
            }
          }}
          groupBy={(option) => {
            if (typeof option === 'string') return '';
            return option.type === 'product' ? 'Product Database' : 'Supermarket Products';
          }}
          value={null}
          inputValue={inputValue}
          onInputChange={(_, newInputValue) => {
            setInputValue(newInputValue);
            setSearchTerm(newInputValue);
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Search for products (e.g., milk, bread, popcorn)"
              variant="outlined"
              fullWidth
              InputProps={{
                ...params.InputProps,
                endAdornment: (
                  <>
                    {loading ? <CircularProgress color="inherit" size={20} /> : null}
                    {params.InputProps.endAdornment}
                    <InputAdornment position="end">
                      <IconButton>
                        <SearchIcon />
                      </IconButton>
                    </InputAdornment>
                  </>
                )
              }}
            />
          )}
          onChange={(_, value) => {
            if (value && typeof value !== 'string') {
              if (value.type === 'product') {
                handleSelectProduct(value.item);
              } else {
                handleSelectSupermarketProduct(value.item);
              }
            }
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
        
        {(searchResults.length > 0 || supermarketResults.length > 0) && (
          <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 1 }}>
            Found {searchResults.length + supermarketResults.length} products. Click on one to add to your list.
          </Typography>
        )}
      </Box>

      {/* Product database results section */}
      {searchResults.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Product Database Results
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            {searchResults.map((product) => (
              <Box key={product.id} sx={{ width: { xs: '100%', sm: '47%', md: '31%' } }}>
                <Card>
                  <CardActionArea onClick={() => handleSelectProduct(product)}>
                    <CardMedia
                      component="img"
                      height="140"
                      image={product.imageUrl || 'https://via.placeholder.com/140x140'}
                      alt={product.name}
                      sx={{ objectFit: 'contain', backgroundColor: '#f5f5f5' }}
                    />
                    <CardContent>
                      <Typography variant="h6">
                        {product.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {product.variant}
                      </Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                        <Chip 
                          label={`${product.defaultQuantity} ${product.unit}`} 
                          size="small" 
                          color="primary" 
                          variant="outlined" 
                        />
                        {product.category && (
                          <Chip label={product.category} size="small" color="secondary" variant="outlined" />
                        )}
                      </Box>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Box>
            ))}
          </Box>
        </Box>
      )}

      {/* Supermarket products section - only show if not loading or explicitly show while loading */}
      {supermarketResults.length > 0 && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Supermarket Products {loading && <Typography component="span" variant="caption" color="text.secondary">(updating...)</Typography>}
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            {supermarketResults.map((product, index) => (
              <Box key={`${product.supermarketName}-${index}`} sx={{ width: { xs: '100%', sm: '47%', md: '31%' } }}>
                <Card>
                  <CardActionArea onClick={() => handleSelectSupermarketProduct(product)}>
                    <CardContent>
                      <Typography variant="h6">
                        {product.n}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {product.s}
                      </Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1, alignItems: 'center' }}>
                        <Chip label={product.supermarketName} size="small" color="secondary" />
                        <Typography variant="h6" color="primary" fontWeight="bold">
                          €{product.p.toFixed(2)}
                        </Typography>
                      </Box>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Box>
            ))}
          </Box>
        </Box>
      )}

      {/* Product selection modal */}
      <Dialog open={showModal} onClose={() => setShowModal(false)}>
        <DialogTitle>
          Add to Shopping List
        </DialogTitle>
        <DialogContent>
          {selectedProduct && (
            <Stack spacing={3} sx={{ mt: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    mr: 2,
                    overflow: 'hidden',
                    borderRadius: 1,
                    backgroundColor: '#f5f5f5',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <img
                    src={selectedProduct.imageUrl || 'https://via.placeholder.com/80x80'}
                    alt={selectedProduct.name}
                    style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                  />
                </Box>
                <Box>
                  <Typography variant="h6">
                    {selectedProduct.name}
                  </Typography>
                  <Typography variant="body1">
                    {selectedProduct.variant}
                  </Typography>
                  {selectedProduct.category && (
                    <Typography variant="body2" color="text.secondary">
                      Category: {selectedProduct.category}
                    </Typography>
                  )}
                </Box>
              </Box>

              <TextField
                label={`Quantity (${selectedProduct.unit})`}
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(parseFloat(e.target.value))}
                InputProps={{
                  inputProps: { min: 0.1, step: 0.1 }
                }}
                fullWidth
              />
            </Stack>
          )}
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
                onChange={(e) => setQuantity(parseFloat(e.target.value))}
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