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
  Tooltip,
  Avatar,
  Tabs,
  Tab,
  Button,
  List,
  ListItem,
  ListItemText,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import InfoIcon from '@mui/icons-material/Info';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import RouteIcon from '@mui/icons-material/Route';
import CompareIcon from '@mui/icons-material/Compare';
import ShareIcon from '@mui/icons-material/Share';
import CloseIcon from '@mui/icons-material/Close';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Grocery, GroceryWithPrices, SupermarketPrice } from '../types';
import { fetchPricesForGrocery, supermarkets } from '../services/supermarketService';
import OptimalShoppingStrategy from './OptimalShoppingStrategy';
import { useLanguage } from '../context/LanguageContext';
import { useCountry } from '../context/CountryContext';

interface GroceryComparisonProps {
  groceries: Grocery[];
  onRemoveGrocery: (id: string) => void;
  /** 
   * When true, triggers the cheapest supermarket dialog to open automatically.
   * Used to open the dialog from external components (e.g., cart icon click).
   */
  openCheapestDialog?: boolean;
  /** 
   * Callback function called after the cheapest dialog trigger has been handled.
   * Should be used to reset the openCheapestDialog state in the parent component.
   */
  onCheapestDialogHandled?: () => void;
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
  estimatedCount: number;
  apiCount: number;
  unavailableCount: number;
  productCount: number;
  saleCount: number; // Count of items on sale
  totalSavings: number; // Total amount saved from sales
}

