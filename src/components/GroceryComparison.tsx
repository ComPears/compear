import React, { useState, useEffect, useMemo } from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  Chip,
  CircularProgress,
  IconButton,
  Avatar,
  Tabs,
  Tab,
  Alert
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import RouteIcon from '@mui/icons-material/Route';
import CompareIcon from '@mui/icons-material/Compare';
import { Grocery, GroceryWithPrices, SupermarketPrice } from '../types';
import { fetchPricesForGrocery, supermarkets } from '../services/supermarketService';
import OptimalShoppingStrategy from './OptimalShoppingStrategy';

interface GroceryComparisonProps {
  groceries: Grocery[];
  onRemoveGrocery: (id: string) => void;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

// Helper interface for summary calculations
interface SupermarketSummary {
  supermarketName: string;
  totalPrice: number;
  productCount: number;
  saleCount: number; // Count of items on sale
  totalSavings: number; // Total amount saved from sales
  products: Record<string, SupermarketPrice>; // Map of product IDs to their prices
}

const GroceryComparison: React.FC<GroceryComparisonProps> = ({ groceries, onRemoveGrocery }) => {
  const [groceriesWithPrices, setGroceriesWithPrices] = useState<GroceryWithPrices[]>([]);
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  useEffect(() => {
    const fetchPrices = async () => {
      const updatedGroceries: GroceryWithPrices[] = [];
      
      // Process each grocery item that doesn't have prices yet
      for (const grocery of groceries) {
        const existingWithPrices = groceriesWithPrices.find(g => g.id === grocery.id);
        
        if (existingWithPrices) {
          updatedGroceries.push(existingWithPrices);
        } else {
          // Set loading state for this grocery item
          setLoading(prev => ({ ...prev, [grocery.id]: true }));
          
          try {
            const prices = await fetchPricesForGrocery(grocery);
            updatedGroceries.push({ ...grocery, prices });
          } catch (error) {
            console.error(`Error fetching prices for ${grocery.name}:`, error);
            updatedGroceries.push({ ...grocery, prices: [] });
          } finally {
            setLoading(prev => ({ ...prev, [grocery.id]: false }));
          }
        }
      }
      
      setGroceriesWithPrices(updatedGroceries);
    };
    
    fetchPrices();
  }, [groceries]);

  // Find the logo URL for a supermarket by name
  const getSupermarketLogo = (name: string): string | undefined => {
    const supermarket = supermarkets.find(s => s.name === name);
    return supermarket?.logo;
  };

  // Calculate total savings from regular price if on sale
  const calculateSavings = (price: SupermarketPrice): number => {
    if (price.onSale && price.regularPrice) {
      return price.regularPrice - price.price;
    }
    return 0;
  };

  const formatCurrency = (amount: number) => {
    return `€${amount.toFixed(2)}`;
  };

  const getLowestPriceSupermarket = (prices: SupermarketPrice[]) => {
    if (prices.length === 0) return null;
    
    const lowestPrice = Math.min(...prices.map(p => p.price));
    return prices.find(p => p.price === lowestPrice);
  };

  const formatUnitLabel = (grocery: Grocery) => {
    switch(grocery.unit) {
      case 'kg':
        return 'kg';
      case 'gram':
        return 'g';
      case 'liter':
        return 'L';
      case 'ml':
        return 'ml';
      default:
        return '';
    }
  };

  const displayUnitPrice = (price: SupermarketPrice, grocery: Grocery) => {
    if (!price.unitPrice) return null;
    
    let unitDisplay = '';
    if (grocery.unit === 'kg' || grocery.unit === 'gram') {
      unitDisplay = '€/kg';
    } else if (grocery.unit === 'liter' || grocery.unit === 'ml') {
      unitDisplay = '€/L';
    } else {
      return null;
    }
    
    return `${price.unitPrice.toFixed(2)} ${unitDisplay}`;
  };

  // Calculate summary of prices across all supermarkets
  const supermarketSummaries = useMemo(() => {
    if (groceriesWithPrices.length === 0) return [];

    // Get all unique supermarket names from all grocery prices
    const supermarketNames = new Set<string>();
    groceriesWithPrices.forEach(grocery => {
      grocery.prices.forEach(price => {
        supermarketNames.add(price.supermarketName);
      });
    });

    // Initialize summaries for each supermarket
    const summaries: SupermarketSummary[] = Array.from(supermarketNames).map(name => ({
      supermarketName: name,
      totalPrice: 0,
      productCount: 0,
      saleCount: 0,
      totalSavings: 0,
      products: {}
    }));
    
    // Calculate totals for each supermarket
    groceriesWithPrices.forEach(grocery => {
      // For each supermarket, find the price for this grocery
      summaries.forEach(summary => {
        const priceEntry = grocery.prices.find(p => p.supermarketName === summary.supermarketName);
        
        if (priceEntry) {
          summary.totalPrice += priceEntry.price;
          summary.productCount++;
          
          // Store the product in the summary for reference
          summary.products[grocery.id] = priceEntry;
          
          // Check if the item is on sale
          if (priceEntry.onSale) {
            summary.saleCount++;
            summary.totalSavings += calculateSavings(priceEntry);
          }
        }
      });
    });

    // Filter summaries to include only those with all products
    // Only include supermarkets that have all the products in the grocery list
    const validSummaries = summaries.filter(summary => 
      summary.productCount === groceriesWithPrices.length
    );

    // Sort summaries by total price (cheapest first)
    return validSummaries.sort((a, b) => a.totalPrice - b.totalPrice);
  }, [groceriesWithPrices]);

  const cheapestSupermarket = useMemo(() => {
    return supermarketSummaries.length > 0 ? supermarketSummaries[0] : null;
  }, [supermarketSummaries]);

  // Check if any grocery has no prices
  const hasProductsWithNoPrices = useMemo(() => {
    return groceriesWithPrices.some(grocery => grocery.prices.length === 0);
  }, [groceriesWithPrices]);

  // Get list of groceries that have no prices
  const productsNotFound = useMemo(() => {
    return groceriesWithPrices.filter(grocery => grocery.prices.length === 0);
  }, [groceriesWithPrices]);

  if (groceries.length === 0) {
    return (
      <Card>
        <CardContent>
          <Typography variant="subtitle1" align="center">
            Add grocery items to compare prices
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Box>
      {groceriesWithPrices.length > 0 && (
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            aria-label="view modes"
            centered
          >
            <Tab icon={<RouteIcon />} label="Optimal Strategy" />
            <Tab icon={<CompareIcon />} label="Compare All Stores" />
            <Tab icon={<ShoppingCartIcon />} label="Individual Items" />
          </Tabs>
        </Box>
      )}

      {/* Show alert for products not found in any store */}
      {hasProductsWithNoPrices && (
        <Alert severity="warning" sx={{ mt: 2, mb: 2 }}>
          {productsNotFound.length === 1 ? (
            <>
              Product <strong>{productsNotFound[0].name}</strong> was not found in any store.
            </>
          ) : (
            <>
              Products <strong>{productsNotFound.map(g => g.name).join(', ')}</strong> were not found in any store.
            </>
          )}
        </Alert>
      )}
      
      <TabPanel value={tabValue} index={0}>
        <OptimalShoppingStrategy groceriesWithPrices={groceriesWithPrices} />
      </TabPanel>
      
      <TabPanel value={tabValue} index={1}>
        {/* Total Summary Card */}
        {groceriesWithPrices.length > 0 && supermarketSummaries.length > 0 && (
          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <CompareIcon sx={{ mr: 1.5 }} color="primary" />
                <Typography variant="h6" component="div">
                  All Stores Comparison
                </Typography>
              </Box>
              
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Total for {groceriesWithPrices.length} items across Dutch supermarkets
              </Typography>
              
              <TableContainer 
                component={Paper} 
                variant="outlined" 
                sx={{ 
                  mt: 2,
                  maxHeight: 500, 
                  overflowY: 'auto'
                }}
              >
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold', width: '25%' }}>Supermarket</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold' }}>Total Price</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold' }}>Items Found</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold' }}>Products</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold' }}>On Sale</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {supermarketSummaries.map((summary) => (
                      <TableRow 
                        key={summary.supermarketName}
                        sx={{
                          backgroundColor: summary === cheapestSupermarket ? 'success.light' : 'inherit'
                        }}
                      >
                        <TableCell component="th" scope="row">
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Avatar 
                              src={getSupermarketLogo(summary.supermarketName)} 
                              alt={summary.supermarketName}
                              sx={{ width: 24, height: 24, mr: 1 }}
                            />
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              {summary.supermarketName}
                              {summary === cheapestSupermarket && (
                                <Chip 
                                  label="Cheapest" 
                                  size="small" 
                                  color="success" 
                                  sx={{ ml: 1 }}
                                />
                              )}
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell align="right">{formatCurrency(summary.totalPrice)}</TableCell>
                        <TableCell align="right">
                          {summary.productCount}/{groceriesWithPrices.length}
                        </TableCell>
                        <TableCell align="right">
                          {Object.keys(summary.products).map(productId => {
                            const grocery = groceriesWithPrices.find(g => g.id === productId);
                            return grocery ? grocery.name + ", " : "";
                          }).join("").replace(/, $/, "")}
                        </TableCell>
                        <TableCell align="right">
                          {summary.saleCount > 0 ? (
                            <Chip 
                              icon={<LocalOfferIcon />} 
                              label={`${summary.saleCount} items`} 
                              size="small" 
                              color="secondary" 
                            />
                          ) : "None"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        )}
      </TabPanel>
      
