/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BilingualProvider } from './BilingualContext';
import { CurrencyProvider } from './CurrencyContext';

// Views
import StorefrontView from './components/StorefrontView';
import LandingView from './components/LandingView';
import AuthView from './components/AuthView';
import DashboardLayout from './components/DashboardLayout';
import InboxView from './components/InboxView';
import AnalyticsView from './components/AnalyticsView';
import SettingsView from './components/SettingsView';
import WidgetEmbedView from './components/WidgetEmbedView';
import PublicWidgetView from './components/PublicWidgetView';
import ProductsManagementView from './components/ProductsManagementView';
import OrdersManagementView from './components/OrdersManagementView';
import CustomerSelfServiceTrackView from './components/CustomerSelfServiceTrackView';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BilingualProvider>
        <CurrencyProvider>
          <Router>
            <Routes>
              {/* Public Digital Products Storefront on Root */}
              <Route path="/" element={<StorefrontView />} />

              {/* Customer Self-Service Portal for Tracking and Retrieving Purchased Keys */}
              <Route path="/track" element={<CustomerSelfServiceTrackView />} />
              <Route path="/my-orders" element={<CustomerSelfServiceTrackView />} />

              {/* Auth */}
              <Route path="/login" element={<AuthView isRegister={false} />} />
              <Route path="/register" element={<AuthView isRegister={true} />} />
              <Route path="/auth/callback" element={<Navigate to="/dashboard" replace />} />

              {/* Dashboard Workspace */}
              <Route path="/dashboard" element={<DashboardLayout />}>
                <Route index element={<InboxView />} />
                <Route path="products" element={<ProductsManagementView />} />
                <Route path="orders" element={<OrdersManagementView />} />
                <Route path="analytics" element={<AnalyticsView />} />
                <Route path="settings" element={<SettingsView />} />
                <Route path="widget" element={<WidgetEmbedView />} />
              </Route>

              {/* Public Embeddable Customer Chat Widget */}
              <Route path="/widget/:workspaceId" element={<PublicWidgetView />} />

              {/* Catch-all */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Router>
        </CurrencyProvider>
      </BilingualProvider>
    </QueryClientProvider>
  );
}
