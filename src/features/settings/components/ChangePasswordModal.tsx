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
import { AppText } from '@/components/common/AppText';
import { AppButton } from '@/components/common/AppButton';
import { AppInput } from '@/components/common/AppInput';
import { AppIcon } from '@/components/common/AppIcon';
import { useAppTheme } from '@/hooks/useAppTheme';
import { spacing, radius, shadows } from '@/constants';

export interface ChangePasswordModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
}

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  visible,
  onClose,
  onSuccess,
}) => {
  const { colors } = useAppTheme();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [errors, setErrors] = useState<{
    current?: string;
    new?: string;
    confirm?: string;
  }>({});

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleResetForm = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setErrors({});
    setShowCurrent(false);
    setShowNew(false);
    setShowConfirm(false);
  };

  const handleClose = () => {
    handleResetForm();
    onClose();
  };

  const handleSubmit = async () => {
    const errs: typeof errors = {};

    if (!currentPassword) {
      errs.current = 'Please enter your current password';
    }
    if (!newPassword || newPassword.length < 8) {
      errs.new = 'New password must be at least 8 characters';
    }
    if (newPassword !== confirmPassword) {
      errs.confirm = 'Passwords do not match';
    }

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setIsSubmitting(true);
    // Simulate short network delay for placeholder
    await new Promise((resolve) => setTimeout(resolve, 600));
    setIsSubmitting(false);

    handleClose();
    onSuccess('Password updated successfully.');
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.overlay}
      >
        <Pressable style={styles.backdrop} onPress={handleClose} />

        <View style={[styles.sheet, { backgroundColor: colors.surface }]}>
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: colors.divider }]}>
            <View>
              <AppText variant="headingSm">Change Password</AppText>
              <AppText variant="caption" color={colors.textSecondary}>
                Enter your current and new password
              </AppText>
            </View>

            <Pressable
              onPress={handleClose}
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
            {/* Current Password */}
            <View style={styles.field}>
              <AppText variant="labelMd" color={colors.textPrimary} style={{ marginBottom: spacing.xs }}>
                Current Password
              </AppText>
              <AppInput
                placeholder="Enter current password"
                value={currentPassword}
                onChangeText={(t) => {
                  setCurrentPassword(t);
                  if (errors.current) setErrors((prev) => ({ ...prev, current: undefined }));
                }}
                secureTextEntry={!showCurrent}
                leftIcon={<AppIcon name="lock-outline" size={20} color={colors.textSecondary} />}
                rightIcon={
                  <Pressable onPress={() => setShowCurrent(!showCurrent)} hitSlop={8}>
                    <AppIcon
                      name={showCurrent ? 'eye-off-outline' : 'eye-outline'}
                      size={20}
                      color={colors.textSecondary}
                    />
                  </Pressable>
                }
                error={errors.current}
              />
            </View>

            {/* New Password */}
            <View style={styles.field}>
              <AppText variant="labelMd" color={colors.textPrimary} style={{ marginBottom: spacing.xs }}>
                New Password
              </AppText>
              <AppInput
                placeholder="Minimum 8 characters"
                value={newPassword}
                onChangeText={(t) => {
                  setNewPassword(t);
                  if (errors.new) setErrors((prev) => ({ ...prev, new: undefined }));
                }}
                secureTextEntry={!showNew}
                leftIcon={<AppIcon name="lock-plus-outline" size={20} color={colors.textSecondary} />}
                rightIcon={
                  <Pressable onPress={() => setShowNew(!showNew)} hitSlop={8}>
                    <AppIcon
                      name={showNew ? 'eye-off-outline' : 'eye-outline'}
                      size={20}
                      color={colors.textSecondary}
                    />
                  </Pressable>
                }
                error={errors.new}
              />
            </View>

            {/* Confirm Password */}
            <View style={styles.field}>
              <AppText variant="labelMd" color={colors.textPrimary} style={{ marginBottom: spacing.xs }}>
                Confirm New Password
              </AppText>
              <AppInput
                placeholder="Re-enter new password"
                value={confirmPassword}
                onChangeText={(t) => {
                  setConfirmPassword(t);
                  if (errors.confirm) setErrors((prev) => ({ ...prev, confirm: undefined }));
                }}
                secureTextEntry={!showConfirm}
                leftIcon={<AppIcon name="lock-check-outline" size={20} color={colors.textSecondary} />}
                rightIcon={
                  <Pressable onPress={() => setShowConfirm(!showConfirm)} hitSlop={8}>
                    <AppIcon
                      name={showConfirm ? 'eye-off-outline' : 'eye-outline'}
                      size={20}
                      color={colors.textSecondary}
                    />
                  </Pressable>
                }
                error={errors.confirm}
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
                onPress={handleClose}
                fullWidth
              />
            </View>
            <View style={{ flex: 1, marginLeft: spacing.xs }}>
              <AppButton
                title={isSubmitting ? 'Updating...' : 'Update Password'}
                variant="primary"
                size="md"
                loading={isSubmitting}
                onPress={handleSubmit}
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

