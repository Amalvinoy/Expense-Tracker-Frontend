import React from 'react';
import { View, ActivityIndicator, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { AppText } from '../common/AppText';
import { useAppTheme } from '@/hooks';
import { spacing } from '@/constants/spacing';

export interface LoadingViewProps {
  message?: string;
  size?: 'small' | 'large';
  fullscreen?: boolean;
  style?: StyleProp<ViewStyle>;
}

export const LoadingView: React.FC<LoadingViewProps> = ({
  message,
  size = 'large',
  fullscreen = false,
  style,
}) => {
  const { colors } = useAppTheme();

  return (
    <View style={[styles.container, fullscreen && styles.fullscreen, style]}>
      <ActivityIndicator size={size} color={colors.primary} />
      {message && (
        <AppText
          variant="bodyMd"
          color={colors.textSecondary}
          style={styles.message}
          align="center"
        >
          {message}
        </AppText>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullscreen: {
    flex: 1,
    minHeight: 250,
  },
  message: {
    marginTop: spacing.md,
  },
});
