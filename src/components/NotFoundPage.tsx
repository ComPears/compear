import React from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  AppBar, 
  Toolbar, 
  Paper, 
  Button
} from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import Footer from './Footer';

/**
 * 404 Page Component displayed for invalid country codes
 */
const NotFoundPage: React.FC = () => {
  // Get the current invalid country code from URL
  const getCurrentPath = (): string => {
    try {
      const pathSegments = window.location.pathname.split('/').filter(Boolean);
      return pathSegments[0] || '';
    } catch (error) {
      return '';
    }
  };
  
  // Navigate to a valid country code
  const navigateToCountry = (countryCode: string) => {
    window.location.href = `/${countryCode}`;
  };
  
  // Display the current invalid country code
  const invalidCode = getCurrentPath();
  
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
        </Toolbar>
      </AppBar>
      
      <Container maxWidth="md" sx={{ flex: '1 0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Paper elevation={3} sx={{ p: 5, textAlign: 'center', width: '100%' }}>
          <ErrorOutlineIcon sx={{ fontSize: 80, color: 'error.main', mb: 2 }} />
          <Typography variant="h4" gutterBottom>
            404 - Country Not Found
          </Typography>
          <Typography variant="body1" paragraph>
            "{invalidCode}" is not a supported country code.
          </Typography>
          <Typography variant="body1" paragraph sx={{ mb: 4 }}>
            We currently only support the Netherlands, United Kingdom, and Germany.
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={() => navigateToCountry('nl')}
            >
              Go to Netherlands
            </Button>
            <Button 
              variant="outlined"
              onClick={() => navigateToCountry('uk')}
            >
              United Kingdom
            </Button>
            <Button 
              variant="outlined"
              onClick={() => navigateToCountry('de')}
            >
              Germany
            </Button>
          </Box>
        </Paper>
      </Container>
      
      <Footer />
    </Box>
  );
};

export default NotFoundPage; 