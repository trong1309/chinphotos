import React, { useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Image as ImageIcon,
  FolderTree,
  MapPin,
  Sparkles,
  Inbox,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  X,
} from 'lucide-react';
import { useUiStore } from '../../stores/ui.store';

interface NavItem {
  labelVi: string;
  labelEn: string;
  path: string;
  icon: React.ElementType;
  badge?: number;
}

export const Sidebar: React.FC<{ unreadInquiriesCount?: number }> = ({
  unreadInquiriesCount = 0,
}) => {
  const location = useLocation();
  const {
    sidebarCollapsed,
    toggleSidebarCollapsed,
    mobileSidebarOpen,
    setMobileSidebar,
    lang,
  } = useUiStore();
  const isVi = lang === 'vi';

  const navItems: NavItem[] = [
    { labelVi: 'Tổng quan', labelEn: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { labelVi: 'Bộ sưu tập', labelEn: 'Galleries', path: '/galleries', icon: ImageIcon },
    { labelVi: 'Danh mục', labelEn: 'Categories', path: '/categories', icon: FolderTree },
    { labelVi: 'Khu vực TP.HCM', labelEn: 'Locations', path: '/locations', icon: MapPin },
    { labelVi: 'Gói dịch vụ', labelEn: 'Services', path: '/services', icon: Sparkles },
    {
      labelVi: 'Lời nhắn khách hàng',
      labelEn: 'Inquiries',
      path: '/inquiries',
      icon: Inbox,
      badge: unreadInquiriesCount > 0 ? unreadInquiriesCount : undefined,
    },
    { labelVi: 'Thống kê truy cập', labelEn: 'Analytics', path: '/analytics', icon: BarChart3 },
    { labelVi: 'Cài đặt hệ thống', labelEn: 'Settings', path: '/settings', icon: Settings },
  ];

  useEffect(() => {
    setMobileSidebar(false);
  }, [location.pathname, setMobileSidebar]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileSidebarOpen) {
        setMobileSidebar(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileSidebarOpen, setMobileSidebar]);

  return (
    <>
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={() => setMobileSidebar(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 flex flex-col justify-between bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800 transition-all duration-300 ease-in-out ${
          mobileSidebarOpen ? 'translate-x-0 w-64 shadow-2xl' : '-translate-x-full lg:translate-x-0'
        } ${sidebarCollapsed ? 'lg:w-20' : 'lg:w-64'}`}
      >
        <div>
          {/* Logo Header */}
          <div className="h-16 flex items-center justify-between px-4 sm:px-5 border-b border-slate-100 dark:border-slate-800/80">
            <NavLink
              to="/dashboard"
              className="flex items-center gap-2.5 overflow-hidden font-semibold text-slate-900 dark:text-slate-100"
            >
              <div className="w-9 h-9 rounded-xl bg-brand-500 flex items-center justify-center text-white flex-shrink-0 shadow-sm">
                <ShieldCheck className="w-5 h-5" />
              </div>
              {(!sidebarCollapsed || mobileSidebarOpen) && (
                <div className="flex flex-col truncate">
                  <span className="text-sm font-semibold tracking-tight">chinphotos</span>
                  <span className="text-[10px] text-slate-400 font-mono -mt-0.5">
                    {isVi ? 'Quản trị Studio' : 'Admin CMS'}
                  </span>
                </div>
              )}
            </NavLink>

            <button
              onClick={() => setMobileSidebar(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 lg:hidden"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1" aria-label="Admin Navigation">
            {navItems.map((item) => {
              const Icon = item.icon;
              const label = isVi ? item.labelVi : item.labelEn;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  title={sidebarCollapsed ? label : undefined}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors relative group ${
                      isActive
                        ? 'bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200'
                    } ${sidebarCollapsed && !mobileSidebarOpen ? 'justify-center' : ''}`
                  }
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {(!sidebarCollapsed || mobileSidebarOpen) && (
                    <span className="truncate">{label}</span>
                  )}

                  {item.badge && (
                    <span
                      className={`px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-rose-500 text-white ${
                        sidebarCollapsed && !mobileSidebarOpen ? 'absolute top-1 right-1' : 'ml-auto'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}

                  {sidebarCollapsed && !mobileSidebarOpen && (
                    <div className="absolute left-full ml-3 px-2.5 py-1 bg-slate-900 text-white text-xs rounded-md shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                      {label}
                    </div>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Footer Toggle Button */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-800/80 hidden lg:block">
          <button
            onClick={toggleSidebarCollapsed}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
            title={
              sidebarCollapsed
                ? isVi
                  ? 'Mở rộng thanh bên'
                  : 'Expand sidebar'
                : isVi
                  ? 'Thu gọn thanh bên'
                  : 'Collapse sidebar'
            }
          >
            {sidebarCollapsed ? (
              <ChevronRight className="w-5 h-5 mx-auto" />
            ) : (
              <>
                <ChevronLeft className="w-5 h-5" />
                <span>{isVi ? 'Thu gọn thanh bên' : 'Collapse Sidebar'}</span>
              </>
            )}
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
