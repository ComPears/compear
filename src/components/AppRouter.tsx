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
const CategoryLandingPage = lazy(() =>
  import('../pages/CategoryLandingPage').then(({ CategoryLandingPage }) => ({ default: CategoryLandingPage }))
);
const TrustPage = lazy(() =>
  import('../pages/TrustPage').then(({ TrustPage }) => ({ default: TrustPage }))
);
const PrivacyPage = lazy(() =>
  import('../pages/PrivacyPage').then(({ PrivacyPage }) => ({ default: PrivacyPage }))
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
const ShoppingBriefPage = lazy(() => import('../pages/ShoppingBriefPage').then(module => ({ default: module.ShoppingBriefPage })));
const GuidesPage = lazy(() => import('../pages/GuidesPage').then(module => ({ default: module.GuidesPage })));
const GuidePage = lazy(() => import('../pages/GuidePage').then(module => ({ default: module.GuidePage })));
const AlertsPage = lazy(() => import('../pages/AlertsPage').then(module => ({ default: module.AlertsPage })));
const DepartmentPage = lazy(() => import('../pages/ExplorePages').then(module => ({ default: module.DepartmentPage })));
const DealsPage = lazy(() => import('../pages/ExplorePages').then(module => ({ default: module.DealsPage })));
const JournalPage = lazy(() => import('../pages/ExplorePages').then(module => ({ default: module.JournalPage })));
const ShoppingSpacePage = lazy(() => import('../pages/ExplorePages').then(module => ({ default: module.ShoppingSpacePage })));

const AppRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <RouteLoadingBoundary>
        <Routes>
          <Route path="/" element={<Navigate to="/nl" replace />} />
          <Route path="/:countryCode" element={<CountryLayout />}>
            <Route index element={<App />} />
            <Route path="search" element={<SearchPage />} />
            <Route path="brief" element={<ShoppingBriefPage />} />
            <Route path="guides" element={<GuidesPage />} />
            <Route path="guides/:guideSlug" element={<GuidePage />} />
            <Route path="departments/:departmentSlug" element={<DepartmentPage />} />
            <Route path="deals" element={<DealsPage />} />
            <Route path="journal" element={<JournalPage />} />
            <Route path="journal/:articleSlug" element={<JournalPage />} />
            <Route path="space" element={<ShoppingSpacePage />} />
            <Route path="alerts" element={<AlertsPage />} />
            <Route path="alerts/:action" element={<AlertsPage />} />
            <Route path="product/:id" element={<ProductPage />} />
            <Route path="products/:slug" element={<ProductPage />} />
            <Route path="categories/:categorySlug" element={<CategoryLandingPage />} />
            <Route path="how-it-works" element={<TrustPage />} />
            <Route path="privacy" element={<PrivacyPage />} />
            <Route path="basket" element={<BasketPage />} />
            <Route path="stores" element={<StoreLocatorPage />} />
            <Route path="shared/:listId" element={<SharedListPage />} />
            <Route path="receipts" element={<ReceiptPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </RouteLoadingBoundary>
    </BrowserRouter>
  );
};

export default AppRouter;
