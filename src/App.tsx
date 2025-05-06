import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  AppBar, 
  Toolbar, 
  Paper, 
  Button, 
  Badge, 
  Tabs, 
  Tab,
  MenuItem,
  Select,
  FormControl,
  SelectChangeEvent,
  Divider,
  Alert
} from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import SearchIcon from '@mui/icons-material/Search';
import ListAltIcon from '@mui/icons-material/ListAlt';
import LanguageIcon from '@mui/icons-material/Language';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import GroceryForm from './components/GroceryForm';
import GroceryComparison from './components/GroceryComparison';
import ProductSearch from './components/ProductSearch';
import Footer from './components/Footer';
import NotFoundPage from './components/NotFoundPage';
import { Grocery } from './types';
import { useCountry, CountryCode, countries } from './context/CountryContext';

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
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

// Create a wrapper component to safely use the country context
const CountryAwareApp: React.FC = () => {
  const { country, setCountry, isCountryAvailable } = useCountry();
  
  // Check if current URL has a valid country code
  const [isValidCountry, setIsValidCountry] = useState(true);
  
  useEffect(() => {
    // Check if URL has valid country code
    const validateCountryCode = () => {
      try {
        const pathSegments = window.location.pathname.split('/').filter(Boolean);
        const countryCode = pathSegments[0];
        
        if (!countryCode) {
          // No country code in URL, we'll handle this by redirecting to default
          setIsValidCountry(true);
          return;
        }
        
        if (['nl', 'uk', 'de'].includes(countryCode)) {
          setIsValidCountry(true);
        } else {
          // Invalid country code
          setIsValidCountry(false);
          
          // Make sure we don't update the URL again, which could cause loops
          window.history.replaceState(null, '', `/${countryCode}`);
        }
      } catch (error) {
        console.warn('Error validating country code:', error);
        setIsValidCountry(true); // Default to valid on error
      }
    };
    
    validateCountryCode();
    
    // Listen for URL changes
    const handleUrlChange = () => {
      validateCountryCode();
    };
    
    window.addEventListener('popstate', handleUrlChange);
    
    return () => {
      window.removeEventListener('popstate', handleUrlChange);
    };
  }, []);
  
  // If invalid country code, show 404 page
  if (!isValidCountry) {
    return <NotFoundPage />;
  }
  
  return <AppContent country={country} setCountry={setCountry} isCountryAvailable={isCountryAvailable} />;
};

// Main app component that takes country context as props
interface AppContentProps {
  country: { code: CountryCode; name: string; available: boolean };
  setCountry: (code: CountryCode) => void;
  isCountryAvailable: (code: CountryCode) => boolean;
}

