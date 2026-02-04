import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

import { SuiProviders } from './SuiProviders.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SuiProviders>
      <App />
    </SuiProviders>
  </StrictMode>,
)

