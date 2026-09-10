/**
 * InsureFin - Modern Navbar Component
 */

import React, { useState, useEffect } from 'react';
import { Bell, User, LogOut, CheckCircle2, Shield, Menu } from 'lucide-react';
import { Link } from 'react-router-dom';
import api, { authService } from '../services/api';

export default function Navbar({ title, subtitle }) {
  const user = authService.getUser() || {};
  const [notifications, setNotifications] = useState([]);
  const [showNotif, setShowNotif] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      if (res.data.success) {
        setNotifications(res.data.notifications);
        const unread = res.data.notifications.filter(n => !n.is_read).length;
        setUnreadCount(unread);
      }
    } catch {
      // ignore
    }
  };

  const handleMarkAsRead = async () => {
    try {
      await api.put('/notifications/read');
      setUnreadCount(0);
      fetchNotifications();
    } catch {
      // ignore
    }
  };

  const getRoleClass = (role) => {
    if (role === 'ADMIN') return 'role-tag admin';
    if (role === 'STAFF') return 'role-tag staff';
    return 'role-tag client';
  };

  const firstLetter = user.name ? user.name.charAt(0).toUpperCase() : 'U';

  return (
    <header className="navbar">
      <div className="nav-title">
        <h2>{title || 'Dashboard'}</h2>
        {subtitle && <p>{subtitle}</p>}
      </div>

      <div className="nav-right">
        {/* Notification Bell */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => {
              setShowNotif(!showNotif);
              if (!showNotif && unreadCount > 0) handleMarkAsRead();
            }}
            className="btn btn-secondary"
            style={{ padding: '8px 12px', position: 'relative', borderRadius: 'var(--radius-full)' }}
          >
            <Bell size={18} color="var(--text-secondary)" />
            {unreadCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '-3px',
                  right: '-3px',
                  background: 'var(--danger)',
                  color: '#fff',
                  borderRadius: '50%',
                  fontSize: '10.5px',
                  padding: '2px 5px',
                  fontWeight: '800',
                  boxShadow: '0 2px 6px rgba(239, 68, 68, 0.4)'
                }}
              >
                {unreadCount}
              </span>
            )}
          </button>

          {showNotif && (
            <div
              style={{
                position: 'absolute',
                top: '48px',
                right: '0',
                width: '340px',
                backgroundColor: '#ffffff',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-modal)',
                zIndex: 999,
                overflow: 'hidden'
              }}
            >
              <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
                <strong style={{ fontSize: '14px', color: 'var(--text-primary)' }}>System Notifications</strong>
                <span style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>{notifications.length} alerts</span>
              </div>
              <div style={{ maxHeight: '280px', overflowY: 'auto' }}>
                {notifications.length === 0 ? (
                  <p style={{ padding: '20px', textAlign: 'center', fontSize: '13px', color: 'var(--text-muted)' }}>No notifications yet</p>
                ) : (
                  notifications.map(n => (
                    <div
                      key={n.id}
                      style={{
                        padding: '12px 18px',
                        borderBottom: '1px solid var(--border-subtle)',
                        fontSize: '13px',
                        color: 'var(--text-primary)',
                        display: 'flex',
                        gap: '10px',
                        alignItems: 'flex-start'
                      }}
                    >
                      <CheckCircle2 size={16} color="var(--primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span style={{ lineHeight: '1.4' }}>{n.message}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Badge with Avatar Circle */}
        <Link to="/client/profile" className="user-badge" style={{ cursor: 'pointer' }}>
          <div className="user-avatar-circle">
            {firstLetter}
          </div>
          <span style={{ fontSize: '13.5px', fontWeight: '700', color: 'var(--text-primary)' }}>{user.name || 'User'}</span>
          <span className={getRoleClass(user.role)}>{user.role || 'CLIENT'}</span>
        </Link>

        {/* Logout Button */}
        <button
          onClick={authService.logout}
          className="btn btn-secondary btn-sm"
          title="Logout"
          style={{ padding: '8px 14px', borderRadius: 'var(--radius-full)' }}
        >
          <LogOut size={15} />
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
}
