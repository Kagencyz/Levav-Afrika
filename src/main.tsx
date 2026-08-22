import { createRoot } from 'react-dom/client';
import { Toaster } from 'sonner';
import { ThemeProvider, useTheme } from 'next-themes';
import './index.css';
import App from './App';
import { clearRetiredLocalState } from './lib/retiredLocalState';

clearRetiredLocalState();

createRoot(document.getElementById('root')!).render(
  <ThemeProvider attribute="class" defaultTheme="system" enableSystem storageKey="theme">
    <AppShell />
  </ThemeProvider>
);

function AppShell() {
  const { resolvedTheme } = useTheme();
  return (
    <>
      <App />
      <Toaster position="top-right" theme={resolvedTheme === 'light' ? 'light' : 'dark'} />
    </>
  );
}

// Register service worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // Silently fail — PWA features are non-critical
    });
  });
}
