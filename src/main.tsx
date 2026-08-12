import { createRoot } from 'react-dom/client';
import { Toaster } from 'sonner';
import './index.css';
import App from './App';
import { clearRetiredLocalState } from './lib/retiredLocalState';

clearRetiredLocalState();

createRoot(document.getElementById('root')!).render(
  <>
    <App />
    <Toaster position="top-right" theme="dark" />
  </>
);

// Register service worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // Silently fail — PWA features are non-critical
    });
  });
}
