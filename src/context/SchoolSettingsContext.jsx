import React, { createContext, useContext, useState, useEffect } from 'react';
import { DataService, SEED_SETTINGS } from '../services/dataService';

const SchoolSettingsContext = createContext(null);

export function SchoolSettingsProvider({ children }) {
  const [settings, setSettings] = useState(() => {
    try {
      return DataService.getSettings();
    } catch {
      return SEED_SETTINGS;
    }
  });

  const updateSettings = (newSettings) => {
    const updated = DataService.updateSettings(newSettings);
    setSettings(updated);
    return updated;
  };

  const refreshSettings = () => {
    const refreshed = DataService.getSettings();
    setSettings(refreshed);
  };

  return (
    <SchoolSettingsContext.Provider
      value={{
        settings,
        updateSettings,
        refreshSettings,
      }}
    >
      {children}
    </SchoolSettingsContext.Provider>
  );
}

export function useSchoolSettings() {
  const context = useContext(SchoolSettingsContext);
  if (!context) {
    // Graceful fallback if used outside provider
    return {
      settings: SEED_SETTINGS,
      updateSettings: () => {},
      refreshSettings: () => {},
    };
  }
  return context;
}
