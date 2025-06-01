import React, { useMemo } from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  Chip,
  Avatar,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  Divider
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import RouteIcon from '@mui/icons-material/Route';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import ShareIcon from '@mui/icons-material/Share';
import { GroceryWithPrices, SupermarketPrice } from '../types';
import { supermarkets } from '../services/supermarketService';

interface OptimalShoppingStrategyProps {
  groceriesWithPrices: GroceryWithPrices[];
}

// Represents one supermarket in the optimal shopping strategy
interface SupermarketInStrategy {
  name: string;
  logo: string;
  items: {
    name: string;
    price: number;
    onSale: boolean;
    regularPrice?: number;
  }[];
  totalPrice: number;
  totalSavings: number;
}

const OptimalShoppingStrategy: React.FC<OptimalShoppingStrategyProps> = ({ groceriesWithPrices }) => {
  
  // Find the logo URL for a supermarket by name
  const getSupermarketLogo = (name: string): string => {
    const supermarket = supermarkets.find(s => s.name === name);
    return supermarket?.logo || '';
  };

  // Format currency values
  const formatCurrency = (amount: number) => {
    return `€${amount.toFixed(2)}`;
  };

  // Calculate the optimal shopping strategy
  const optimalStrategy = useMemo(() => {
    if (groceriesWithPrices.length === 0) return null;

    // Store groceries by their optimal supermarket
    const groceriesByOptimalStore: Record<string, {
      grocery: GroceryWithPrices;
      price: SupermarketPrice;
    }[]> = {};

    // For each grocery, find the cheapest supermarket
    groceriesWithPrices.forEach(grocery => {
      if (grocery.prices.length === 0) return;

      // Find cheapest price for this grocery
      const sortedPrices = [...grocery.prices].sort((a, b) => a.price - b.price);
      const cheapestPrice = sortedPrices[0];
      
      // Add to the appropriate supermarket group
      if (!groceriesByOptimalStore[cheapestPrice.supermarketName]) {
        groceriesByOptimalStore[cheapestPrice.supermarketName] = [];
      }
      
      groceriesByOptimalStore[cheapestPrice.supermarketName].push({
        grocery,
        price: cheapestPrice
      });
    });

    // Calculate total price and savings for each supermarket
    const supermarketsInStrategy: SupermarketInStrategy[] = [];
    
    Object.keys(groceriesByOptimalStore).forEach(supermarketName => {
      const items = groceriesByOptimalStore[supermarketName];
      let totalPrice = 0;
      let totalSavings = 0;
      
      const formattedItems = items.map(item => {
        const { grocery, price } = item;
        totalPrice += price.price;
        
        // Calculate savings if on sale
        if (price.onSale && price.regularPrice) {
          totalSavings += price.regularPrice - price.price;
        }
        
        return {
          name: grocery.name,
          price: price.price,
          onSale: price.onSale || false,
          regularPrice: price.regularPrice
        };
      });
      
      supermarketsInStrategy.push({
        name: supermarketName,
        logo: getSupermarketLogo(supermarketName),
        items: formattedItems,
        totalPrice,
        totalSavings
      });
    });
    
    // Sort supermarkets by number of items (most items first)
    supermarketsInStrategy.sort((a, b) => b.items.length - a.items.length);
    
    // Calculate total price of the optimal strategy
    const totalPrice = supermarketsInStrategy.reduce(
      (sum, supermarket) => sum + supermarket.totalPrice, 
      0
    );
    
    const totalSavings = supermarketsInStrategy.reduce(
      (sum, supermarket) => sum + supermarket.totalSavings, 
      0
    );
    
    // Calculate the price if buying everything at the cheapest single store
    let cheapestSingleStorePrice = Infinity;
    let cheapestSingleStoreName = '';
    
    // For each supermarket, calculate total price of all items
    supermarkets.forEach(supermarket => {
      let singleStorePrice = 0;
      let canProvideAllItems = true;
      
      groceriesWithPrices.forEach(grocery => {
        const price = grocery.prices.find(p => p.supermarketName === supermarket.name);
        if (price) {
          singleStorePrice += price.price;
        } else {
          canProvideAllItems = false;
        }
      });
      
      if (canProvideAllItems && singleStorePrice < cheapestSingleStorePrice) {
        cheapestSingleStorePrice = singleStorePrice;
        cheapestSingleStoreName = supermarket.name;
      }
    });
    
    // If no single store can provide all items, use the total price as a fallback
    if (cheapestSingleStorePrice === Infinity) {
      cheapestSingleStorePrice = totalPrice;
      cheapestSingleStoreName = 'any single store';
    }
    
    // Calculate savings compared to single store approach
    const savings = cheapestSingleStorePrice - totalPrice;
    
    return {
      supermarkets: supermarketsInStrategy,
      totalPrice,
      totalSavings,
      singleStorePrice: cheapestSingleStorePrice,
      cheapestSingleStoreName,
      savings
    };
  }, [groceriesWithPrices]);

  // Handle sharing the shopping list
  const handleShare = () => {
    if (!optimalStrategy) return;

    // Create text to share
    let shareText = "🛒 My ComPear Optimal Shopping List 🛒\n\n";
    
    // For each supermarket, list the items to buy
    optimalStrategy.supermarkets.forEach(supermarket => {
      shareText += `At ${supermarket.name}:\n`;
      
      supermarket.items.forEach(item => {
        shareText += `- ${item.name}: ${formatCurrency(item.price)}`;
        if (item.onSale) {
          shareText += ` (ON SALE! Regular: ${formatCurrency(item.regularPrice || 0)})`;
        }
        shareText += '\n';
      });
      
      shareText += `Subtotal: ${formatCurrency(supermarket.totalPrice)}\n\n`;
    });
    
    shareText += `Total: ${formatCurrency(optimalStrategy.totalPrice)}\n`;
    shareText += "Made with ComPear - Compare grocery prices across Dutch supermarkets!";
    
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
        alert('Could not copy to clipboard. Please share manually.');
      });
  };

  if (!optimalStrategy || groceriesWithPrices.length === 0) {
    return null;
  }

  return (
    <Card sx={{ mb: 4 }}>
      <CardContent>
        <Box display="flex" alignItems="center" mb={2}>
          <RouteIcon sx={{ mr: 1.5 }} color="primary" />
          <Typography variant="h6" component="div">
            Optimal Shopping Strategy
          </Typography>
          <Button 
            variant="outlined" 
            startIcon={<ShareIcon />} 
            size="small" 
            sx={{ ml: 'auto' }}
            onClick={handleShare}
          >
            Share List
          </Button>
        </Box>
        
        <Typography variant="body2" color="text.secondary" gutterBottom>
          The optimal shopping strategy for buying items across multiple stores
        </Typography>
        
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 2, mb: 3 }}>
          {optimalStrategy.supermarkets.map(supermarket => (
            <Chip
              key={supermarket.name}
              avatar={<Avatar src={supermarket.logo} alt={supermarket.name} />}
              label={`${supermarket.name} (${supermarket.items.length} items)`}
              color="primary"
              variant="outlined"
            />
          ))}
        </Box>
        
        <Divider sx={{ my: 2 }} />
        
        {optimalStrategy.supermarkets.map((supermarket, index) => (
          <Accordion key={supermarket.name} defaultExpanded={index === 0}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                <Avatar src={supermarket.logo} alt={supermarket.name} sx={{ mr: 2 }} />
                <Typography variant="subtitle1">{supermarket.name}</Typography>
                <Typography variant="body2" sx={{ ml: 2, color: 'text.secondary' }}>
                  {supermarket.items.length} items
                </Typography>
                <Typography variant="subtitle1" sx={{ ml: 'auto' }}>
                  {formatCurrency(supermarket.totalPrice)}
                </Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <List dense>
                {supermarket.items.map(item => (
                  <ListItem key={item.name}>
                    <ListItemText 
                      primary={item.name} 
                      secondary={
                        item.onSale ? (
                          <Box component="span">
                            {formatCurrency(item.price)}
                            <Chip 
                              icon={<LocalOfferIcon />} 
                              label="Sale" 
                              size="small" 
                              color="secondary" 
                              sx={{ ml: 1 }}
                            />
                            <Typography 
                              variant="caption" 
                              sx={{ 
                                textDecoration: 'line-through', 
                                color: 'text.secondary',
                                ml: 1
                              }}
                            >
                              {formatCurrency(item.regularPrice || 0)}
                            </Typography>
                          </Box>
                        ) : formatCurrency(item.price)
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </AccordionDetails>
          </Accordion>
        ))}
        
        <Box sx={{ mt: 3, p: 2, bgcolor: 'success.light', borderRadius: 2 }}>
          <Typography variant="subtitle1">
            Total Cost: {formatCurrency(optimalStrategy.totalPrice)}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default OptimalShoppingStrategy; 