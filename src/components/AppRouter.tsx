import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { CountryLayout } from './CountryLayout';
import App from '../App';
import NotFoundPage from './NotFoundPage';
import { SearchPage } from '../pages/SearchPage';
import { ProductPage } from '../pages/ProductPage';
import { DealsPage } from '../pages/DealsPage';
import { BasketPage } from '../pages/BasketPage';
import { ReceiptPage } from '../pages/ReceiptPage';

const AppRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/nl" replace />} />
        <Route path="/:countryCode" element={<CountryLayout />}>
          <Route index element={<App />} />
          <Route path="search" element={<SearchPage />} />
          <Route path="product/:id" element={<ProductPage />} />
          <Route path="deals" element={<DealsPage />} />
          <Route path="basket" element={<BasketPage />} />
          <Route path="receipts" element={<ReceiptPage />} />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
