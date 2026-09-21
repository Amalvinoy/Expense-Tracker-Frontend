import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useAuthStore } from '@/store/auth.store';
import { useSettingsStore } from '@/features/settings/store/settings.store';
import { useAppTheme } from '@/hooks';

export default function RootLayout() {
  const { isDark, colors, paperTheme } = useAppTheme();
  const { loadTokenFromStorage } = useAuthStore();
  const { loadSettings } = useSettingsStore();

  useEffect(() => {
    loadTokenFromStorage();
    loadSettings();
  }, [loadTokenFromStorage, loadSettings]);

  return (
    <SafeAreaProvider>
      <PaperProvider theme={paperTheme}>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        <Stack
          screenOptions={{
            headerStyle: {
              backgroundColor: colors.surface,
            },
            headerTintColor: colors.textPrimary,
            headerTitleStyle: {
              fontWeight: '600',
            },
            contentStyle: {
              backgroundColor: colors.background,
            },
          }}
        >
          <Stack.Screen
            name="index"
            options={{
              title: 'Expense Tracker',
              headerShown: true,
            }}
          />
          <Stack.Screen
            name="(auth)"
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="categories/index"
            options={{
              title: 'Categories',
              headerShown: false,
              animation: 'slide_from_right',
            }}
          />
          <Stack.Screen
            name="reports/index"
            options={{
              title: 'Reports',
              headerShown: false,
              animation: 'slide_from_right',
            }}
          />
          <Stack.Screen
            name="budget/index"
            options={{
              title: 'Budget',
              headerShown: false,
              animation: 'slide_from_right',
            }}
          />
          <Stack.Screen
            name="lending/index"
            options={{
              title: 'Lending',
              headerShown: false,
              animation: 'slide_from_right',
            }}
          />
          <Stack.Screen
            name="income/index"
            options={{
              title: 'Income & Savings',
              headerShown: false,
              animation: 'slide_from_right',
            }}
          />
          <Stack.Screen
            name="settings/index"
            options={{
              title: 'Settings',
              headerShown: false,
              animation: 'slide_from_right',
            }}
          />
          <Stack.Screen
            name="expense"
            options={{
              headerShown: false,
            }}
          />
        </Stack>
      </PaperProvider>
    </SafeAreaProvider>
  );
}
