import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'smartstudy.settings.v1';
const DEFAULT_SETTINGS = { theme: 'cloud', highContrast: false, reduceMotion: false };
const SettingsContext = createContext(null);

function readSettings() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    const theme = ['cloud', 'lavender', 'mint', 'sunset', 'midnight', 'graphite', 'forest', 'plum', 'ocean', 'ember'].includes(saved.theme) ? saved.theme : 'cloud';
    return { ...DEFAULT_SETTINGS, ...saved, theme };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

// eslint-disable-next-line react-refresh/only-export-components
export function useSettings() {
  return useContext(SettingsContext);
}

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(readSettings);

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = settings.theme;
    root.dataset.contrast = settings.highContrast ? 'high' : 'normal';
    root.dataset.motion = settings.reduceMotion ? 'reduced' : 'full';
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {
      // The current session still works if browser storage is unavailable.
    }
  }, [settings]);

  const value = useMemo(() => ({
    ...settings,
    setTheme: (theme) => setSettings((previous) => ({ ...previous, theme })),
    setHighContrast: (highContrast) => setSettings((previous) => ({ ...previous, highContrast })),
    setReduceMotion: (reduceMotion) => setSettings((previous) => ({ ...previous, reduceMotion })),
  }), [settings]);

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}
