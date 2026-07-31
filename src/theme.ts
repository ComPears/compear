import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#0b6e4f',
      light: '#2a9d7a',
      dark: '#084c37',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#c45c26',
      light: '#e07a45',
      dark: '#9a4214',
      contrastText: '#ffffff',
    },
    success: {
      main: '#0b7a4b',
      light: '#34b87a',
      dark: '#055c38',
    },
    error: {
      main: '#c0392b',
    },
    warning: {
      main: '#d97706',
    },
    info: {
      main: '#0e7490',
    },
    background: {
      default: '#eef4f0',
      paper: '#ffffff',
    },
    text: {
      primary: '#14231c',
      secondary: '#4a5c52',
    },
  },
  typography: {
    fontFamily: '"Figtree", "Helvetica Neue", sans-serif',
    h1: {
      fontFamily: '"Fraunces", Georgia, serif',
      fontWeight: 650,
      letterSpacing: '-0.03em',
    },
    h2: {
      fontFamily: '"Fraunces", Georgia, serif',
      fontWeight: 650,
      letterSpacing: '-0.02em',
    },
    h3: {
      fontFamily: '"Fraunces", Georgia, serif',
      fontWeight: 600,
    },
    h4: {
      fontFamily: '"Fraunces", Georgia, serif',
      fontWeight: 600,
    },
    h5: {
      fontFamily: '"Fraunces", Georgia, serif',
      fontWeight: 600,
    },
    h6: {
      fontFamily: '"Fraunces", Georgia, serif',
      fontWeight: 600,
    },
    button: {
      fontWeight: 650,
    },
  },
  shape: {
    borderRadius: 10,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          textTransform: 'none',
          fontWeight: 650,
          minHeight: 44,
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          boxShadow: 'none',
          border: '1px solid rgba(20, 35, 28, 0.08)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          backgroundImage: 'none',
        },
        elevation1: {
          boxShadow: 'none',
          border: '1px solid rgba(20, 35, 28, 0.08)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
          borderRadius: 0,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 600,
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          minWidth: 44,
          minHeight: 44,
        },
      },
    },
    MuiToggleButton: {
      styleOverrides: {
        root: {
          minHeight: 44,
        },
      },
    },
  },
});

export default theme;
