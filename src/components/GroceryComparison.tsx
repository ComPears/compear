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
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useTheme, useMediaQuery } from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import RouteIcon from '@mui/icons-material/Route';
import CompareIcon from '@mui/icons-material/Compare';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Grocery, GroceryWithPrices, SupermarketPrice } from '../types';
import { fetchPricesForGrocery, supermarkets } from '../services/supermarketService';
import OptimalShoppingStrategy from './OptimalShoppingStrategy';
import { useLanguage } from '../context/LanguageContext';
import { useCountry } from '../context/CountryContext';

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
  const theme = useTheme();
  const { t } = useLanguage();
  const { country } = useCountry();
  const [expandedAccordions, setExpandedAccordions] = useState<Record<string, boolean>>({});
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleAccordionChange = (groceryId: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpandedAccordions(prev => ({
      ...prev,
      [groceryId]: isExpanded
    }));
  };

  useEffect(() => {
    const fetchPrices = () => {
      const updatedGroceries: GroceryWithPrices[] = [];
      
      // Process each grocery item that doesn't have prices yet
      for (const grocery of groceries) {
        const existingWithPrices = groceriesWithPrices.find(g => g.id === grocery.id);
        
        if (existingWithPrices) {
          updatedGroceries.unshift(existingWithPrices);
        } else {
          // Set loading state for this grocery item
          setLoading(prev => ({ ...prev, [grocery.id]: true }));
          
          try {
            const prices = fetchPricesForGrocery(grocery);
            updatedGroceries.unshift({ ...grocery, prices });
          } catch (error) {
            console.error(`Error fetching prices for ${grocery.name}:`, error);
            updatedGroceries.unshift({ ...grocery, prices: [] });
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

  // Calculate summary of prices across all supermarkets
  const supermarketSummaries = useMemo(() => {
    if (groceriesWithPrices.length === 0) return [];

    // Get all unique supermarket names from all grocery prices
    const supermarketNamesSet = new Set<string>();
    console.log("Groceries with prices ", groceriesWithPrices);
    groceriesWithPrices.forEach(grocery => {
      grocery.prices.forEach(price => {
        supermarketNamesSet.add(price.supermarketName);
      });
    });

    // Initialize summaries for each unique supermarket
    const summaries: SupermarketSummary[] = Array.from(supermarketNamesSet).map(name => ({
      supermarketName: name,
      totalPrice: 0,
      productCount: 0,
      saleCount: 0,
      totalSavings: 0,
      products: {}
    }));
    
    // Calculate totals for each supermarket
    groceriesWithPrices.forEach(grocery => {
      // For each supermarket, find the cheapest price for this grocery
      summaries.forEach(summary => {
        const supermarketPrices = grocery.prices.filter(p => p.supermarketName === summary.supermarketName);
        
        if (supermarketPrices.length > 0) {
          // Find the cheapest price among multiple products from the same supermarket
          const cheapestPrice = supermarketPrices.reduce((min, current) => 
            current.price < min.price ? current : min
          );
          
          summary.totalPrice += cheapestPrice.price;
          summary.productCount++;
          
          // Store the cheapest product in the summary for reference
          summary.products[grocery.id] = cheapestPrice;
          
          // Check if the item is on sale
          if (cheapestPrice.onSale) {
            summary.saleCount++;
            summary.totalSavings += calculateSavings(cheapestPrice);
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
            <Tab icon={<ShoppingCartIcon />} label={isMobile ? t('tabs.individualItemsShort') : t('tabs.individualItems')} />
            <Tab icon={<CompareIcon />} label={isMobile ? t('tabs.compareAllStoresShort') : t('tabs.compareAllStores')} />
            <Tab icon={<RouteIcon />} label={isMobile ? t('tabs.optimalStrategyShort') : t('tabs.optimalStrategy')}
              sx={{
                '& .MuiTab-labelContainer': {
                  fontSize: { xs: '0.7rem', sm: '0.875rem' }
                }
              }} />
          </Tabs>
        </Box>
      )}

      <TabPanel value={tabValue} index={0}>
        {/* Individual Grocery Accordions */}
        {groceriesWithPrices.map((grocery) => {
          const lowestPriceSupermarket = getLowestPriceSupermarket(grocery.prices);
          const isExpanded = expandedAccordions[grocery.id] || false;
          
          return (
            <Accordion 
              key={grocery.id} 
              expanded={isExpanded}
              onChange={handleAccordionChange(grocery.id)}
              sx={{ mb: 1 }}
            >
              <AccordionSummary 
                expandIcon={<ExpandMoreIcon />}
                aria-controls={`panel-${grocery.id}-content`}
                id={`panel-${grocery.id}-header`}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', pr: 2 }}>
                  {/* Searched Item */}
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>
                      {grocery.name}
                    </Typography>
                  </Box>
                  {lowestPriceSupermarket && (
                    <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
                      <Avatar 
                        src={getSupermarketLogo(lowestPriceSupermarket.supermarketName)} 
                        alt={lowestPriceSupermarket.supermarketName}
                        sx={{ width: 20, height: 20, mr: 1 }}
                      />
                      <Typography variant="body2" sx={{ mr: 1 }}>
                        {lowestPriceSupermarket.supermarketName}
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                        {formatCurrency(lowestPriceSupermarket.price)}
                      </Typography>
                      {lowestPriceSupermarket.onSale && (
                        <Chip 
                          icon={<LocalOfferIcon />} 
                          label="Sale" 
                          size="small" 
                          color="secondary" 
                          sx={{ ml: 0.5, height: 20 }}
                        />
                      )}
                    </Box>
                  )}

                  {/* Delete Button */}
                  <IconButton 
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveGrocery(grocery.id);
                    }} 
                    size="small"
                    sx={{ 
                      '&:hover': { 
                        backgroundColor: 'error.light',
                        color: 'error.contrastText'
                      }
                    }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              </AccordionSummary>
              
              <AccordionDetails>
                {loading[grocery.id] ? (
                  <Box display="flex" justifyContent="center" p={3}>
                    <CircularProgress />
                  </Box>
                ) : grocery.prices.length >= 1 && (
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>{t('table.supermarket')}</TableCell>
                          <TableCell>{t('table.price')}</TableCell>
                          <TableCell align="right">{t('table.unitPrice')}</TableCell>
                          <TableCell align="right">{t('table.size')}</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {grocery.prices.sort((a, b) => a.price - b.price).map((price) => (
                          <TableRow 
                            key={price.supermarketName}
                            sx={{
                              backgroundColor: lowestPriceSupermarket?.price === price.price 
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
                            <TableCell>
                              <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                                {price.productName || grocery.name}
                              </Typography>
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
                              {price.size}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </AccordionDetails>
            </Accordion>
          );
        })}
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        {/* Total Summary Card */}
        {groceriesWithPrices.length > 0 && supermarketSummaries.length > 0 && (
          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <CompareIcon sx={{ mr: 1.5 }} color="primary" />
                <Typography variant="h6" component="div">
                  {t('tabs.compareAllStores')}
                </Typography>
              </Box>
              
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {t('app.totalItems')
                  .replace('{count}', groceriesWithPrices.length.toString())
                  .replace('{country}', country.name)}
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
                      <TableCell sx={{ fontWeight: 'bold', width: '25%' }}>{t('table.supermarket')}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold' }}>{t('table.totalPrice')}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold' }}>{t('table.itemsFound')}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold' }}>{t('table.product')}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold' }}>{t('table.onSale')}</TableCell>
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
                          {Object.entries(summary.products).map(([productId, priceData], index) => {
                            const grocery = groceriesWithPrices.find(g => g.id === productId);
                            const productName = priceData.productName || grocery?.name || 'Unknown';
                            return (
                              <Typography
                                key={productId}
                                variant="caption"
                                component="div"
                                sx={{ 
                                  // fontSize: '0.75rem',
                                  // color: 'text.secondary',
                                  lineHeight: 1.2,
                                  mb: index < Object.keys(summary.products).length - 1 ? 0.5 : 0
                                }}
                              >
                                {productName}
                              </Typography>
                            );
                          })}
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
        <OptimalShoppingStrategy groceriesWithPrices={groceriesWithPrices} />
      </TabPanel>
    </Box>
  );
};

export default GroceryComparison;