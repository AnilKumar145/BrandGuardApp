import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useBrandGuard } from '../../context/BrandGuardContext';
import { ToastContainer } from '../ui/ToastContainer';
import { ScanModal } from '../ui/ScanModal';
import {
  Shield,
  LayoutDashboard,
  Building2,
  AlertTriangle,
  Settings,
  Play,
  RotateCcw,
  LogOut,
  Menu,
  X,
  ExternalLink,
  CheckCircle2,
  ChevronRight,
} from 'lucide-react';

export const AppLayout: React.FC = () => {
  const { user, logout, brand, summary, runNewScan, isScanning, resetAllData } = useBrandGuard();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    {
      to: '/dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      to: '/brand',
      label: 'Brand Profile',
      icon: Building2,
      badge: `${brand.officialSocialAccounts.length + brand.officialApps.length} assets`,
    },
    {
      to: '/detections',
      label: 'Detections',
      icon: AlertTriangle,
      badge: summary.needsReview > 0 ? `${summary.needsReview} new` : null,
      badgeAlert: true,
    },
    {
      to: '/settings',
      label: 'Settings',
      icon: Settings,
      badge: null,
    },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  // Determine breadcrumb
  const getBreadcrumbs = () => {
    const path = location.pathname;
    if (path.startsWith('/detections/')) {
      return [
        { label: 'Detections', path: '/detections' },
        { label: 'Threat Investigation', path: location.pathname },
      ];
    }
    if (path === '/brand') return [{ label: 'Brand Profile', path: '/brand' }];
    if (path === '/detections') return [{ label: 'All Detections', path: '/detections' }];
    if (path === '/settings') return [{ label: 'System Settings', path: '/settings' }];
    return [{ label: 'Overview Dashboard', path: '/dashboard' }];
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <div className="min-h-screen bg-[#090a0f] text-neutral-100 flex flex-col lg:flex-row antialiased">
      <ToastContainer />
      <ScanModal />

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 flex-col border-r border-neutral-800/80 bg-[#0d0f17] shrink-0">
        {/* BrandGuard Wordmark */}
        <div className="h-16 px-5 flex items-center gap-3 border-b border-neutral-800/80">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
            <Shield className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-sm tracking-tight text-white flex items-center gap-1.5">
              BrandGuard
              <span className="text-[10px] font-mono text-indigo-400 bg-indigo-500/10 px-1 py-0.2 rounded border border-indigo-500/20">
                DRP
              </span>
            </span>
            <span className="text-[11px] text-neutral-400">Digital Risk Protection</span>
          </div>
        </div>

        {/* Active Monitored Brand Card */}
        <div className="p-4 mx-3 my-3 rounded-xl bg-neutral-900/80 border border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 max-w-[36px] max-h-[36px] rounded-lg bg-white p-1 flex items-center justify-center shrink-0 shadow-sm overflow-hidden">
              <img
                src={brand.logoUrl}
                alt={brand.name}
                style={{ width: '28px', height: '28px', objectFit: 'contain', maxWidth: '100%', maxHeight: '100%' }}
                className="w-full h-full object-contain"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-neutral-100 truncate">
                  {brand.name}
                </span>
                <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Active
                </span>
              </div>
              <a
                href={brand.website}
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-neutral-400 hover:text-neutral-200 transition-colors flex items-center gap-1 truncate"
              >
                {brand.website.replace('https://', '')}
                <ExternalLink className="w-2.5 h-2.5 shrink-0" />
              </a>
            </div>
          </div>
          <div className="mt-2.5 pt-2.5 border-t border-neutral-800/60 flex items-center justify-between text-[11px] text-neutral-400 font-mono">
            <span>Whitelisted Assets</span>
            <span className="text-neutral-200 font-semibold tabular-nums">
              {brand.officialSocialAccounts.length + brand.officialApps.length}
            </span>
          </div>
        </div>

        {/* Primary Navigation */}
        <nav className="flex-1 px-3 py-2 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/60'
                  }`
                }
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                      item.badgeAlert
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30 font-semibold'
                        : 'bg-neutral-800 text-neutral-400'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Action Center in Sidebar */}
        <div className="p-3 border-t border-neutral-800/80 space-y-2">
          <button
            onClick={runNewScan}
            disabled={isScanning}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-white bg-indigo-600/90 hover:bg-indigo-600 rounded-lg transition-colors shadow-md shadow-indigo-600/10 disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{isScanning ? 'Scanning...' : 'Run New Scan'}</span>
          </button>

          <button
            onClick={resetAllData}
            className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 text-[11px] font-medium text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50 rounded-lg transition-colors"
            title="Reset data back to default Nike demo state"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Demo Data</span>
          </button>
        </div>

        {/* Current User Card */}
        {user && (
          <div className="p-3 border-t border-neutral-800/80 flex items-center justify-between bg-neutral-950/40">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center font-bold text-xs text-indigo-300 shrink-0">
                {user.name.charAt(0)}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-neutral-200 truncate">{user.name}</p>
                <p className="text-[10px] text-neutral-500 truncate">{user.role}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 text-neutral-500 hover:text-rose-400 transition-colors rounded-md"
              title="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </aside>

      {/* Mobile Top Header */}
      <div className="lg:hidden flex items-center justify-between px-4 py-3 bg-[#0d0f17] border-b border-neutral-800">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
            <Shield className="w-4 h-4" />
          </div>
          <span className="font-bold text-sm text-white">BrandGuard</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={runNewScan}
            disabled={isScanning}
            className="px-2.5 py-1 text-xs bg-indigo-600 text-white rounded-md flex items-center gap-1"
          >
            <Play className="w-3 h-3 fill-current" />
            <span>Scan</span>
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 text-neutral-400 hover:text-white"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#0d0f17] border-b border-neutral-800 px-4 py-3 space-y-2 animate-in slide-in-from-top duration-150">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                `flex items-center justify-between p-2 rounded-lg text-xs font-medium ${
                  isActive ? 'bg-indigo-600 text-white' : 'text-neutral-400 hover:bg-neutral-800'
                }`
              }
            >
              <div className="flex items-center gap-2">
                <item.icon className="w-4 h-4" />
                <span>{item.label}</span>
              </div>
              {item.badge && <span className="text-[10px] font-mono">{item.badge}</span>}
            </NavLink>
          ))}
          <div className="pt-2 border-t border-neutral-800 flex justify-between items-center text-xs">
            <span className="text-neutral-400">{user?.name}</span>
            <button onClick={handleLogout} className="text-rose-400">
              Sign out
            </button>
          </div>
        </div>
      )}

      {/* Main Viewport */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Bar with Breadcrumbs & Actions */}
        <header className="h-16 px-6 border-b border-neutral-800/80 bg-[#090a0f]/80 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-neutral-400">
            <span className="font-medium text-neutral-500">BrandGuard</span>
            {breadcrumbs.map((b, idx) => (
              <React.Fragment key={b.path}>
                <ChevronRight className="w-3.5 h-3.5 text-neutral-600" />
                <span
                  className={
                    idx === breadcrumbs.length - 1
                      ? 'text-neutral-100 font-semibold'
                      : 'hover:text-neutral-200 cursor-pointer'
                  }
                  onClick={() => idx < breadcrumbs.length - 1 && navigate(b.path)}
                >
                  {b.label}
                </span>
              </React.Fragment>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 text-xs text-neutral-400 mr-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Monitoring Engine: Online</span>
            </div>

            <button
              onClick={runNewScan}
              disabled={isScanning}
              className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors shadow-sm disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{isScanning ? 'Scanning...' : 'Run New Scan'}</span>
            </button>
          </div>
        </header>

        {/* Content Outlet */}
        <main className="flex-1 p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
