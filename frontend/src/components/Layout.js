import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const icons = {
  dashboard: (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
      <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
    </svg>
  ),
  projects: (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path d="M3 7a2 2 0 012-2h3l2 2h9a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"/>
    </svg>
  ),
  tasks: (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
    </svg>
  ),
  logout: (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
    </svg>
  ),
  menu: (
    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path d="M4 6h16M4 12h16M4 18h16"/>
    </svg>
  )
};

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: icons.dashboard },
    { to: '/projects', label: 'Projects', icon: icons.projects },
    { to: '/my-tasks', label: 'My Tasks', icon: icons.tasks },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <aside style={{
        width: 240, background: '#0d0d1e', borderRight: '1.5px solid #1a1a35',
        display: 'flex', flexDirection: 'column', position: 'fixed',
        top: 0, left: sidebarOpen ? 0 : '-240px', bottom: 0, zIndex: 100,
        transition: 'left 0.3s ease',
        '@media (min-width: 768px)': { left: 0 }
      }} className="sidebar">
        {/* Logo */}
        <div style={{ padding: '24px 20px', borderBottom: '1px solid #1a1a35' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, background: 'linear-gradient(135deg, #6c63ff, #a78bfa)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="16" height="16" fill="white" viewBox="0 0 24 24"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" stroke="white" fill="none" strokeWidth="2"/></svg>
            </div>
            <span style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 18, color: '#e8e8f5' }}>TaskFlow</span>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '16px 12px' }}>
          {navItems.map(item => (
            <NavLink
              key={item.to} to={item.to}
              onClick={() => setSidebarOpen(false)}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 12px', borderRadius: 10, marginBottom: 4,
                color: isActive ? '#e8e8f5' : '#5a5a8a',
                background: isActive ? 'rgba(108,99,255,0.15)' : 'transparent',
                border: isActive ? '1px solid rgba(108,99,255,0.3)' : '1px solid transparent',
                transition: 'all 0.2s', fontWeight: isActive ? 500 : 400
              })}
            >
              {item.icon}
              <span style={{ fontSize: 14 }}>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* User */}
        <div style={{ padding: '16px 12px', borderTop: '1px solid #1a1a35' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', marginBottom: 8 }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, #6c63ff, #22d3a4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: 'white', flexShrink: 0 }}>
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: 13, fontWeight: 500, color: '#e8e8f5', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name}</div>
              <div style={{ fontSize: 11, color: '#5a5a8a', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{user?.role}</div>
            </div>
          </div>
          <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10, color: '#ff6b8a', background: 'transparent', border: '1px solid transparent', width: '100%', transition: 'all 0.2s', fontSize: 14 }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,107,138,0.1)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            {icons.logout} Logout
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 99 }} />
      )}

      {/* Main content */}
      <main style={{ flex: 1, marginLeft: 0, minHeight: '100vh', background: '#0a0a12' }}>
        {/* Mobile topbar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 20px', borderBottom: '1px solid #1a1a35', position: 'sticky', top: 0, background: '#0a0a12', zIndex: 50 }}>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ background: 'transparent', color: '#9090b8', padding: 4 }}>
            {icons.menu}
          </button>
          <span style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 16, color: '#e8e8f5' }}>TaskFlow</span>
        </div>
        <Outlet />
      </main>

      <style>{`
        @media (min-width: 768px) {
          .sidebar { left: 0 !important; }
          main { margin-left: 240px !important; }
          main > div:first-child { display: none !important; }
        }
      `}</style>
    </div>
  );
}
