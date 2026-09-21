import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Pressable, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { AppText } from '@/components/common/AppText';
import { AppIcon } from '@/components/common/AppIcon';
import { useSettingsStore } from '../store/settings.store';
import {
  SettingsSection,
  SettingsRow,
  ProfileHeaderCard,
  EditProfileModal,
  CurrencyPickerModal,
  ChangePasswordModal,
  DocumentViewerModal,
} from '../components';
import {
  APP_INFO,
  PRIVACY_POLICY_SECTIONS,
  TERMS_OF_SERVICE_SECTIONS,
} from '../constants/settings.constants';
import { CurrencyOption, ThemePreference } from '../types/settings.types';
import { useBudgetStore } from '@/features/budget/store/budget.store';
import { NotificationCenterModal } from '@/features/notifications/components/NotificationCenterModal';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useAuthStore } from '@/store/auth.store';
import { spacing, radius } from '@/constants';
import { formatExpenseAmount } from '@/features/expenses/utils/expense.utils';

export function SettingsScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const {
    settings,
    loadSettings,
    updateProfile,
    setCurrency,
    setTheme,
    toggleNotification,
    toggleBiometric,
  } = useSettingsStore();

  const { logout } = useAuthStore();
  const { monthlyTotalBudget, loadBudgets } = useBudgetStore();

  const [editProfileVisible, setEditProfileVisible] = useState(false);
  const [currencyPickerVisible, setCurrencyPickerVisible] = useState(false);
  const [changePasswordVisible, setChangePasswordVisible] = useState(false);
  const [documentModal, setDocumentModal] = useState<{
    visible: boolean;
    title: string;
    subtitle?: string;
    sections: typeof PRIVACY_POLICY_SECTIONS;
  }>({
    visible: false,
    title: '',
    sections: [],
  });
  const [notificationCenterVisible, setNotificationCenterVisible] = useState(false);

  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  useEffect(() => {
    loadSettings();
    loadBudgets();
  }, [loadSettings, loadBudgets]);

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
  };

  const showFeedback = (msg: string) => {
    setSuccessBanner(msg);
    setTimeout(() => {
      setSuccessBanner(null);
    }, 2800);
  };

  const handleSaveProfile = async (name: string, email: string) => {
    await updateProfile(name, email);
    showFeedback('Profile updated successfully.');
  };

  const handleSelectCurrency = async (curr: CurrencyOption) => {
    await setCurrency(curr);
    showFeedback(`Currency set to ${curr.name} (${curr.symbol}).`);
  };

  const handleCycleTheme = async () => {
    const cycleMap: Record<ThemePreference, ThemePreference> = {
      system: 'light',
      light: 'dark',
      dark: 'system',
    };
    const nextTheme = cycleMap[settings.theme];
    await setTheme(nextTheme);
    const labelMap = { system: 'System Default', light: 'Light Mode', dark: 'Dark Mode' };
    showFeedback(`Theme set to ${labelMap[nextTheme]}.`);
  };

  const handleToggleBiometric = async (val: boolean) => {
    await toggleBiometric(val);
    if (val) {
      Alert.alert(
        'Biometric Lock Enabled',
        'Biometric authentication (Face ID / Fingerprint) has been set as your preferred unlock method on this device.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out of your account?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/(auth)/login');
          },
        },
      ]
    );
  };

  const themeLabelMap: Record<ThemePreference, string> = {
    system: 'System Default',
    light: 'Light Mode',
    dark: 'Dark Mode',
  };

  return (
    <ScreenContainer
      scrollable
      edges={['top', 'bottom']}
      header={
        <View
          style={[
            styles.navBar,
            { backgroundColor: colors.surface, borderBottomColor: colors.divider },
          ]}
        >
          <Pressable
            onPress={handleBack}
            style={styles.navButton}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <AppIcon name="chevron-left" size={28} color={colors.textPrimary} />
          </Pressable>

          <AppText variant="headingSm" style={styles.navTitle}>
            Settings & Preferences
          </AppText>

          <View style={{ width: 28 }} />
        </View>
      }
    >
      {/* Success Notification Banner */}
      {successBanner && (
        <View
          style={[
            styles.successBanner,
            { backgroundColor: colors.successSoft, borderColor: colors.incomeLight },
          ]}
        >
          <AppIcon name="check-circle" size={20} color={colors.success} />
          <AppText
            variant="bodyMdMedium"
            color={colors.success}
            style={{ marginLeft: spacing.xs, flex: 1 }}
          >
            {successBanner}
          </AppText>
        </View>
      )}

      {/* 1. User Profile Header */}
      <ProfileHeaderCard
        profile={settings.profile}
        onEditPress={() => setEditProfileVisible(true)}
      />

      {/* 2. Preferences Group */}
      <SettingsSection
        title="Preferences"
        description="Display currency, appearance, and reminders"
      >
        {/* Currency Row */}
        <SettingsRow
          icon="cash-multiple"
          iconColor={colors.primary}
          iconBg={colors.primarySoft}
          title="Reporting Currency"
          subtitle="All totals and metrics will reflect this currency"
          type="link"
          value={`${settings.currency.symbol} ${settings.currency.code}`}
          onPress={() => setCurrencyPickerVisible(true)}
        />

        {/* Theme / Dark Mode */}
        <SettingsRow
          icon={settings.theme === 'dark' ? 'weather-night' : settings.theme === 'light' ? 'weather-sunny' : 'theme-light-dark'}
          iconColor={colors.investment}
          iconBg={colors.investmentSoft}
          title="App Theme"
          subtitle="Tap to cycle System, Light, and Dark mode"
          type="link"
          value={themeLabelMap[settings.theme]}
          onPress={handleCycleTheme}
        />

        {/* Daily Reminders */}
        <SettingsRow
          icon="bell-ring-outline"
          iconColor={colors.warning}
          iconBg={colors.warningSoft}
          title="Daily Spending Reminder"
          subtitle={`Evening alert at ${settings.notifications.dailyReminderTime || '20:00'} to record today's spending`}
          type="toggle"
          toggleValue={settings.notifications.dailyReminder}
          onToggleChange={() => {
            toggleNotification('dailyReminder');
            showFeedback(
              settings.notifications.dailyReminder
                ? 'Daily expense reminder turned off.'
                : 'Daily expense reminder enabled for 8:00 PM.'
            );
          }}
        />

        {/* Budget Alerts */}
        <SettingsRow
          icon="alert-octagon-outline"
          iconColor={colors.expense}
          iconBg={colors.expenseSoft}
          title="Budget Limit Warnings"
          subtitle={`Alert when spending crosses ${settings.notifications.budgetWarningThreshold || 80}% of budget`}
          type="toggle"
          toggleValue={settings.notifications.budgetAlerts}
          onToggleChange={() => {
            toggleNotification('budgetAlerts');
            showFeedback(
              settings.notifications.budgetAlerts
                ? 'Budget warning alerts turned off.'
                : 'Budget warning alerts enabled.'
            );
          }}
        />

        {/* Monthly Summary */}
        <SettingsRow
          icon="chart-pie"
          iconColor={colors.primary}
          iconBg={colors.primarySoft}
          title="Monthly Spending Summary"
          subtitle="Digest of total expenditures and top categories at month transition"
          type="toggle"
          toggleValue={settings.notifications.monthlySummary}
          onToggleChange={() => {
            toggleNotification('monthlySummary');
            showFeedback(
              settings.notifications.monthlySummary
                ? 'Monthly spending summary turned off.'
                : 'Monthly spending summary enabled.'
            );
          }}
        />

        {/* Notification Center & Test */}
        <SettingsRow
          icon="bell-badge-outline"
          iconColor={colors.info}
          iconBg={colors.infoSoft}
          title="Notification Center & History"
          subtitle="View past alerts and simulate test notifications"
          type="link"
          value="View"
          onPress={() => setNotificationCenterVisible(true)}
          showDivider={false}
        />
      </SettingsSection>

      {/* 3. Financial Setup & Data Management */}
      <SettingsSection
        title="Financial Configuration"
        description="Manage budget limits and track money lent"
      >
        {/* Budget Link */}
        <SettingsRow
          icon="wallet-outline"
          iconColor={colors.income}
          iconBg={colors.incomeSoft}
          title="Budget & Limits"
          subtitle="Manage monthly caps and category allocations"
          type="link"
          value={formatExpenseAmount(monthlyTotalBudget, { currency: settings.currency.code })}
          onPress={() => router.push('/budget' as any)}
        />

        {/* Lending Link */}
        <SettingsRow
          icon="hand-coin-outline"
          iconColor={colors.warning}
          iconBg={colors.warningSoft}
          title="Money Lent (Lending)"
          subtitle="Track loans to people and repayments received"
          type="link"
          onPress={() => router.push('/lending' as any)}
          showDivider={true}
        />

        {/* Income & Savings Link */}
        <SettingsRow
          icon="cash-plus"
          iconColor={colors.success || '#10B981'}
          iconBg={`${colors.success || '#10B981'}20`}
          title="Income & Savings"
          subtitle="Record monthly income, track net savings & payment breakdown"
          type="link"
          onPress={() => router.push('/income' as any)}
          showDivider={false}
        />
      </SettingsSection>

      {/* 4. Security Section */}
      <SettingsSection
        title="Security & Access"
        description="Authentication and local app lock"
      >
        {/* Change Password */}
        <SettingsRow
          icon="lock-reset"
          iconColor={colors.primaryDark}
          iconBg={colors.primarySoft}
          title="Change Password"
          subtitle="Update login credentials"
          type="link"
          onPress={() => setChangePasswordVisible(true)}
        />

        {/* Biometric Lock */}
        <SettingsRow
          icon="fingerprint"
          iconColor={colors.income}
          iconBg={colors.incomeSoft}
          title="Biometric App Lock"
          subtitle="Require Face ID or fingerprint to open app"
          type="toggle"
          toggleValue={settings.security.biometricEnabled}
          onToggleChange={handleToggleBiometric}
          showDivider={false}
        />
      </SettingsSection>

      {/* 5. Account & Session */}
      <SettingsSection
        title="Account & Session"
        description="Session management and sign out"
      >
        <SettingsRow
          icon="logout"
          iconColor={colors.danger}
          iconBg={colors.dangerSoft}
          title="Log Out"
          subtitle="Sign out and return to the login screen"
          type="link"
          onPress={handleLogout}
          showDivider={false}
        />
      </SettingsSection>

      {/* 5. About & Legal Information */}
      <SettingsSection
        title="About Application"
        description="App build details and legal disclosures"
      >
        {/* App Version */}
        <SettingsRow
          icon="information-outline"
          iconColor={colors.textSecondary}
          iconBg={colors.surfaceVariant}
          title="Application Version"
          subtitle="Release build information"
          type="info"
          value={`v${APP_INFO.version} (${APP_INFO.build})`}
        />

        {/* Privacy Policy */}
        <SettingsRow
          icon="shield-check-outline"
          iconColor={colors.primary}
          iconBg={colors.primarySoft}
          title="Privacy Policy"
          subtitle="Read how your personal data is handled"
          type="link"
          onPress={() =>
            setDocumentModal({
              visible: true,
              title: 'Privacy Policy',
              subtitle: 'Last updated: September 2026',
              sections: PRIVACY_POLICY_SECTIONS,
            })
          }
        />

        {/* Terms of Service */}
        <SettingsRow
          icon="file-document-outline"
          iconColor={colors.investment}
          iconBg={colors.investmentSoft}
          title="Terms of Service"
          subtitle="Conditions governing application use"
          type="link"
          onPress={() =>
            setDocumentModal({
              visible: true,
              title: 'Terms of Service',
              subtitle: 'Last updated: September 2026',
              sections: TERMS_OF_SERVICE_SECTIONS,
            })
          }
          showDivider={false}
        />
      </SettingsSection>

      {/* Modals */}
      <EditProfileModal
        visible={editProfileVisible}
        profile={settings.profile}
        onClose={() => setEditProfileVisible(false)}
        onSave={handleSaveProfile}
      />

      <CurrencyPickerModal
        visible={currencyPickerVisible}
        selectedCurrency={settings.currency}
        onSelectCurrency={handleSelectCurrency}
        onClose={() => setCurrencyPickerVisible(false)}
      />

      <ChangePasswordModal
        visible={changePasswordVisible}
        onClose={() => setChangePasswordVisible(false)}
        onSuccess={showFeedback}
      />

      <DocumentViewerModal
        visible={documentModal.visible}
        title={documentModal.title}
        subtitle={documentModal.subtitle}
        sections={documentModal.sections}
        onClose={() =>
          setDocumentModal((prev) => ({ ...prev, visible: false }))
        }
      />

      <NotificationCenterModal
        visible={notificationCenterVisible}
        onClose={() => setNotificationCenterVisible(false)}
      />
    </ScreenContainer>
  );
}

export default SettingsScreen;

const styles = StyleSheet.create({
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
  },
  navButton: {
    padding: spacing.xxs,
  },
  navTitle: {
    fontWeight: '700',
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    padding: spacing.md,
    borderRadius: radius.md,
    marginHorizontal: spacing.lg,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
});
