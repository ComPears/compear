import React from 'react';
import { Box, Typography, Container } from '@mui/material';
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
        borderTop: (theme) => `1px solid ${theme.palette.grey[300]}`
      }}
    >
      <Container maxWidth="lg">
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