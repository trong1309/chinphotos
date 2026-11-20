import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import queryClient from './lib/queryClient';
import { AppRoutes } from './routes';
import { ConfirmProvider } from './components/common';

export const App: React.FC = () => {
  const basename = import.meta.env.BASE_URL.replace(/\/$/, '') || '/';
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter
        basename={basename}
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
        <ConfirmProvider>
          <AppRoutes />
        </ConfirmProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
