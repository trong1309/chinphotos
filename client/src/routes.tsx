import React, { Suspense, lazy } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Layout } from './components/layout/Layout';

// Lazy loaded page components
const Home = lazy(() => import('./pages/Home'));
const Work = lazy(() => import('./pages/Work'));
const Portfolio = lazy(() => import('./pages/Portfolio'));
const PortfolioCategory = lazy(() => import('./pages/PortfolioCategory'));
const GalleryDetail = lazy(() => import('./pages/GalleryDetail'));
const About = lazy(() => import('./pages/About'));
const Details = lazy(() => import('./pages/Details'));
const ServicePage = lazy(() => import('./pages/ServicePage'));
const LocationPage = lazy(() => import('./pages/LocationPage'));
const Contact = lazy(() => import('./pages/Contact'));
const NotFound = lazy(() => import('./pages/NotFound'));

const LoadingFallback: React.FC = () => (
  <div className="flex-1 flex items-center justify-center min-h-[60vh] bg-cream-50 dark:bg-neutral-950 transition-colors">
    <div className="w-8 h-8 rounded-full border-2 border-accent-500/20 border-t-accent-500 animate-spin" />
  </div>
);

const AnimatedPageWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  return (
    <motion.div
      key={location.pathname}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="flex-1 flex flex-col"
    >
      <Suspense fallback={<LoadingFallback />}>{children}</Suspense>
    </motion.div>
  );
};

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route
          path="/"
          element={
            <AnimatedPageWrapper>
              <Home />
            </AnimatedPageWrapper>
          }
        />
        <Route
          path="/work"
          element={
            <AnimatedPageWrapper>
              <Work />
            </AnimatedPageWrapper>
          }
        />
        <Route
          path="/portfolio"
          element={
            <AnimatedPageWrapper>
              <Portfolio />
            </AnimatedPageWrapper>
          }
        />
        <Route
          path="/portfolio/:category"
          element={
            <AnimatedPageWrapper>
              <PortfolioCategory />
            </AnimatedPageWrapper>
          }
        />
        <Route
          path="/gallery/:slug"
          element={
            <AnimatedPageWrapper>
              <GalleryDetail />
            </AnimatedPageWrapper>
          }
        />
        <Route
          path="/about"
          element={
            <AnimatedPageWrapper>
              <About />
            </AnimatedPageWrapper>
          }
        />
        <Route
          path="/details"
          element={
            <AnimatedPageWrapper>
              <Details />
            </AnimatedPageWrapper>
          }
        />
        <Route
          path="/services/:slug"
          element={
            <AnimatedPageWrapper>
              <ServicePage />
            </AnimatedPageWrapper>
          }
        />
        <Route
          path="/locations/:slug"
          element={
            <AnimatedPageWrapper>
              <LocationPage />
            </AnimatedPageWrapper>
          }
        />
        <Route path="/journal" element={<Navigate to="/portfolio" replace />} />
        <Route path="/journal/:slug" element={<Navigate to="/portfolio" replace />} />
        <Route path="/shop" element={<Navigate to="/work" replace />} />
        <Route
          path="/contact"
          element={
            <AnimatedPageWrapper>
              <Contact />
            </AnimatedPageWrapper>
          }
        />
        <Route
          path="*"
          element={
            <AnimatedPageWrapper>
              <NotFound />
            </AnimatedPageWrapper>
          }
        />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
