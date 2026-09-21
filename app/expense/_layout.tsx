import React from 'react';
import { Stack } from 'expo-router';
import { useAppTheme } from '@/hooks';

export default function ExpenseLayout() {
  const { colors } = useAppTheme();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: colors.background,
        },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen
        name="add"
        options={{
          animation: 'slide_from_bottom',
        }}
      />
      <Stack.Screen
        name="history"
        options={{
          animation: 'slide_from_right',
        }}
      />
      <Stack.Screen
        name="[id]"
        options={{
          animation: 'slide_from_right',
        }}
      />
      <Stack.Screen
        name="edit/[id]"
        options={{
          animation: 'slide_from_bottom',
        }}
      />
    </Stack>
  );
}
