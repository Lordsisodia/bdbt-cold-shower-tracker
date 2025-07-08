import React from 'react';
import ReactDOM from 'react-dom/client';
import { SimpleColdShowerApp } from './components/SimpleColdShowerApp';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <SimpleColdShowerApp />
  </React.StrictMode>,
);