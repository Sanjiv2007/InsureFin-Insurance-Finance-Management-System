/**
 * InsureFin - Role-Based Sidebar Navigation Component
 */

import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  ShieldAlert,
  FileText,
  CreditCard,
  FileCheck2,
  DollarSign,
  BarChart3,
  Search,
  FilePlus2,
  User,
  Shield,
  Layers,
  LogOut
} from 'lucide-react';
import { authService } from '../services/api';

export default function Sidebar() {
  const role = authService.getRole();

  const adminLinks = [
    { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/admin/users', icon: Users, label: 'Users' },
    { to: '/admin/clients', icon: UserCheck, label: 'Clients' },
    { to: '/admin/staff', icon: ShieldAlert, label: 'Staff' },
    { to: '/admin/policies', icon: FileText, label: 'Policies' },
    { to: '/admin/payments', icon: CreditCard, label: 'Payments' },
    { to: '/admin/claims', icon: FileCheck2, label: 'Claims' },
    { to: '/admin/finance', icon: DollarSign, label: 'Finance' },
    { to: '/admin/reports', icon: BarChart3, label: 'Reports' },
    { to: '/client/profile', icon: User, label: 'Profile' }
  ];

  const staffLinks = [
    { to: '/staff/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/staff/policies', icon: FileText, label: 'My Policies' },
    { to: '/staff/clients', icon: Users, label: 'Customers' },
    { to: '/staff/claims', icon: FileCheck2, label: 'Claims' },
    { to: '/staff/payments', icon: CreditCard, label: 'Payments' },
    { to: '/client/profile', icon: User, label: 'Profile' }
  ];

  const clientLinks = [
    { to: '/client/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/client/profile', icon: User, label: 'My Profile' },
    { to: '/client/browse', icon: Search, label: 'Browse Insurance' },
    { to: '/client/policies', icon: FileText, label: 'My Policies' },
    { to: '/client/payments', icon: CreditCard, label: 'Payments' },
    { to: '/client/file-claim', icon: FilePlus2, label: 'File a Claim' },
    { to: '/client/claims', icon: FileCheck2, label: 'My Claims' },
    { to: '/client/transactions', icon: DollarSign, label: 'Transactions' }
  ];

  let links = clientLinks;
  let portalTitle = 'Client Portal';

  if (role === 'ADMIN') {
    links = adminLinks;
    portalTitle = 'Admin Portal';
  } else if (role === 'STAFF') {
    links = staffLinks;
    portalTitle = 'Staff Portal';
  }

  return (
    <aside className="sidebar">
      {/* Brand Header */}
      <div className="sidebar-header">
        <div className="sidebar-logo-icon">
          <Shield size={24} />
        </div>
        <div className="sidebar-brand">
          <h2>InsureFin</h2>
          <span>{portalTitle}</span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="sidebar-nav">
        {links.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}

        {/* Quick Logout link in navigation */}
        <button
          onClick={authService.logout}
          className="sidebar-link"
          style={{ background: 'transparent', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer', marginTop: '12px' }}
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </nav>

      {/* Sidebar Footer */}
      <div className="sidebar-footer">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '11.5px', fontWeight: '500' }}>
          <Layers size={14} color="#3b82f6" />
          <span>InsureFin v2.0 Academic</span>
        </div>
      </div>
    </aside>
  );
}
