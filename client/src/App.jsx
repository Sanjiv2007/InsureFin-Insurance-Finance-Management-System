/**
 * Insurance & Finance Management System
 * Main Application Component with React Router Configuration & Role Protection
 */

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Auth Pages
import Login from './pages/Login';
import Register from './pages/Register';

// Route Guard
import ProtectedRoute from './components/ProtectedRoute';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import ClientManagement from './pages/admin/ClientManagement';
import StaffManagement from './pages/admin/StaffManagement';
import PolicyManagement from './pages/admin/PolicyManagement';
import PaymentManagement from './pages/admin/PaymentManagement';
import ClaimManagement from './pages/admin/ClaimManagement';
import FinanceManagement from './pages/admin/FinanceManagement';
import Reports from './pages/admin/Reports';

// Staff Pages
import StaffDashboard from './pages/staff/StaffDashboard';
import StaffPolicies from './pages/staff/StaffPolicies';
import StaffClients from './pages/staff/StaffClients';
import StaffPayments from './pages/staff/StaffPayments';
import StaffClaims from './pages/staff/StaffClaims';

// Client Pages
import ClientDashboard from './pages/client/ClientDashboard';
import ClientProfile from './pages/client/ClientProfile';
import BrowseInsurance from './pages/client/BrowseInsurance';
import MyPolicies from './pages/client/MyPolicies';
import PayPremium from './pages/client/PayPremium';
import FileClaim from './pages/client/FileClaim';
import MyClaims from './pages/client/MyClaims';
import MyTransactions from './pages/client/MyTransactions';

export default function App() {
  return (
    <Routes>
      {/* Public Authentication Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* 1. ADMIN PORTAL ROUTES */}
      <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/users" element={<UserManagement />} />
        <Route path="/admin/clients" element={<ClientManagement />} />
        <Route path="/admin/staff" element={<StaffManagement />} />
        <Route path="/admin/policies" element={<PolicyManagement />} />
        <Route path="/admin/payments" element={<PaymentManagement />} />
        <Route path="/admin/claims" element={<ClaimManagement />} />
        <Route path="/admin/finance" element={<FinanceManagement />} />
        <Route path="/admin/reports" element={<Reports />} />
      </Route>

      {/* 2. STAFF PORTAL ROUTES */}
      <Route element={<ProtectedRoute allowedRoles={['STAFF']} />}>
        <Route path="/staff/dashboard" element={<StaffDashboard />} />
        <Route path="/staff/policies" element={<StaffPolicies />} />
        <Route path="/staff/clients" element={<StaffClients />} />
        <Route path="/staff/payments" element={<StaffPayments />} />
        <Route path="/staff/claims" element={<StaffClaims />} />
      </Route>

      {/* 3. CLIENT PORTAL ROUTES */}
      <Route element={<ProtectedRoute allowedRoles={['CLIENT']} />}>
        <Route path="/client/dashboard" element={<ClientDashboard />} />
        <Route path="/client/profile" element={<ClientProfile />} />
        <Route path="/client/browse" element={<BrowseInsurance />} />
        <Route path="/client/policies" element={<MyPolicies />} />
        <Route path="/client/payments" element={<PayPremium />} />
        <Route path="/client/file-claim" element={<FileClaim />} />
        <Route path="/client/claims" element={<MyClaims />} />
        <Route path="/client/transactions" element={<MyTransactions />} />
      </Route>

      {/* Default Catch-All: Redirect to Login */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
