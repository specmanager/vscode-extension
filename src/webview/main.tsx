import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './globals.css';
import './i18n';

const container = document.getElementById('root');
if (container) {
  const root = ReactDOM.createRoot(container);
  root.render(
    <React.StrictMode>
      <Suspense fallback={<div className="p-4 text-center">Loading...</div>}>
        <App />
      </Suspense>
    </React.StrictMode>
  );

  document.body.classList.add('loaded');
}
