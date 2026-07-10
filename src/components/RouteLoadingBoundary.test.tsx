import React, { lazy } from 'react';
import { act, cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { RouteLoadingBoundary } from './RouteLoadingBoundary';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('RouteLoadingBoundary', () => {
  it('shows a loading state until a lazy route resolves', async () => {
    let resolveRoute!: (module: { default: React.ComponentType }) => void;
    const LazyRoute = lazy(
      () =>
        new Promise<{ default: React.ComponentType }>((resolve) => {
          resolveRoute = resolve;
        })
    );

    render(
      <RouteLoadingBoundary>
        <LazyRoute />
      </RouteLoadingBoundary>
    );

    expect(screen.getByRole('status', { name: 'Loading page' })).toBeInTheDocument();

    await act(async () => {
      resolveRoute({ default: () => <div>Loaded route</div> });
    });

    expect(screen.getByText('Loaded route')).toBeInTheDocument();
  });

  it('offers recovery when a route chunk fails', () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const BrokenRoute = () => {
      throw new Error('chunk failed');
    };

    render(
      <RouteLoadingBoundary>
        <BrokenRoute />
      </RouteLoadingBoundary>
    );

    expect(screen.getByText('This page could not be loaded.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Reload' })).toBeInTheDocument();
  });
});