const AppContent: React.FC<AppContentProps> = ({ country, setCountry, isCountryAvailable }) => {
  const [groceries, setGroceries] = useState<Grocery[]>([]);
  const [inputTabValue, setInputTabValue] = useState(0);

  // Effect to change the URL based on the selected country
  useEffect(() => {
    // Don't modify the URL if it's already correct to prevent loops
    if (window.location.pathname.startsWith(`/${country.code}`)) {
      return;
    }
    
    // Just replace with the country code, don't preserve the rest of the path
    // to avoid issues with invalid paths like /be
    window.history.replaceState(null, '', `/${country.code}`);
  }, [country.code]);

  // Effect to detect URL changes and update country accordingly
  useEffect(() => {
    const handleUrlChange = () => {
      const pathSegments = window.location.pathname.split('/').filter(Boolean);
      const countryCode = pathSegments[0];
      
      // Only process valid country codes
      if (countryCode && ['nl', 'uk', 'de'].includes(countryCode) && countryCode !== country.code) {
        setCountry(countryCode as CountryCode);
      }
    };

    window.addEventListener('popstate', handleUrlChange);
    
    // Initial check on mount
    handleUrlChange();
    
    return () => {
      window.removeEventListener('popstate', handleUrlChange);
    };
  }, [setCountry, country.code]);

  const handleAddGrocery = (newGrocery: Grocery) => {
    setGroceries(prevGroceries => [...prevGroceries, newGrocery]);
  };

  const handleRemoveGrocery = (id: string) => {
    setGroceries(prevGroceries => prevGroceries.filter(grocery => grocery.id !== id));
  };

  const handleClearAll = () => {
    setGroceries([]);
  };

  const handleInputTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setInputTabValue(newValue);
  };

  const handleCountryChange = (event: SelectChangeEvent<string>) => {
    setCountry(event.target.value as CountryCode);
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column',
      minHeight: '100vh'
    }}>
      <AppBar position="static" sx={{ mb: 4 }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            ComPear
          </Typography>
          <Box display="flex" alignItems="center">
            <FormControl sx={{ minWidth: 120, mr: 2 }} size="small">
              <Select
                value={country.code}
                onChange={handleCountryChange}
                displayEmpty
                sx={{ 
                  color: 'white',
                  '.MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.5)' },
                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'white' },
                  '.MuiSvgIcon-root': { color: 'white' }
                }}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <LanguageIcon sx={{ mr: 1 }} />
                    {countries.find(c => c.code === selected)?.name || 'Country'}
                  </Box>
                )}
              >
                {countries.map((option) => (
                  <MenuItem key={option.code} value={option.code}>
                    {option.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <Divider orientation="vertical" flexItem sx={{ bgcolor: 'rgba(255, 255, 255, 0.3)', mr: 2 }} />
            
            {country.available && (
              <>
                <Badge badgeContent={groceries.length} color="secondary" sx={{ mr: 2 }}>
                  <ShoppingCartIcon />
                </Badge>
                {groceries.length > 0 && (
                  <Button 
                    color="inherit" 
                    startIcon={<DeleteSweepIcon />} 
                    onClick={handleClearAll}
                  >
                    Clear All
                  </Button>
                )}
              </>
            )}
          </Box>
        </Toolbar>
      </AppBar>
      
      <Container maxWidth="lg" sx={{ flex: '1 0 auto' }}>
        {!country.available ? (
          <Paper elevation={3} sx={{ p: 5, mb: 4, textAlign: 'center' }}>
            <Typography variant="h4" gutterBottom>
              Coming Soon
            </Typography>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              We will be available in {country.name} soon!
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph sx={{ mt: 3 }}>
              Currently, only Netherlands is supported.
            </Typography>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={() => setCountry('nl')}
              sx={{ mt: 2 }}
            >
              Switch to Netherlands
            </Button>
          </Paper>
        ) : (
          <>
            <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
              <Typography variant="h5" component="h1" gutterBottom>
                ComPear
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                Add grocery items to compare prices across {country.name} supermarkets. 
                Prices from supermarkets without APIs are estimated using advanced algorithms.
              </Typography>
              
              <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs 
                  value={inputTabValue} 
                  onChange={handleInputTabChange}
                  aria-label="input method tabs"
                >
                  <Tab icon={<SearchIcon />} label="Product Search" />
                  <Tab icon={<ListAltIcon />} label="Manual Entry" />
                </Tabs>
              </Box>
              
              <TabPanel value={inputTabValue} index={0}>
                <ProductSearch onAddGrocery={handleAddGrocery} />
              </TabPanel>
              
              <TabPanel value={inputTabValue} index={1}>
                <GroceryForm onAddGrocery={handleAddGrocery} />
              </TabPanel>
            </Paper>
            
            <GroceryComparison 
              groceries={groceries} 
              onRemoveGrocery={handleRemoveGrocery} 
            />
          </>
        )}
      </Container>
      
      <Footer />
    </Box>
  );
};

// Export the wrapper component as the default export
const App: React.FC = () => {
  try {
    return <CountryAwareApp />;
  } catch (error) {
    console.error('Error rendering with country context:', error);
    // Fallback UI if country context fails
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          An error occurred loading application context. Using default settings.
        </Alert>
        <AppContent 
          country={{ code: 'nl', name: 'Netherlands', available: true }}
          setCountry={() => {}}
          isCountryAvailable={() => true}
        />
      </Box>
    );
  }
};

export default App;
