import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useColorScheme } from 'react-native';

import { palette, type ColorScheme, type Colors } from './tokens';

export type SchemePreference = 'system' | ColorScheme;

type ThemeValue = {
  scheme: ColorScheme;
  preference: SchemePreference;
  setPreference: (p: SchemePreference) => void;
  c: Colors;
};

const ThemeContext = createContext<ThemeValue | null>(null);

/** Follows the OS theme by default; the user can force light or dark in Settings. */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const system = useColorScheme();
  const [preference, setPreference] = useState<SchemePreference>('system');
  // Static web rendering has no OS scheme until hydration.
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);

  const scheme: ColorScheme =
    preference !== 'system' ? preference : hydrated && system === 'dark' ? 'dark' : 'light';

  const value = useMemo(
    () => ({ scheme, preference, setPreference, c: palette[scheme] as Colors }),
    [scheme, preference],
  );
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const v = useContext(ThemeContext);
  if (!v) throw new Error('useTheme must be used inside <ThemeProvider>');
  return v;
}
