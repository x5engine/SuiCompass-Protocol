import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './AppRoutes';
import './index.css';
import { SuiProviders } from './SuiProviders.tsx';

// main.tsx should only be concerned with setting up the root providers and the router.
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <SuiProviders>
        <AppRoutes />
      </SuiProviders>
    </BrowserRouter>
  </StrictMode>,
);
