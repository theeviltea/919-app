import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { Platform, useColorScheme } from 'react-native';

import { palette, type ColorScheme, type Colors } from './tokens';

export type SchemePreference = 'system' | ColorScheme;

type ThemeValue = {
  scheme: ColorScheme;
  preference: SchemePreference;
  setPreference: (p: SchemePreference) => void;
  c: Colors;
};

const ThemeContext = createContext<ThemeValue | null>(null);
const KEY = '919-theme';

// Prototype persistence: web keeps the choice in localStorage. Native will use the settings store once it exists.
const readSaved = (): SchemePreference => {
  if (Platform.OS !== 'web') return 'system';
  try {
    const v = globalThis.localStorage?.getItem(KEY);
    return v === 'light' || v === 'dark' ? v : 'system';
  } catch {
    return 'system';
  }
};

/** Follows the OS theme by default; the user can force light or dark in Settings. */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const system = useColorScheme();
  const [preference, setPref] = useState<SchemePreference>(readSaved);
  // Web is a single-page build (app.json web.output = "single"), so the OS scheme is known on first render.
  const scheme: ColorScheme = preference !== 'system' ? preference : system === 'dark' ? 'dark' : 'light';

  const setPreference = useCallback((p: SchemePreference) => {
    setPref(p);
    if (Platform.OS !== 'web') return;
    try {
      if (p === 'system') globalThis.localStorage?.removeItem(KEY);
      else globalThis.localStorage?.setItem(KEY, p);
    } catch {}
  }, []);

  // Web: page background and form controls follow the app theme, not only the OS one.
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof document === 'undefined') return;
    const root = document.documentElement;
    root.style.backgroundColor = palette[scheme].back;
    root.style.colorScheme = scheme;
    document.body.style.backgroundColor = palette[scheme].back;
  }, [scheme]);

  const value = useMemo(() => ({ scheme, preference, setPreference, c: palette[scheme] as Colors }), [scheme, preference, setPreference]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const v = useContext(ThemeContext);
  if (!v) throw new Error('useTheme must be used inside <ThemeProvider>');
  return v;
}
