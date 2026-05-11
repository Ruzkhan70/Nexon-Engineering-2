import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Global error handling for production debugging
if (import.meta.env.PROD) {
  window.addEventListener('error', (event) => {
    console.error('Global Runtime Error:', event.message, event.error);
  });
  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled Promise Rejection:', event.reason);
  });
}

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Failed to find root element');

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
