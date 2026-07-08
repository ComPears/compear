import React from 'react';
import { Box, Typography, Container, Link } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import FavoriteIcon from '@mui/icons-material/Favorite';

const Footer: React.FC = () => {
  return (
    <Box
      component="footer"
      sx={{
        py: 3,
        px: 2,
        mt: 'auto',
        backgroundColor: (theme) => theme.palette.grey[100],
        borderTop: (theme) => `1px solid ${theme.palette.grey[300]}`,
      }}
    >
      <Container maxWidth="lg">
        <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 1 }}>
          Compare grocery prices across Europe —{' '}
          <Link component={RouterLink} to="/nl" color="inherit" underline="hover">NL</Link>
          {' · '}
          <Link component={RouterLink} to="/de" color="inherit" underline="hover">DE</Link>
          {' · '}
          <Link component={RouterLink} to="/uk" color="inherit" underline="hover">UK</Link>
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          align="center"
          sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 0.5 }}
        >
          Made with
          <FavoriteIcon color="error" fontSize="small" sx={{ mx: 0.5 }} />
        </Typography>
      </Container>
    </Box>
  );
};

export default Footer; 