const GroceryComparison: React.FC<GroceryComparisonProps> = ({ 
  groceries, 
  onRemoveGrocery, 
  openCheapestDialog = false,
  onCheapestDialogHandled 
}) => {
  const { t } = useLanguage();
  const { country } = useCountry();
  const [groceriesWithPrices, setGroceriesWithPrices] = useState<GroceryWithPrices[]>([]);
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [tabValue, setTabValue] = useState(0);
  const [selectedSupermarket, setSelectedSupermarket] = useState<SupermarketSummary | null>(null);
  const [productDialogOpen, setProductDialogOpen] = useState(false);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  useEffect(() => {
    const fetchPrices = async () => {
      // Use a functional update that doesn't depend on the current groceriesWithPrices value
      setGroceriesWithPrices(prevGroceriesWithPrices => {
        const updatedGroceries: GroceryWithPrices[] = [];
        
        // Process each grocery item
        for (const grocery of groceries) {
          // Check if this grocery already exists in the previous state
          const existingWithPrices = prevGroceriesWithPrices.find(g => g.id === grocery.id);
          
          if (existingWithPrices) {
            // Reuse existing data
            updatedGroceries.push(existingWithPrices);
          } else {
            // This is a new grocery, fetch prices asynchronously
            // Set loading state for this grocery item
            setLoading(prev => ({ ...prev, [grocery.id]: true }));
            
            // Add a placeholder immediately - we'll update it when data arrives
            updatedGroceries.push({ ...grocery, prices: [] });
            
            // Fetch prices in the background
            fetchPricesForGrocery(grocery)
              .then(prices => {
                // Update this specific grocery with its prices
                setGroceriesWithPrices(current => 
                  current.map(g => g.id === grocery.id ? { ...g, prices } : g)
                );
              })
              .catch(error => {
                console.error(`Error fetching prices for ${grocery.name}:`, error);
              })
              .finally(() => {
                setLoading(prev => ({ ...prev, [grocery.id]: false }));
              });
          }
        }
        
        return updatedGroceries;
      });
    };
    
    fetchPrices();
  }, [groceries]); // groceriesWithPrices is no longer a dependency

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
      estimatedCount: 0,
      apiCount: 0,
      unavailableCount: 0,
      productCount: 0,
      saleCount: 0,
      totalSavings: 0
    }));
    
    // Calculate totals for each supermarket
    groceriesWithPrices.forEach(grocery => {
      // For each supermarket, find the price for this grocery
      summaries.forEach(summary => {
        const priceEntry = grocery.prices.find(p => p.supermarketName === summary.supermarketName);
        
        if (priceEntry) {
          summary.totalPrice += priceEntry.price;
          summary.productCount++;
          
          if (priceEntry.isEstimated) {
            summary.estimatedCount++;
          } else {
            summary.apiCount++;
          }
          
          // Check if the item is on sale
          if (priceEntry.onSale) {
            summary.saleCount++;
            summary.totalSavings += calculateSavings(priceEntry);
          }
        } else {
          summary.unavailableCount++;
        }
      });
    });

    // Sort summaries by total price (cheapest first)
    return summaries.sort((a, b) => a.totalPrice - b.totalPrice);
  }, [groceriesWithPrices]);

  const cheapestSupermarket = useMemo(() => {
    return supermarketSummaries.length > 0 ? supermarketSummaries[0] : null;
  }, [supermarketSummaries]);

  // Handle sharing the shopping list for a specific supermarket
  const handleShareSupermarketList = () => {
    if (!selectedSupermarket || groceriesWithPrices.length === 0) return;

    // Create text to share
    let shareText = `🛒 My ComPear Shopping List for ${selectedSupermarket.supermarketName} 🛒\n\n`;
    
    // Get all items available at this supermarket
    const items = groceriesWithPrices
      .map(grocery => {
        const price = grocery.prices.find(p => p.supermarketName === selectedSupermarket.supermarketName);
        if (price) {
          return {
            name: grocery.name,
            price: price.price,
            onSale: price.onSale,
            regularPrice: price.regularPrice
          };
        }
        return null;
      })
      .filter(item => item !== null);

    // List all items to buy at this supermarket
    items.forEach(item => {
      if (item) {
        shareText += `- ${item.name}: ${formatCurrency(item.price)}`;
        if (item.onSale) {
          shareText += ` (ON SALE! Regular: ${formatCurrency(item.regularPrice || 0)})`;
        }
        shareText += '\n';
      }
    });
    
    shareText += `\nTotal: ${formatCurrency(selectedSupermarket.totalPrice)}\n`;
    if (selectedSupermarket.saleCount > 0) {
      shareText += `You save: ${formatCurrency(selectedSupermarket.totalSavings)} on ${selectedSupermarket.saleCount} items\n`;
    }
    shareText += "\nMade with ComPear - Compare grocery prices across Dutch supermarkets!";
    
    // Share using the Web Share API if available
    if (navigator.share) {
      navigator.share({
        title: `My ComPear Shopping List for ${selectedSupermarket.supermarketName}`,
        text: shareText,
      }).catch(err => {
        // Fallback - copy to clipboard
        copyToClipboard(shareText);
      });
    } else {
      // Fallback - copy to clipboard
      copyToClipboard(shareText);
    }
  };

  // Helper function to copy text to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        alert(t('clipboard.copied'));
      })
      .catch(err => {
        console.error('Failed to copy text: ', err);
        alert(t('clipboard.failed'));
      });
  };

  const handleOpenProductDialog = (summary: SupermarketSummary) => {
    setSelectedSupermarket(summary);
    setProductDialogOpen(true);
  };

  const handleCloseProductDialog = () => {
    setProductDialogOpen(false);
  };

  // Handle opening cheapest supermarket dialog from external trigger
  useEffect(() => {
    if (openCheapestDialog && cheapestSupermarket && groceriesWithPrices.length > 0) {
      handleOpenProductDialog(cheapestSupermarket);
      onCheapestDialogHandled?.();
    }
  }, [openCheapestDialog, cheapestSupermarket, groceriesWithPrices.length, onCheapestDialogHandled]);

  if (groceries.length === 0) {
    return (
      <Card>
        <CardContent>
          <Typography variant="subtitle1" align="center">
            {t('individual.addItemsPrompt')}
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
            <Tab icon={<ShoppingCartIcon />} label={t('tabs.individualItems')} />
            <Tab icon={<CompareIcon />} label={t('tabs.compareAllStores')} />
            <Tab icon={<RouteIcon />} label={t('tabs.optimalStrategy')} />
          </Tabs>
        </Box>
      )}
      
      <TabPanel value={tabValue} index={0}>
        {/* Individual Grocery Cards */}
        {groceriesWithPrices.some(grocery => grocery.prices.some(price => price.isEstimated)) && (
          <Box sx={{ p: 2, bgcolor: 'info.light', borderRadius: 1, mb: 3, display: 'flex', alignItems: 'center' }}>
            <InfoIcon sx={{ mr: 1 }} color="info" />
            <Typography variant="body2">
              {t('individual.estimatedText')}
            </Typography>
          </Box>
        )}
        {groceriesWithPrices.map((grocery) => {
          const lowestPriceSupermarket = getLowestPriceSupermarket(grocery.prices);
          
          return (
            <Accordion key={grocery.id} sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', width: '100%', alignItems: 'center' }}>
                <AccordionSummary 
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls={`panel-${grocery.id}-content`}
                  id={`panel-${grocery.id}-header`}
                  sx={{ flex: 1, '&.Mui-expanded': { minHeight: 48 } }}
                >
                  <Box display="flex" justifyContent="space-between" alignItems="center" width="100%" pr={2}>
                    <Typography variant="h6" component="div">
                      {grocery.name} {grocery.quantity > 1 && `(${grocery.quantity} ${formatUnitLabel(grocery)})`}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      {lowestPriceSupermarket && (
                        <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
                          <Avatar 
                            src={getSupermarketLogo(lowestPriceSupermarket.supermarketName)} 
                            alt={lowestPriceSupermarket.supermarketName}
                            sx={{ width: 24, height: 24, mr: 1 }}
                          />
                          <Typography variant="body1">
                            {formatCurrency(lowestPriceSupermarket.price)}
                          </Typography>
                          <Chip 
                            label={t('label.lowest')} 
                            size="small" 
                            color="success" 
                            sx={{ ml: 1 }}
                          />
                        </Box>
                      )}
                    </Box>
                  </Box>
                </AccordionSummary>
                <IconButton 
                  onClick={() => onRemoveGrocery(grocery.id)} 
                  size="small"
                  sx={{ mr: 2 }}
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
              <AccordionDetails>
                {loading[grocery.id] ? (
                  <Box display="flex" justifyContent="center" p={3}>
                    <CircularProgress />
                  </Box>
                ) : (
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>{t('table.supermarket')}</TableCell>
                          <TableCell align="right">{t('table.price')}</TableCell>
                          <TableCell align="right">{t('table.unitPrice')}</TableCell>
                          <TableCell align="right">{t('table.estPrices')}</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {grocery.prices.sort((a, b) => a.price - b.price).map((price, index) => (
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
                                      label={t('label.lowest')} 
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
                                      label={t('label.sale')} 
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
                            <TableCell align="right">
                              {price.isEstimated ? (
                                <Tooltip title={t('info.estimatedPrices')}>
                                  <span>
                                    <Chip icon={<InfoIcon />} label={t('label.estimated')} size="small" color="info" />
                                  </span>
                                </Tooltip>
                              ) : null}
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
                  maxHeight: 500, // Make the table scrollable
                  overflowY: 'auto'
                }}
              >
                <Box sx={{ p: 2, bgcolor: 'info.light', borderRadius: 1, mb: 2, display: 'flex', alignItems: 'center' }}>
                  <InfoIcon sx={{ mr: 1 }} color="info" />
                  <Typography variant="body2">
                    {t('info.estimatedPrices')}
                  </Typography>
                </Box>
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold', width: '25%' }}>{t('table.supermarket')}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold' }}>{t('table.totalPrice')}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold' }}>{t('table.itemsFound')}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold' }}>{t('table.estPrices')}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold' }}>{t('table.onSale')}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {supermarketSummaries.map((summary) => (
                      <TableRow 
                        key={summary.supermarketName}
                        sx={{
                          backgroundColor: summary === cheapestSupermarket ? 'success.light' : 'inherit',
                          cursor: 'pointer',
                          '&:hover': {
                            backgroundColor: summary === cheapestSupermarket ? 'success.main' : 'action.hover',
                          }
                        }}
                        onClick={() => handleOpenProductDialog(summary)}
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
                                  label={t('label.cheapest')} 
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
                          {summary.estimatedCount > 0 ? (
                            <>
                              <Tooltip title={t('info.estimatedPrices')}>
                                <span>
                                  <Chip 
                                    icon={<InfoIcon />} 
                                    label={`${summary.estimatedCount}`} 
                                    size="small" 
                                    color="info" 
                                  />
                                </span>
                              </Tooltip>
                            </>
                          ) : t('label.none')}
                        </TableCell>
                        <TableCell align="right">
                          {summary.saleCount > 0 ? (
                            <Chip 
                              icon={<LocalOfferIcon />} 
                              label={`${summary.saleCount} ${t('label.items')}`} 
                              size="small" 
                              color="secondary" 
                            />
                          ) : t('label.none')}
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

      {/* Product List Dialog */}
      <Dialog
        open={productDialogOpen}
        onClose={handleCloseProductDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {selectedSupermarket && (
                <>
                  <Avatar 
                    src={getSupermarketLogo(selectedSupermarket.supermarketName)} 
                    alt={selectedSupermarket.supermarketName}
                    sx={{ width: 32, height: 32, mr: 1.5 }}
                  />
                  {t('dialog.productsInSupermarket').replace('{supermarket}', selectedSupermarket?.supermarketName || '')}
                </>
              )}
            </Box>
            <Box>
              <IconButton color="inherit" onClick={handleShareSupermarketList} size="small">
                <Tooltip title={t('info.shareList')}>
                  <span>
                    <ShareIcon />
                  </span>
                </Tooltip>
              </IconButton>
              <IconButton onClick={handleCloseProductDialog} size="small">
                <CloseIcon />
              </IconButton>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {selectedSupermarket && (
            <Box>
              {/* Supermarket stats */}
              <Box sx={{ mb: 2, display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                <Chip 
                  label={t('dialog.total').replace('{amount}', formatCurrency(selectedSupermarket.totalPrice))} 
                  color="primary" 
                  variant="outlined" 
                />
                
                {selectedSupermarket.saleCount > 0 && (
                  <Chip 
                    icon={<LocalOfferIcon />}
                    label={t('dialog.saleItems').replace('{count}', selectedSupermarket.saleCount.toString())}
                    color="secondary"
                    variant="outlined"
                  />
                )}
                
                {selectedSupermarket.estimatedCount > 0 && (
                  <Tooltip title={t('info.estimatedPrices')}>
                    <span>
                      <Chip 
                        icon={<InfoIcon />}
                        label={t('dialog.estimatedPrices').replace('{count}', selectedSupermarket.estimatedCount.toString())}
                        color="info"
                        variant="outlined"
                      />
                    </span>
                  </Tooltip>
                )}
              </Box>
              
              <Divider sx={{ mb: 2 }} />
              
              {/* List of products */}
              <List>
                {groceriesWithPrices.map(grocery => {
                  const price = grocery.prices.find(p => p.supermarketName === selectedSupermarket.supermarketName);
                  if (!price) return null;
                  
                  return (
                    <ListItem key={grocery.id} divider>
                      <ListItemText 
                        primary={
                          <Typography variant="body1">
                            {grocery.name}
                            {grocery.quantity > 1 && ` (${grocery.quantity} ${formatUnitLabel(grocery)})`}
                          </Typography>
                        }
                      />
                      <Box sx={{ ml: 2, display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                        {price.isEstimated && (
                          <Box sx={{ mb: 1 }}>
                            <Tooltip title={t('info.estimatedPrices')}>
                              <span>
                                <Chip icon={<InfoIcon />} label={t('label.estimated')} size="small" color="info" />
                              </span>
                            </Tooltip>
                          </Box>
                        )}
                        
                        {price.onSale ? (
                          <>
                            <Typography variant="body1" sx={{ fontWeight: 'bold', color: 'secondary.main' }}>
                              {formatCurrency(price.price)} <LocalOfferIcon fontSize="small" />
                            </Typography>
                            <Typography variant="caption" sx={{ textDecoration: 'line-through', display: 'block' }}>
                              {price.regularPrice && formatCurrency(price.regularPrice)}
                            </Typography>
                          </>
                        ) : (
                          <Typography variant="body1">
                            {formatCurrency(price.price)}
                          </Typography>
                        )}
                        
                        {price.unitPrice && (
                          <Typography variant="caption" color="text.secondary">
                            {displayUnitPrice(price, grocery)}
                          </Typography>
                        )}
                      </Box>
                    </ListItem>
                  );
                })}
              </List>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseProductDialog}>{t('dialog.close')}</Button>
          <Button 
            startIcon={<ShareIcon />} 
            onClick={handleShareSupermarketList} 
            variant="contained"
          >
            {t('dialog.share')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default GroceryComparison; 