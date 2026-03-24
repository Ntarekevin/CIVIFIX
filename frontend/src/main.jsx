import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';
import { initAutoSync } from './services/offlineQueue';
import { LanguageProvider } from './store/LanguageContext';
import { SocketProvider } from './store/SocketContext';

// Start listening for online events to flush the offline report queue
initAutoSync();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <LanguageProvider>
        <SocketProvider>
          <App />
        </SocketProvider>
      </LanguageProvider>
    </BrowserRouter>
  </React.StrictMode>
);
