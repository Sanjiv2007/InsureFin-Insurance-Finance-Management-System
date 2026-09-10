/**
 * KPI StatCard Component
 */

import React from 'react';

export default function StatCard({ title, value, icon: Icon, color = 'blue', subtitle }) {
  const iconClassMap = {
    blue: 'stat-icon-blue',
    green: 'stat-icon-green',
    purple: 'stat-icon-purple',
    orange: 'stat-icon-orange',
    red: 'stat-icon-red'
  };

  return (
    <div className="stat-card">
      <div className="stat-info">
        <span>{title}</span>
        <h3>{value}</h3>
        {subtitle && <p style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '4px' }}>{subtitle}</p>}
      </div>
      {Icon && (
        <div className={`stat-icon-wrap ${iconClassMap[color] || 'stat-icon-blue'}`}>
          <Icon size={22} />
        </div>
      )}
    </div>
  );
}
