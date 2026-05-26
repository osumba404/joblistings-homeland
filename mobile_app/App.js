import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider, useAppTheme } from './src/context/ThemeContext';
import AppNavigator from './src/navigation/AppNavigator';

// NavigationContainer needs the theme *inside* ThemeProvider so it can read colors
function ThemedNavigationContainer({ children }) {
  const { colors, isDark } = useAppTheme();
  return (
    <NavigationContainer
      theme={{
        dark: isDark,
        colors: {
          primary: colors.primary,
          background: colors.background,
          card: colors.surface,
          text: colors.textPrimary,
          border: colors.border,
          notification: '#D32F2F',
        },
      }}
    >
      {children}
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <SafeAreaProvider>
        <ThemedNavigationContainer>
          <AppNavigator />
        </ThemedNavigationContainer>
      </SafeAreaProvider>
    </ThemeProvider>
  );
}
