import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { useUiStore } from '../../stores/ui.store';

const routeNameMapVi: Record<string, string> = {
  dashboard: 'Tổng quan',
  galleries: 'Bộ sưu tập',
  new: 'Tạo mới',
  categories: 'Danh mục',
  locations: 'Khu vực TP.HCM',
  services: 'Gói dịch vụ',
  inquiries: 'Lời nhắn khách hàng',
  analytics: 'Thống kê truy cập',
  settings: 'Cài đặt hệ thống',
};

const routeNameMapEn: Record<string, string> = {
  dashboard: 'Dashboard',
  galleries: 'Galleries',
  new: 'Create New',
  categories: 'Categories',
  locations: 'Locations',
  services: 'Services',
  inquiries: 'Inquiries',
  analytics: 'Analytics',
  settings: 'Settings',
};

export const Breadcrumbs: React.FC = () => {
  const location = useLocation();
  const { lang } = useUiStore();
  const isVi = lang === 'vi';
  const pathnames = location.pathname.split('/').filter(Boolean);

  if (pathnames.length === 0 || (pathnames.length === 1 && pathnames[0] === 'dashboard')) {
    return null;
  }

  const nameMap = isVi ? routeNameMapVi : routeNameMapEn;

  return (
    <nav
      key={lang}
      className="flex items-center text-xs text-slate-500 dark:text-slate-400 mb-6"
      aria-label="Breadcrumb"
    >
      <ol className="flex items-center flex-wrap gap-1.5">
        <li>
          <Link
            to="/dashboard"
            className="flex items-center gap-1 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
          >
            <Home className="w-3.5 h-3.5" />
            <span>{isVi ? 'Tổng quan' : 'Dashboard'}</span>
          </Link>
        </li>

        {pathnames.map((segment, index) => {
          const to = `/${pathnames.slice(0, index + 1).join('/')}`;
          const isLast = index === pathnames.length - 1;
          const label = nameMap[segment] || segment;

          return (
            <React.Fragment key={to}>
              <ChevronRight className="w-3.5 h-3.5 opacity-40 flex-shrink-0" />
              <li>
                {isLast ? (
                  <span className="font-medium text-slate-800 dark:text-slate-200" aria-current="page">
                    {label}
                  </span>
                ) : (
                  <Link
                    to={to}
                    className="hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
                  >
                    {label}
                  </Link>
                )}
              </li>
            </React.Fragment>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;
