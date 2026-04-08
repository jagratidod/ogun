import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './core/context/AuthContext';
import { NotificationProvider } from './core/context/NotificationContext';
import App from './App';
import './index.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <NotificationProvider>
        <App />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#0D1117',
              color: '#F0F6FC',
              border: '1px solid #21262D',
              borderRadius: '12px',
              fontSize: '14px',
            },
          }}
        />
      </NotificationProvider>
    </AuthProvider>
  </StrictMode>
);
