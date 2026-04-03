import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './AppRoutes';
import './index.css';
import { SuiProviders } from './SuiProviders.tsx';
import ErrorBoundary from './components/common/ErrorBoundary';
import { OfflineIndicator } from './hooks/useOfflineMode.tsx';

// main.tsx should only be concerned with setting up the root providers and the router.
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <SuiProviders>
          <OfflineIndicator />
          <AppRoutes />
        </SuiProviders>
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>,
);
