import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import './index.css';
import App from './App.jsx';

// Removed StrictMode to prevent issues with react-beautiful-dnd in React 18+
createRoot(document.getElementById('root')).render(
  <BrowserRouter>
      <App />
      <Toaster 
        position="top-center"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#171717',
            color: '#f5f5f5',
            borderRadius: '12px',
            padding: '16px',
            border: '1px solid #262626',
            boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
          },
          success: {
            iconTheme: {
              primary: '#22c55e',
              secondary: '#171717',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#171717',
            },
          },
        }}
      />
  </BrowserRouter>
);
