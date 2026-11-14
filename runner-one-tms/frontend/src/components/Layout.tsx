import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  LayoutDashboard,
  Users,
  Truck,
  Package,
  FileText,
  User as UserIcon,
  LogOut,
  Menu,
  ChevronLeft,
} from 'lucide-react';

export const Layout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/orders', label: 'Pedidos', icon: Package },
    { path: '/clients', label: 'Clientes', icon: Users },
    { path: '/drivers', label: 'Motoristas', icon: UserIcon },
    { path: '/vehicles', label: 'Veículos', icon: Truck },
    { path: '/reports', label: 'Relatórios', icon: FileText },
    { path: '/profile', label: 'Meu Perfil', icon: UserIcon },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <aside
        style={{
          width: sidebarOpen ? 'var(--sidebar-width)' : 'var(--sidebar-collapsed)',
          backgroundColor: 'var(--navy-900)',
          color: '#FFFFFF',
          transition: 'width 0.3s ease',
          display: 'flex',
          flexDirection: 'column',
          position: 'fixed',
          top: 0,
          bottom: 0,
          left: 0,
          zIndex: 100,
          boxShadow: '2px 0 8px rgba(0,0,0,0.1)',
        }}
      >
        <div
          style={{
            height: 'var(--header-height)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 20px',
            borderBottom: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          {sidebarOpen && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Truck color="var(--amber-500)" size={28} />
              <span style={{ fontWeight: 800, fontSize: '1.2rem', letterSpacing: '0.5px' }}>
                Runner <span style={{ color: 'var(--amber-500)' }}>One</span>
              </span>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{
              background: 'none',
              border: 'none',
              color: '#FFFFFF',
              cursor: 'pointer',
              padding: '4px',
            }}
          >
            {sidebarOpen ? <ChevronLeft size={22} /> : <Menu size={22} />}
          </button>
        </div>

        <nav style={{ flex: 1, padding: '16px 0', overflowY: 'auto' }}>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                title={item.label}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  padding: '12px 20px',
                  background: isActive ? 'var(--navy-800)' : 'transparent',
                  border: 'none',
                  borderLeft: isActive ? '4px solid var(--amber-500)' : '4px solid transparent',
                  color: isActive ? 'var(--amber-500)' : '#D1D5DB',
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontSize: '0.95rem',
                  fontWeight: isActive ? 600 : 400,
                  transition: 'background 0.2s',
                }}
              >
                <Icon size={22} style={{ minWidth: '22px' }} />
                {sidebarOpen && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>

        <div style={{ padding: '16px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <button
            onClick={logout}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              padding: '10px 16px',
              background: 'rgba(239, 68, 68, 0.1)',
              border: 'none',
              borderRadius: '6px',
              color: '#F87171',
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            <LogOut size={20} style={{ minWidth: '20px' }} />
            {sidebarOpen && <span>Sair do Sistema</span>}
          </button>
        </div>
      </aside>

      <div
        style={{
          flex: 1,
          marginLeft: sidebarOpen ? 'var(--sidebar-width)' : 'var(--sidebar-collapsed)',
          transition: 'margin-left 0.3s ease',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <header
          style={{
            height: 'var(--header-height)',
            backgroundColor: 'var(--card-bg)',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 32px',
            position: 'sticky',
            top: 0,
            zIndex: 90,
          }}
        >
          <div style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--navy-900)' }}>
            TMS Logística & Transportes
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{user?.name}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user?.role}</div>
            </div>
          </div>
        </header>

        <main style={{ padding: '32px', flex: 1 }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};