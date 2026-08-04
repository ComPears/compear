import React, { Component, Suspense } from 'react';
import { Alert, Box, Button, CircularProgress } from '@mui/material';

interface RouteLoadingBoundaryProps {
  children: React.ReactNode;
}

interface RouteLoadingBoundaryState {
  error: Error | null;
}

export class RouteLoadingBoundary extends Component<
  RouteLoadingBoundaryProps,
  RouteLoadingBoundaryState
> {
  state: RouteLoadingBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): RouteLoadingBoundaryState {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <Box sx={{ maxWidth: 720, mx: 'auto', p: 3 }}>
          <Alert
            severity="error"
            action={
              <Button color="inherit" size="small" onClick={() => window.location.reload()}>
                Reload
              </Button>
            }
          >
            Could not load this page.
          </Alert>
        </Box>
      );
    }

    return (
      <Suspense
        fallback={
          <Box
            role="status"
            aria-label="Loading…"
            sx={{ display: 'flex', justifyContent: 'center', py: 6 }}
          >
            <CircularProgress />
          </Box>
        }
      >
        {this.props.children}
      </Suspense>
    );
  }
}
