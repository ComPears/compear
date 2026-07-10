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
import { GroceryWithPrices } from '../types';
import { supermarkets } from '../services/supermarketService';
import { useLanguage } from '../context/LanguageContext';
import { useCountry } from '../context/CountryContext';
import { optimizeShoppingPlan, DEFAULT_TRIP_PENALTY_EUR } from '../utils/shoppingOptimizer';

interface OptimalShoppingStrategyProps {
  groceriesWithPrices: GroceryWithPrices[];
}

const OptimalShoppingStrategy: React.FC<OptimalShoppingStrategyProps> = ({ groceriesWithPrices }) => {
  const { t } = useLanguage();
  const { country } = useCountry();
  
  // Find the logo URL for a supermarket by name
  const getSupermarketLogo = (name: string): string => {
    const supermarket = supermarkets.find(s => s.name === name);
    return supermarket?.logo || '';
  };

  // Format currency values
  const formatCurrency = (amount: number | string | undefined | null) => {
    const num = typeof amount === 'number' ? amount : Number(amount);
    if (isNaN(num)) return '-';
    return `€${num.toFixed(2)}`;
  };

  // Calculate the optimal shopping strategy
  const optimalStrategy = useMemo(() => {
    if (groceriesWithPrices.length === 0) return null;

    const items = groceriesWithPrices
      .filter((grocery) => grocery.prices.length > 0)
      .map((grocery) => ({
        name: grocery.name,
        options: grocery.prices.map((price) => ({
          store: price.supermarketName,
          price: price.price,
          onSale: price.onSale || false,
          regularPrice: price.regularPrice,
        })),
      }));

    const plan = optimizeShoppingPlan(items, DEFAULT_TRIP_PENALTY_EUR);
    if (!plan) return null;

    const supermarketsInStrategy = plan.stores
      .map((storePlan) => ({
        name: storePlan.store,
        logo: getSupermarketLogo(storePlan.store),
        items: storePlan.items,
        totalPrice: storePlan.totalPrice,
        totalSavings: storePlan.totalSavings,
      }))
      .sort((a, b) => b.items.length - a.items.length);

    return {
      supermarkets: supermarketsInStrategy,
      totalPrice: plan.totalPrice,
      tripPenalty: plan.tripPenalty,
      grandTotal: plan.grandTotal,
      totalSavings: supermarketsInStrategy.reduce((sum, s) => sum + s.totalSavings, 0),
      singleStorePrice: plan.singleStorePrice ?? plan.grandTotal,
      cheapestSingleStoreName: plan.singleStoreName ?? t('optimal.anySingleStore'),
      savings: plan.savingsVsSingleStore,
      storeCount: plan.storeCount,
    };
  }, [groceriesWithPrices, t]);

  // Handle sharing the shopping list
  const handleShare = () => {
    if (!optimalStrategy) return;

    // Create text to share
    let shareText = `🛒 ${t('optimal.shoppingListTitle')} 🛒\n\n`;
    
    // For each supermarket, list the items to buy
    optimalStrategy.supermarkets.forEach(supermarket => {
      shareText += `${t('optimal.at').replace('{store}', supermarket.name)}\n`;
      
      supermarket.items.forEach(item => {
        shareText += `- ${item.name}: ${formatCurrency(item.price)}`;
        if (item.onSale) {
          shareText += ` (ON SALE! Regular: ${formatCurrency(item.regularPrice || 0)})`;
        }
        shareText += '\n';
      });
      
      shareText += `${t('optimal.subtotal').replace('{amount}', formatCurrency(supermarket.totalPrice))}\n\n`;
    });
    
    shareText += `${t('optimal.total').replace('{amount}', formatCurrency(optimalStrategy.grandTotal))}\n`;
    if (optimalStrategy.tripPenalty > 0) {
      shareText += `Trip cost (${optimalStrategy.storeCount} stores): ${formatCurrency(optimalStrategy.tripPenalty)}\n`;
    }
    shareText += t(`optimal.madeWith.${country.code}`) || t('optimal.madeWith').replace('{country}', country.name);
    
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
        alert(t('clipboard.copied'));
      })
      .catch(err => {
        console.error('Failed to copy text: ', err);
        alert(t('clipboard.failed'));
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
            {t('optimal.title')}
          </Typography>
          <Button 
            variant="outlined" 
            startIcon={<ShareIcon />} 
            size="small" 
            sx={{ ml: 'auto' }}
            onClick={handleShare}
          >
            {t('optimal.shareList')}
          </Button>
        </Box>
        
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {t('optimal.description')}
        </Typography>
        
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 2, mb: 3 }}>
          {optimalStrategy.supermarkets.map(supermarket => (
            <Chip
              key={supermarket.name}
              avatar={<Avatar src={supermarket.logo} alt={supermarket.name} />}
              label={`${supermarket.name} (${t('optimal.itemCount').replace('{count}', supermarket.items.length.toString())})`}
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
                  {t('optimal.itemCount').replace('{count}', supermarket.items.length.toString())}
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
                              label={t('label.sale')} 
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
            {t('optimal.itemsTotal').replace('{amount}', formatCurrency(optimalStrategy.totalPrice))}
          </Typography>
          {optimalStrategy.tripPenalty > 0 && (
            <Typography variant="body2" color="text.secondary">
              {t('optimal.extraVisits')
                .replace('{count}', String(optimalStrategy.storeCount))
                .replace('{amount}', formatCurrency(optimalStrategy.tripPenalty))}
            </Typography>
          )}
          <Typography variant="subtitle1" sx={{ mt: 1 }}>
            {t('optimal.totalCost').replace('{cost}', formatCurrency(optimalStrategy.grandTotal))}
          </Typography>
          {optimalStrategy.savings > 0 && (
            <Typography variant="body2" color="primary" sx={{ mt: 1 }}>
              {t('optimal.savesVs')
                .replace('{amount}', formatCurrency(optimalStrategy.savings))
                .replace('{store}', optimalStrategy.cheapestSingleStoreName)}
            </Typography>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default OptimalShoppingStrategy; 