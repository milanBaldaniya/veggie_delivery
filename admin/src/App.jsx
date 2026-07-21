import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './routes/ProtectedRoute';
import AdminLayout from './layouts/AdminLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Orders from './pages/Orders';
import DailyPurchaseReport from './pages/DailyPurchaseReport';
import Packing from './pages/Packing';
import Users from './pages/Users';
import Buildings from './pages/Buildings';
import Watchmen from './pages/Watchmen';
import Vendors from './pages/Vendors';
import Expenses from './pages/Expenses';
import Salaries from './pages/Salaries';
import Billing from './pages/Billing';
import Reports from './pages/Reports';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="products" element={<Products />} />
        <Route path="orders" element={<Orders />} />
        <Route path="packing" element={<Packing />} />
        <Route path="reports/daily-purchase" element={<DailyPurchaseReport />} />
        <Route path="reports" element={<Reports />} />
        <Route path="users" element={<Users />} />
        <Route path="buildings" element={<Buildings />} />
        <Route path="watchmen" element={<Watchmen />} />
        <Route path="vendors" element={<Vendors />} />
        <Route path="expenses" element={<Expenses />} />
        <Route path="salaries" element={<Salaries />} />
        <Route path="billing" element={<Billing />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
