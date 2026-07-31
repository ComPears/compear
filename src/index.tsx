import React from 'react';
import ReactDOM from 'react-dom/client';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import './index.css';
import reportWebVitals from './reportWebVitals';
import theme from './theme';
import AppRouter from './components/AppRouter';

if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      /* PWA optional */
    });
  });
}

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppRouter />
    </ThemeProvider>
  </React.StrictMode>
);

reportWebVitals((metric) => {
  if (!import.meta.env.PROD) return;
  const apiBase = import.meta.env.VITE_API_URL || 'https://api.compears.shop';
  const body = JSON.stringify({
    name: metric.name,
    value: metric.value,
    rating: metric.rating,
    path: window.location.pathname,
  });
  if (navigator.sendBeacon) {
    navigator.sendBeacon(`${apiBase}/health/vitals`, new Blob([body], { type: 'application/json' }));
  } else {
    void fetch(`${apiBase}/health/vitals`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body, keepalive: true });
  }
});
