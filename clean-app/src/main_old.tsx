import React from 'react';
import ReactDOM from 'react-dom/client';
import { BasicColdShowerTracker } from './components/BasicColdShowerTracker';
import { ErrorBoundary } from './components/ui';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <BasicColdShowerTracker />
    </ErrorBoundary>
  </React.StrictMode>,
);