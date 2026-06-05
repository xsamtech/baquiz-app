import { createContext, PropsWithChildren, useContext, useMemo, useState } from 'react';
import { ColorSchemeName, useColorScheme } from 'react-native';

export type ThemePreference = 'light' | 'dark' | 'auto';

type AppThemeContextValue = {
  preference: ThemePreference;
  setPreference: (preference: ThemePreference) => void;
  scheme: NonNullable<ColorSchemeName>;
  isDark: boolean;
};

const AppThemeContext = createContext<AppThemeContextValue | null>(null);

export function AppThemeProvider({ children }: PropsWithChildren) {
  const systemScheme = useColorScheme();
  const [preference, setPreference] = useState<ThemePreference>('auto');
  const scheme = preference === 'auto' ? systemScheme ?? 'light' : preference;

  const value = useMemo(
    () => ({
      preference,
      setPreference,
      scheme,
      isDark: scheme === 'dark',
    }),
    [preference, scheme]
  );

  return <AppThemeContext.Provider value={value}>{children}</AppThemeContext.Provider>;
}

export function useAppTheme() {
  const value = useContext(AppThemeContext);

  if (!value) {
    throw new Error('useAppTheme must be used inside AppThemeProvider');
  }

  return value;
}
