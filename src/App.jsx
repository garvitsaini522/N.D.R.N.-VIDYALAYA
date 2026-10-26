import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SchoolSettingsProvider } from './context/SchoolSettingsContext';
import AppRoutes from './routes/AppRoutes';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SchoolSettingsProvider>
          <AppRoutes />
        </SchoolSettingsProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
