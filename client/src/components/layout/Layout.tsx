import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { usePageView } from '../../hooks/usePageView';

export const Layout: React.FC = () => {
  usePageView();

  return (
    <div className="relative min-h-screen flex flex-col bg-cream-50 dark:bg-cream-950 text-neutral-900 dark:text-cream-100 transition-colors selection:bg-accent-500 selection:text-white overflow-x-hidden">
      <Header />
      <main id="main-content" className="relative z-10 flex-1 flex flex-col pt-20">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
