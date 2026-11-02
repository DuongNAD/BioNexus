import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/globals.css';
import { USE_MOCKS } from './lib/env';

async function enableMocking(): Promise<void> {
  if (!USE_MOCKS) {
    return;
  }
  const { worker } = await import('./mocks/browser');
  await worker.start({
    serviceWorker: {
      url: './mockServiceWorker.js',
    },
    onUnhandledRequest: 'bypass',
  });
}

enableMocking().finally(() => {
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    throw new Error('Không tìm thấy phần tử root trong index.html');
  }

  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
});
