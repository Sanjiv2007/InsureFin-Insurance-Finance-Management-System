/**
 * Protected Route Component
 * Restricts access based on authentication status and allowed roles
 */

import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { authService } from '../services/api';

export default function ProtectedRoute({ allowedRoles }) {
  const isAuth = authService.isAuthenticated();
  const user = authService.getUser();

  if (!isAuth || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect user to their own valid dashboard
    if (user.role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;
    if (user.role === 'STAFF') return <Navigate to="/staff/dashboard" replace />;
    return <Navigate to="/client/dashboard" replace />;
  }

  return <Outlet />;
}
