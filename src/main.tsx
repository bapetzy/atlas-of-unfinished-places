import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource-variable/brygada-1918/wght.css';
import '@fontsource-variable/brygada-1918/wght-italic.css';
import '@fontsource-variable/archivo/wdth.css';
import '@fontsource/courier-prime/400.css';
import '@fontsource/courier-prime/700.css';
import './styles/base.css';
import './styles/chart.css';
import './styles/papers.css';
import './styles/pages.css';
import { App } from './App';
import { ErrorBoundary } from './components/ErrorBoundary';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);
