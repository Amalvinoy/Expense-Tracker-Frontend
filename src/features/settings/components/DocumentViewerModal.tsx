import React from 'react';
import { View, StyleSheet, Modal, ScrollView, Pressable } from 'react-native';
import { AppText } from '@/components/common/AppText';
import { AppButton } from '@/components/common/AppButton';
import { AppIcon } from '@/components/common/AppIcon';
import { useAppTheme } from '@/hooks/useAppTheme';
import { spacing, radius, shadows } from '@/constants';

export interface DocumentSection {
  title: string;
  content: string;
}

export interface DocumentViewerModalProps {
  visible: boolean;
  title: string;
  subtitle?: string;
  sections: DocumentSection[];
  onClose: () => void;
}

export const DocumentViewerModal: React.FC<DocumentViewerModalProps> = ({
  visible,
  title,
  subtitle,
  sections,
  onClose,
}) => {
  const { colors } = useAppTheme();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />

        <View style={[styles.sheet, { backgroundColor: colors.surface }]}>
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: colors.divider }]}>
            <View>
              <AppText variant="headingSm">{title}</AppText>
              {subtitle && (
                <AppText variant="caption" color={colors.textSecondary}>
                  {subtitle}
                </AppText>
              )}
            </View>

            <Pressable
              onPress={onClose}
              style={styles.closeBtn}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Close"
            >
              <AppIcon name="close" size={22} color={colors.textSecondary} />
            </Pressable>
          </View>

          {/* Document Content */}
          <ScrollView
            style={styles.content}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {sections.map((sec, idx) => (
              <View key={idx} style={styles.sectionBlock}>
                <AppText variant="bodyMdMedium" weight="700" color={colors.textPrimary}>
                  {sec.title}
                </AppText>
                <AppText
                  variant="bodyMd"
                  color={colors.textSecondary}
                  style={styles.paragraph}
                >
                  {sec.content}
                </AppText>
              </View>
            ))}
          </ScrollView>

          {/* Footer */}
          <View style={[styles.footer, { borderTopColor: colors.divider }]}>
            <AppButton
              title="Close"
              variant="primary"
              size="md"
              onPress={onClose}
              fullWidth
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  sheet: {
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    maxHeight: '85%',
    ...shadows.floating,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
  },
  closeBtn: {
    padding: spacing.xxs,
  },
  content: {
    maxHeight: 500,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  sectionBlock: {
    marginBottom: spacing.lg,
  },
  paragraph: {
    marginTop: spacing.xs,
    lineHeight: 22,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
  },
});