      <TabPanel value={tabValue} index={2}>
        {/* Individual Grocery Cards */}
        {groceriesWithPrices.map((grocery) => {
          const lowestPriceSupermarket = getLowestPriceSupermarket(grocery.prices);
          
          return (
            <Card key={grocery.id} sx={{ mb: 3 }}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6" component="div">
                    {grocery.name} {grocery.quantity > 1 && `(${grocery.quantity} ${formatUnitLabel(grocery)})`}
                  </Typography>
                  <IconButton onClick={() => onRemoveGrocery(grocery.id)} size="small">
                    <DeleteIcon />
                  </IconButton>
                </Box>
                
                {loading[grocery.id] ? (
                  <Box display="flex" justifyContent="center" p={3}>
                    <CircularProgress />
                  </Box>
                ) : grocery.prices.length === 0 ? (
                  <Alert severity="warning">
                    Product not found in any store.
                  </Alert>
                ) : (
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Supermarket</TableCell>
                          <TableCell align="right">Price</TableCell>
                          <TableCell align="right">Unit Price</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {grocery.prices.sort((a, b) => a.price - b.price).map((price) => (
                          <TableRow 
                            key={price.supermarketName}
                            sx={{
                              backgroundColor: lowestPriceSupermarket?.supermarketName === price.supermarketName 
                                ? 'success.light' 
                                : 'inherit'
                            }}
                          >
                            <TableCell component="th" scope="row">
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Avatar 
                                  src={getSupermarketLogo(price.supermarketName)} 
                                  alt={price.supermarketName}
                                  sx={{ width: 24, height: 24, mr: 1 }}
                                />
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  {price.supermarketName}
                                  {price === lowestPriceSupermarket && (
                                    <Chip 
                                      label="Lowest" 
                                      size="small" 
                                      color="success" 
                                      sx={{ ml: 1 }}
                                    />
                                  )}
                                </Box>
                              </Box>
                            </TableCell>
                            <TableCell align="right">
                              {price.onSale ? (
                                <Box>
                                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                                    {formatCurrency(price.price)}
                                    <Chip 
                                      icon={<LocalOfferIcon />} 
                                      label="Sale" 
                                      size="small" 
                                      color="secondary" 
                                      sx={{ ml: 1 }}
                                    />
                                  </Box>
                                  <Typography 
                                    variant="caption" 
                                    sx={{ 
                                      textDecoration: 'line-through', 
                                      color: 'text.secondary',
                                      display: 'block'
                                    }}
                                  >
                                    {price.regularPrice && formatCurrency(price.regularPrice)}
                                  </Typography>
                                </Box>
                              ) : (
                                formatCurrency(price.price)
                              )}
                            </TableCell>
                            <TableCell align="right">
                              {displayUnitPrice(price, grocery)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </CardContent>
            </Card>
          );
        })}
      </TabPanel>
    </Box>
  );
};

export default GroceryComparison;