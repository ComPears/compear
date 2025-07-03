import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  IconButton,
  Avatar,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import ShareIcon from '@mui/icons-material/Share';
import { GroceryWithPrices, SupermarketPrice } from '../types';
import { supermarkets } from '../services/supermarketService';
import { useLanguage } from '../context/LanguageContext';
import { useCountry } from '../context/CountryContext';


interface CheapestDialogProps {
  open: boolean;
  onClose: () => void;
  groceries: GroceryWithPrices[];
}

// Helper interface for summary calculations (same as in GroceryComparison)
interface SupermarketSummary {
  supermarketName: string;
  totalPrice: number;
  productCount: number;
  saleCount: number;
  products: Record<string, SupermarketPrice>;
}

const CheapestDialog: React.FC<CheapestDialogProps> = ({ open, onClose, groceries }) => {
  const { t } = useLanguage();
  const { country } = useCountry();



  const formatCurrency = (amount: number | string | undefined | null) => {
    const num = typeof amount === 'number' ? amount : Number(amount);
    if (isNaN(num)) return '-';
    return `€${num.toFixed(2)}`;
  };

  // Find the logo URL for a supermarket by name
  const getSupermarketLogo = (name: string): string | undefined => {
    const supermarket = supermarkets.find(s => s.name === name);
    return supermarket?.logo;
  };

  // Calculate summary of prices across all supermarkets
  const supermarketSummaries = React.useMemo(() => {
    if (groceries.length === 0) return [];

    // Get all unique supermarket names from all grocery prices
    const supermarketNamesSet = new Set<string>();
    groceries.forEach(grocery => {
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
      products: {}
    }));
    
    // Calculate totals for each supermarket
    groceries.forEach(grocery => {
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
          }
        }
      });
    });

    // Sort summaries: first by completeness (all products first), then by price
    return summaries.sort((a, b) => {
      // First, sort by completeness (supermarkets with all products come first)
      const aHasAllProducts = a.productCount === groceries.length;
      const bHasAllProducts = b.productCount === groceries.length;
      
      if (aHasAllProducts && !bHasAllProducts) return -1;
      if (!aHasAllProducts && bHasAllProducts) return 1;
      
      // If both have same completeness, sort by price (cheapest first)
      return a.totalPrice - b.totalPrice;
    });
  }, [groceries]);

  // Get the cheapest supermarket that has all products
  const cheapestSupermarket = React.useMemo(() => {
    const supermarketsWithAllProducts = supermarketSummaries.filter(summary => 
      summary.productCount === groceries.length
    );
    return supermarketsWithAllProducts.length > 0 ? supermarketsWithAllProducts[0] : null;
  }, [supermarketSummaries, groceries]);

  // Handle sharing the cheapest supermarket's shopping list
  const handleShare = () => {
    if (!cheapestSupermarket || cheapestSupermarket.productCount !== groceries.length) return;

    // Create text to share
    let shareText = `🛒 Cheapest Supermarket: ${cheapestSupermarket.supermarketName} 🛒\n\n`;
    shareText += `Total Price: ${formatCurrency(cheapestSupermarket.totalPrice)}\n`;
    shareText += `Items: ${cheapestSupermarket.productCount}/${groceries.length}\n\n`;
    
    // List all items
    groceries.forEach(grocery => {
      const price = cheapestSupermarket.products[grocery.id];
      if (price) {
        shareText += `- ${grocery.name}: ${formatCurrency(price.price)}`;
        if (price.onSale) {
          shareText += ` (ON SALE!)`;
        }
        shareText += '\n';
      }
    });
    
    shareText += `\nMade with ComPear for ${country.name}`;
    
    // Share using the Web Share API if available
    if (navigator.share) {
      navigator.share({
        title: 'My ComPear Shopping List',
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
        alert('Failed to copy to clipboard');
      });
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 }
      }}
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ShoppingCartIcon color="primary" />
          <Typography variant="h6" component="div">
            Cheapest Supermarket
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        {groceries.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body1" color="text.secondary">
              Add some groceries to your list to see the cheapest supermarket!
            </Typography>
          </Box>
        ) : supermarketSummaries.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body1" color="text.secondary">
              No supermarkets found with any of your items. Try adding more groceries or check individual item prices.
            </Typography>
          </Box>
        ) : (
          <Box>
            {/* Winner Section - Only show if a supermarket has all products */}
            {cheapestSupermarket && cheapestSupermarket.productCount === groceries.length && (
              <Paper 
                elevation={2} 
                sx={{ 
                  p: 3, 
                  mb: 3, 
                  background: 'linear-gradient(135deg, #4caf50 0%, #66bb6a 100%)',
                  color: 'white'
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar 
                    src={getSupermarketLogo(cheapestSupermarket.supermarketName)} 
                    alt={cheapestSupermarket.supermarketName}
                    sx={{ width: 48, height: 48, mr: 2, border: '2px solid white' }}
                  />
                  <Box>
                    <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                      🏆 {cheapestSupermarket.supermarketName}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Best overall price for your {groceries.length} items
                    </Typography>
                  </Box>
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                      {formatCurrency(cheapestSupermarket.totalPrice)}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Total for all items
                    </Typography>
                  </Box>
                  
                  <Box sx={{ textAlign: 'right' }}>
                    {cheapestSupermarket.saleCount > 0 && (
                      <Chip 
                        icon={<LocalOfferIcon />} 
                        label={`${cheapestSupermarket.saleCount} on sale`}
                        sx={{ 
                          backgroundColor: 'rgba(255,255,255,0.2)', 
                          color: 'white',
                          mb: 1
                        }}
                      />
                    )}
                    <Button
                      variant="outlined"
                      startIcon={<ShareIcon />}
                      size="small"
                      onClick={handleShare}
                      sx={{
                        color: 'white',
                        borderColor: 'rgba(255,255,255,0.5)',
                        '&:hover': {
                          borderColor: 'white',
                          backgroundColor: 'rgba(255,255,255,0.1)'
                        }
                      }}
                    >
                      Share List
                    </Button>
                  </Box>
                </Box>
              </Paper>
            )}

            {/* Item Details */}
            {cheapestSupermarket && cheapestSupermarket.productCount === groceries.length && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Item Details at {cheapestSupermarket.supermarketName}
                </Typography>
                
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Item</TableCell>
                        <TableCell align="right">Price</TableCell>
                        <TableCell align="right">Size</TableCell>
                        <TableCell align="center">Sale</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {groceries.map((grocery) => {
                        const price = cheapestSupermarket.products[grocery.id];
                        return (
                          <TableRow key={grocery.id}>
                            <TableCell>
                              <Typography variant="body2">
                                {grocery.name}
                              </Typography>
                            </TableCell>
                            <TableCell align="right">
                              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                {price ? formatCurrency(price.price) : '-'}
                              </Typography>
                            </TableCell>
                            <TableCell align="right">
                              <Typography variant="body2" color="text.secondary">
                                {price?.size || '-'}
                              </Typography>
                            </TableCell>
                            <TableCell align="center">
                              {price?.onSale ? (
                                <Chip 
                                  icon={<LocalOfferIcon />} 
                                  label="Sale" 
                                  size="small" 
                                  color="secondary"
                                />
                              ) : (
                                <Typography variant="body2" color="text.secondary">
                                  -
                                </Typography>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onClose} color="inherit">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CheapestDialog; 