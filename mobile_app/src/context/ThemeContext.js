import React, { createContext, useContext, useState, useMemo } from 'react';
import { lightColors, darkColors, spacing, radius, font, CATEGORY_COLORS } from '../theme';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(false);

  const toggleTheme = () => setIsDark((prev) => !prev);

  const value = useMemo(
    () => ({
      isDark,
      toggleTheme,
      colors: isDark ? darkColors : lightColors,
      spacing,
      radius,
      font,
      CATEGORY_COLORS,
    }),
    [isDark]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useAppTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useAppTheme must be used inside ThemeProvider');
  return ctx;
}
