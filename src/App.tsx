import React, { useState } from 'react';
import { Container, Typography, Box, AppBar, Toolbar, Paper, Button, Badge, Tabs, Tab } from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import SearchIcon from '@mui/icons-material/Search';
import ListAltIcon from '@mui/icons-material/ListAlt';
import GroceryForm from './components/GroceryForm';
import GroceryComparison from './components/GroceryComparison';
import ProductSearch from './components/ProductSearch';
import Footer from './components/Footer';
import { Grocery } from './types';

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

const App: React.FC = () => {
  const [groceries, setGroceries] = useState<Grocery[]>([]);
  const [inputTabValue, setInputTabValue] = useState(0);

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

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column',
      minHeight: '100vh' // Make sure the container takes at least the full viewport height
    }}>
      <AppBar position="static" sx={{ mb: 4 }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            ComPear
          </Typography>
          <Box display="flex" alignItems="center">
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
          </Box>
        </Toolbar>
      </AppBar>
      
      <Container maxWidth="lg" sx={{ flex: '1 0 auto' }}> {/* This will push the footer down */}
        <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
          <Typography variant="h5" component="h1" gutterBottom>
            ComPear
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Add grocery items to compare prices across Dutch supermarkets. 
            Prices from supermarkets without APIs are estimated using AI.
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
      </Container>
      
      <Footer />
    </Box>
  );
};

export default App;
