import React, { useRef } from 'react';
import { Outlet } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useUiStore } from '../../stores/ui.store';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { Breadcrumbs } from './Breadcrumbs';
import { ToastContainer } from '../common/ToastContainer';
import inquiriesService from '../../services/inquiries.service';
import { useAdminDomTranslator } from '../../lib/adminI18n';

export const AdminLayout: React.FC = () => {
  const { sidebarCollapsed, lang } = useUiStore();
  const mainRef = useRef<HTMLElement>(null);

  useAdminDomTranslator(mainRef, lang);

  const { data: unreadData } = useQuery({
    queryKey: ['admin', 'inquiries', 'unread-count'],
    queryFn: () => inquiriesService.getInquiries({ status: 'new', limit: 1 }),
    refetchInterval: 30000,
  });

  const unreadCount = unreadData?.pagination?.total || 0;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors">
      <Sidebar unreadInquiriesCount={unreadCount} />

      {/* Main Column */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${
          sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'
        }`}
      >
        <Header unreadInquiriesCount={unreadCount} />

        <main ref={mainRef} className="flex-1 p-6 sm:p-8 max-w-7xl w-full mx-auto">
          <Breadcrumbs />
          <Outlet />
        </main>
      </div>

      <ToastContainer />
    </div>
  );
};

export default AdminLayout;
