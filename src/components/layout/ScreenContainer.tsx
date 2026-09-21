import React from 'react';
import {
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  ViewStyle,
  ScrollViewProps,
} from 'react-native';
import { SafeAreaView, Edge } from 'react-native-safe-area-context';
import { useAppTheme } from '@/hooks';
import { spacing } from '@/constants/spacing';

export interface ScreenContainerProps {
  children: React.ReactNode;
  scrollable?: boolean;
  withPadding?: boolean;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  edges?: Edge[];
  backgroundColor?: string;
  style?: ViewStyle;
  contentContainerStyle?: ViewStyle;
  scrollViewProps?: ScrollViewProps;
}

export const ScreenContainer: React.FC<ScreenContainerProps> = ({
  children,
  scrollable = false,
  withPadding = true,
  header,
  footer,
  edges = ['top', 'left', 'right'],
  backgroundColor,
  style,
  contentContainerStyle,
  scrollViewProps,
}) => {
  const { colors } = useAppTheme();
  const paddingStyle = withPadding ? styles.padding : undefined;
  const resolvedBg = backgroundColor ?? colors.background;

  return (
    <SafeAreaView edges={edges} style={[styles.safeArea, { backgroundColor: resolvedBg }, style]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardContainer}
      >
        {header && <View style={styles.headerSlot}>{header}</View>}

        {scrollable ? (
          <ScrollView
            style={styles.flexOne}
            contentContainerStyle={[
              styles.scrollContent,
              paddingStyle,
              contentContainerStyle,
            ]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            {...scrollViewProps}
          >
            {children}
          </ScrollView>
        ) : (
          <View style={[styles.flexOne, paddingStyle, contentContainerStyle]}>
            {children}
          </View>
        )}

        {footer && (
          <View
            style={[
              styles.footerSlot,
              {
                backgroundColor: colors.surface,
                borderTopColor: colors.border,
              },
            ]}
          >
            {footer}
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  keyboardContainer: {
    flex: 1,
  },
  flexOne: {
    flex: 1,
  },
  padding: {
    paddingHorizontal: spacing.lg,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: spacing.xxl,
  },
  headerSlot: {
    zIndex: 10,
  },
  footerSlot: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
  },
});
