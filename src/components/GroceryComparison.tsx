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
  estimatedCount: number;
  apiCount: number;
  unavailableCount: number;
  productCount: number;
  saleCount: number; // Count of items on sale
  totalSavings: number; // Total amount saved from sales
}

const GroceryComparison: React.FC<GroceryComparisonProps> = ({ groceries, onRemoveGrocery }) => {
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
        alert('Shopping list copied to clipboard!');
      })
      .catch(err => {
        console.error('Failed to copy text: ', err);
        alert('Could not copy to clipboard. Please share manually.');
      });
  };

  const handleOpenProductDialog = (summary: SupermarketSummary) => {
    setSelectedSupermarket(summary);
    setProductDialogOpen(true);
  };

  const handleCloseProductDialog = () => {
    setProductDialogOpen(false);
  };

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
            <Tab icon={<CompareIcon />} label="Compare All Stores" />
            <Tab icon={<RouteIcon />} label="Optimal Strategy" />
            <Tab icon={<ShoppingCartIcon />} label="Individual Items" />
          </Tabs>
        </Box>
      )}
      
      <TabPanel value={tabValue} index={0}>
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
                Total for {groceriesWithPrices.length} items across all Dutch supermarkets
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
                    Some prices are estimated using advanced algorithms when official data isn't available.
                  </Typography>
                </Box>
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold', width: '25%' }}>Supermarket</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold' }}>Total Price</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold' }}>Items Found</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold' }}>Est. Prices</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold' }}>On Sale</TableCell>
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
                          {summary.estimatedCount > 0 ? (
                            <Tooltip title="Prices estimated using advanced algorithms">
                              <Chip 
                                icon={<InfoIcon />} 
                                label={`${summary.estimatedCount}`} 
                                size="small" 
                                color="info" 
                              />
                            </Tooltip>
                          ) : "None"}
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
      
      <TabPanel value={tabValue} index={1}>
        <OptimalShoppingStrategy groceriesWithPrices={groceriesWithPrices} />
      </TabPanel>
      
      <TabPanel value={tabValue} index={2}>
        {/* Individual Grocery Cards */}
        {groceriesWithPrices.some(grocery => grocery.prices.some(price => price.isEstimated)) && (
          <Box sx={{ p: 2, bgcolor: 'info.light', borderRadius: 1, mb: 3, display: 'flex', alignItems: 'center' }}>
            <InfoIcon sx={{ mr: 1 }} color="info" />
            <Typography variant="body2">
              Some prices are estimated using advanced algorithms when official data isn't available.
            </Typography>
          </Box>
        )}
        {groceriesWithPrices.map((grocery) => {
          const lowestPriceSupermarket = getLowestPriceSupermarket(grocery.prices);
          
          return (
            <Accordion key={grocery.id} sx={{ mb: 2 }}>
              <AccordionSummary 
                expandIcon={<ExpandMoreIcon />}
                aria-controls={`panel-${grocery.id}-content`}
                id={`panel-${grocery.id}-header`}
              >
                <Box display="flex" justifyContent="space-between" alignItems="center" width="100%" pr={2}>
                  <Typography variant="h6" component="div">
                    {grocery.name} {grocery.quantity > 1 && `(${grocery.quantity} ${formatUnitLabel(grocery)})`}
                  </Typography>
                  <Box display="flex" alignItems="center">
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
                          label="Lowest" 
                          size="small" 
                          color="success" 
                          sx={{ ml: 1 }}
                        />
                      </Box>
                    )}
                    <IconButton 
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveGrocery(grocery.id);
                      }} 
                      size="small"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Box>
              </AccordionSummary>
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
                          <TableCell>Supermarket</TableCell>
                          <TableCell align="right">Price</TableCell>
                          <TableCell align="right">Unit Price</TableCell>
                          <TableCell align="right">Est. Prices</TableCell>
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
                            <TableCell align="right">
                              {price.isEstimated ? (
                                <Tooltip title="Price estimated using algorithms">
                                  <Chip icon={<InfoIcon />} label="Estimated" size="small" color="info" />
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

      {/* Product List Dialog */}
      <Dialog
        open={productDialogOpen}
        onClose={handleCloseProductDialog}
        maxWidth="md"
        fullWidth
      >
        {selectedSupermarket && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar 
                    src={getSupermarketLogo(selectedSupermarket.supermarketName)} 
                    alt={selectedSupermarket.supermarketName}
                    sx={{ width: 32, height: 32, mr: 2 }}
                  />
                  <Typography variant="h6">
                    {selectedSupermarket.supermarketName}
                  </Typography>
                </Box>
                <IconButton onClick={handleCloseProductDialog} size="small">
                  <CloseIcon />
                </IconButton>
              </Box>
            </DialogTitle>
            <DialogContent dividers>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="body1" color="text.secondary">
                  {selectedSupermarket.productCount} of {groceriesWithPrices.length} items found
                </Typography>
                <Typography variant="body1">
                  Total: {formatCurrency(selectedSupermarket.totalPrice)}
                </Typography>
              </Box>
              
              {selectedSupermarket.saleCount > 0 && (
                <Box sx={{ 
                  mb: 2, 
                  p: 1, 
                  bgcolor: 'secondary.light', 
                  borderRadius: 1,
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  <LocalOfferIcon sx={{ mr: 1 }} color="secondary" />
                  <Typography variant="body2">
                    You save {formatCurrency(selectedSupermarket.totalSavings)} on {selectedSupermarket.saleCount} items
                  </Typography>
                </Box>
              )}
              
              <Divider sx={{ mb: 2 }} />
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
                        secondary={
                          price.isEstimated ? (
                            <Tooltip title="Price estimated using algorithms">
                              <Chip icon={<InfoIcon />} label="Estimated" size="small" color="info" sx={{ mt: 0.5 }} />
                            </Tooltip>
                          ) : null
                        }
                      />
                      <Box>
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
                                display: 'block',
                                textAlign: 'right'
                              }}
                            >
                              {price.regularPrice && formatCurrency(price.regularPrice)}
                            </Typography>
                          </Box>
                        ) : (
                          formatCurrency(price.price)
                        )}
                        {displayUnitPrice(price, grocery) && (
                          <Typography variant="caption" sx={{ display: 'block', textAlign: 'right' }}>
                            {displayUnitPrice(price, grocery)}
                          </Typography>
                        )}
                      </Box>
                    </ListItem>
                  );
                }).filter(Boolean)}
              </List>
            </DialogContent>
            <DialogActions>
              <Button 
                onClick={handleShareSupermarketList}
                variant="contained" 
                startIcon={<ShareIcon />}
                color="primary"
              >
                Share List
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default GroceryComparison; 