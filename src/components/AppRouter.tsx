import React, { lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { CountryLayout } from './CountryLayout';
import { RouteLoadingBoundary } from './RouteLoadingBoundary';

const App = lazy(() => import('../App'));
const NotFoundPage = lazy(() => import('./NotFoundPage'));
const SearchPage = lazy(() =>
  import('../pages/SearchPage').then(({ SearchPage }) => ({ default: SearchPage }))
);
const ProductPage = lazy(() =>
  import('../pages/ProductPage').then(({ ProductPage }) => ({ default: ProductPage }))
);
const BasketPage = lazy(() =>
  import('../pages/BasketPage').then(({ BasketPage }) => ({ default: BasketPage }))
);
const ReceiptPage = lazy(() =>
  import('../pages/ReceiptPage').then(({ ReceiptPage }) => ({ default: ReceiptPage }))
);
const StoreLocatorPage = lazy(() =>
  import('../pages/StoreLocatorPage').then(({ StoreLocatorPage }) => ({
    default: StoreLocatorPage,
  }))
);
const SharedListPage = lazy(() =>
  import('../pages/SharedListPage').then(({ SharedListPage }) => ({ default: SharedListPage }))
);

const AppRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <RouteLoadingBoundary>
        <Routes>
          <Route path="/" element={<Navigate to="/nl" replace />} />
          <Route path="/:countryCode" element={<CountryLayout />}>
            <Route index element={<App />} />
            <Route path="search" element={<SearchPage />} />
            <Route path="product/:id" element={<ProductPage />} />
            <Route path="basket" element={<BasketPage />} />
            <Route path="stores" element={<StoreLocatorPage />} />
            <Route path="shared/:listId" element={<SharedListPage />} />
            <Route path="receipts" element={<ReceiptPage />} />
          </Route>
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </RouteLoadingBoundary>
    </BrowserRouter>
  );
};

export default AppRouter;
