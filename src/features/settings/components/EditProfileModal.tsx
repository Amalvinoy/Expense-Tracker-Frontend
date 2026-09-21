import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Modal,
  ScrollView,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { UserProfileSettings } from '../types/settings.types';
import { AppText } from '@/components/common/AppText';
import { AppButton } from '@/components/common/AppButton';
import { AppInput } from '@/components/common/AppInput';
import { AppIcon } from '@/components/common/AppIcon';
import { useAppTheme } from '@/hooks/useAppTheme';
import { spacing, radius, shadows } from '@/constants';

export interface EditProfileModalProps {
  visible: boolean;
  profile: UserProfileSettings;
  onClose: () => void;
  onSave: (name: string, email: string) => Promise<void>;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  visible,
  profile,
  onClose,
  onSave,
}) => {
  const { colors } = useAppTheme();
  const [name, setName] = useState(profile.name);
  const [email, setEmail] = useState(profile.email);
  const [nameError, setNameError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [prevVisible, setPrevVisible] = useState(visible);
  const [prevProfile, setPrevProfile] = useState(profile);

  if (visible !== prevVisible || profile !== prevProfile) {
    setPrevVisible(visible);
    setPrevProfile(profile);
    setName(profile.name);
    setEmail(profile.email);
    setNameError(null);
    setEmailError(null);
  }

  const handleSave = async () => {
    let valid = true;
    if (!name.trim() || name.trim().length < 2) {
      setNameError('Name must be at least 2 characters');
      valid = false;
    } else {
      setNameError(null);
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !emailRegex.test(email.trim())) {
      setEmailError('Please enter a valid email address');
      valid = false;
    } else {
      setEmailError(null);
    }

    if (!valid) return;

    setIsSubmitting(true);
    try {
      await onSave(name.trim(), email.trim());
      onClose();
    } catch (err) {
      console.error('[EditProfileModal] Failed to update profile:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.overlay}
      >
        <Pressable style={styles.backdrop} onPress={onClose} />

        <View style={[styles.sheet, { backgroundColor: colors.surface }]}>
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: colors.divider }]}>
            <View>
              <AppText variant="headingSm">Edit Profile</AppText>
              <AppText variant="caption" color={colors.textSecondary}>
                Update your personal display details
              </AppText>
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

          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Full Name */}
            <View style={styles.field}>
              <AppText variant="labelMd" color={colors.textPrimary} style={{ marginBottom: spacing.xs }}>
                Full Name
              </AppText>
              <AppInput
                placeholder="Your full name"
                value={name}
                onChangeText={(text) => {
                  setName(text);
                  if (text.trim().length >= 2) setNameError(null);
                }}
                leftIcon={<AppIcon name="account-outline" size={20} color={colors.textSecondary} />}
                error={nameError || undefined}
              />
            </View>

            {/* Email Address */}
            <View style={styles.field}>
              <AppText variant="labelMd" color={colors.textPrimary} style={{ marginBottom: spacing.xs }}>
                Email Address
              </AppText>
              <AppInput
                placeholder="your.email@example.com"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text)) setEmailError(null);
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                leftIcon={<AppIcon name="email-outline" size={20} color={colors.textSecondary} />}
                error={emailError || undefined}
              />
            </View>
          </ScrollView>

          {/* Footer */}
          <View style={[styles.footer, { borderTopColor: colors.divider }]}>
            <View style={{ flex: 1, marginRight: spacing.xs }}>
              <AppButton
                title="Cancel"
                variant="outline"
                size="md"
                onPress={onClose}
                fullWidth
              />
            </View>
            <View style={{ flex: 1, marginLeft: spacing.xs }}>
              <AppButton
                title={isSubmitting ? 'Saving...' : 'Save Changes'}
                variant="primary"
                size="md"
                loading={isSubmitting}
                onPress={handleSave}
                fullWidth
              />
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
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
    paddingBottom: spacing.lg,
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
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  field: {
    marginBottom: spacing.md,
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
  },
});

