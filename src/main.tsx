import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Only log in development
const isDevelopment = import.meta.env.DEV;

if (isDevelopment) {
  console.log('main.tsx loaded - React version:', React.version);
}

try {
  const root = document.getElementById('root');
  
  if (root) {
    const reactRoot = ReactDOM.createRoot(root);
    reactRoot.render(<App />);
    
    if (isDevelopment) {
      console.log('React app mounted successfully');
    }
  } else {
    console.error('Root element not found');
    document.body.innerHTML = '<h1 style="color: red; padding: 20px;">Root element not found</h1>';
  }
} catch (error) {
  console.error('Error mounting React app:', error);
  document.body.innerHTML = '<h1 style="color: red; padding: 20px;">Error loading app: ' + String(error) + '</h1>';
}