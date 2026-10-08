import { createContext, useCallback, useContext, useLayoutEffect, useMemo, useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { useAuth } from './AuthContext';
import { db } from '../firebase';

const STORAGE_KEY = 'smartstudy.settings.v1';
const DEFAULT_THEME = 'cloud';
const THEMES = ['cloud', 'lavender', 'mint', 'sunset', 'midnight', 'graphite', 'forest', 'plum', 'ocean', 'ember'];
const DEFAULT_SETTINGS = { highContrast: false, reduceMotion: false };
const SettingsContext = createContext(null);

function readSettings() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    return {
      highContrast: typeof saved.highContrast === 'boolean' ? saved.highContrast : DEFAULT_SETTINGS.highContrast,
      reduceMotion: typeof saved.reduceMotion === 'boolean' ? saved.reduceMotion : DEFAULT_SETTINGS.reduceMotion,
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

// eslint-disable-next-line react-refresh/only-export-components
export function useSettings() {
  return useContext(SettingsContext);
}

export function SettingsProvider({ children }) {
  const { currentUser, userProfile } = useAuth();
  const currentUid = currentUser?.uid;
  const [settings, setSettings] = useState(readSettings);
  // Signed-out visitors use the base theme; signed-in users use their Firestore profile.
  const theme = currentUid && THEMES.includes(userProfile?.theme) ? userProfile.theme : DEFAULT_THEME;

  useLayoutEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = theme;
    root.dataset.contrast = settings.highContrast ? 'high' : 'normal';
    root.dataset.motion = settings.reduceMotion ? 'reduced' : 'full';
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {
      // The current session still works if browser storage is unavailable.
    }
  }, [settings, theme]);

  const setTheme = useCallback(async (nextTheme) => {
    if (!THEMES.includes(nextTheme)) return;
    if (!currentUid || !db) return;

    try {
      await updateDoc(doc(db, 'users', currentUid), { theme: nextTheme });
    } catch (error) {
      console.error('Saving theme failed:', error);
      window.alert('Shranjevanje teme ni uspelo. Preveri povezavo in poskusi znova.');
    }
  }, [currentUid]);

  const value = useMemo(() => ({
    ...settings,
    theme,
    setTheme,
    setHighContrast: (highContrast) => setSettings((previous) => ({ ...previous, highContrast })),
    setReduceMotion: (reduceMotion) => setSettings((previous) => ({ ...previous, reduceMotion })),
  }), [settings, theme, setTheme]);

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}
