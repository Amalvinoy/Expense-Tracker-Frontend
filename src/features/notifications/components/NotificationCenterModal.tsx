import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Modal,
  Pressable,
  ScrollView,
} from 'react-native';
import { AppText } from '@/components/common/AppText';
import { AppIcon } from '@/components/common/AppIcon';
import { AppButton } from '@/components/common/AppButton';
import { EmptyState } from '@/components/feedback/EmptyState';
import { useNotificationStore } from '../store/notification.store';
import { useAppTheme } from '@/hooks/useAppTheme';
import { spacing, radius } from '@/constants';
import { NotificationType } from '@/services/notifications';

export interface NotificationCenterModalProps {
  visible: boolean;
  onClose: () => void;
}

export const NotificationCenterModal: React.FC<NotificationCenterModalProps> = ({
  visible,
  onClose,
}) => {
  const { colors } = useAppTheme();
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
    sendTestDailyReminder,
    sendTestBudgetWarning,
    sendTestMonthlySummary,
  } = useNotificationStore();

  const [showTestControls, setShowTestControls] = useState(false);

  const getIconConfig = (type: NotificationType) => {
    switch (type) {
      case 'daily_reminder':
        return {
          name: 'bell-ring',
          color: colors.warning,
          bg: colors.warningSoft,
          label: 'Daily Reminder',
        };
      case 'budget_warning':
        return {
          name: 'alert-octagon',
          color: colors.expense,
          bg: colors.expenseSoft,
          label: 'Budget Alert',
        };
      case 'monthly_summary':
        return {
          name: 'chart-pie',
          color: colors.primary,
          bg: colors.primarySoft,
          label: 'Monthly Summary',
        };
      default:
        return {
          name: 'information-outline',
          color: colors.info,
          bg: colors.infoSoft,
          label: 'System Notice',
        };
    }
  };

  const formatTimestamp = (iso: string) => {
    try {
      const d = new Date(iso);
      const now = new Date();
      const diffMs = now.getTime() - d.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch {
      return '';
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.sheetContainer, { backgroundColor: colors.surface }]}>
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: colors.divider }]}>
            <View style={styles.titleRow}>
              <AppIcon name="bell-outline" size={24} color={colors.primary} />
              <AppText variant="headingSm" style={{ marginLeft: spacing.xs }}>
                Notifications
              </AppText>
              {unreadCount > 0 && (
                <View style={[styles.badge, { backgroundColor: colors.expense }]}>
                  <AppText variant="captionSmallMedium" color="#FFFFFF">
                    {unreadCount} new
                  </AppText>
                </View>
              )}
            </View>

            <Pressable
              onPress={onClose}
              hitSlop={12}
              style={styles.closeBtn}
              accessibilityRole="button"
              accessibilityLabel="Close notifications"
            >
              <AppIcon name="close" size={24} color={colors.textSecondary} />
            </Pressable>
          </View>

          {/* Action Row */}
          {notifications.length > 0 && (
            <View style={[styles.actionBar, { borderBottomColor: colors.divider }]}>
              {unreadCount > 0 ? (
                <Pressable
                  onPress={markAllAsRead}
                  style={styles.actionLink}
                  accessibilityRole="button"
                >
                  <AppIcon name="check-all" size={16} color={colors.primary} />
                  <AppText variant="captionSmallMedium" color={colors.primary}>
                    Mark all as read
                  </AppText>
                </Pressable>
              ) : (
                <View />
              )}

              <Pressable
                onPress={clearAll}
                style={styles.actionLink}
                accessibilityRole="button"
              >
                <AppIcon name="trash-can-outline" size={16} color={colors.textSecondary} />
                <AppText variant="captionSmallMedium" color={colors.textSecondary}>
                  Clear all
                </AppText>
              </Pressable>
            </View>
          )}

          {/* List or Empty State */}
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={
              notifications.length === 0 ? styles.emptyContainer : styles.listContent
            }
          >
            {notifications.length === 0 ? (
              <EmptyState
                icon="bell-sleep-outline"
                title="No Notifications Yet"
                description="Your daily reminders, budget alerts, and monthly summaries will appear here."
              />
            ) : (
              notifications.map((item) => {
                const conf = getIconConfig(item.type);
                return (
                  <Pressable
                    key={item.id}
                    onPress={() => markAsRead(item.id)}
                    style={[
                      styles.itemCard,
                      {
                        backgroundColor: item.isRead
                          ? colors.surface
                          : colors.surfaceVariant,
                        borderColor: item.isRead
                          ? colors.border
                          : colors.primarySoft,
                      },
                    ]}
                  >
                    <View style={[styles.itemIconBox, { backgroundColor: conf.bg }]}>
                      <AppIcon name={conf.name} size={20} color={conf.color} />
                    </View>

                    <View style={styles.itemContent}>
                      <View style={styles.itemTopRow}>
                        <View style={styles.itemTagRow}>
                          <AppText
                            variant="captionSmallMedium"
                            color={conf.color}
                            style={styles.tagText}
                          >
                            {conf.label}
                          </AppText>
                          {!item.isRead && (
                            <View
                              style={[
                                styles.unreadDot,
                                { backgroundColor: colors.expense },
                              ]}
                            />
                          )}
                        </View>
                        <AppText variant="captionSmall" color={colors.textSecondary}>
                          {formatTimestamp(item.timestamp)}
                        </AppText>
                      </View>

                      <AppText
                        variant="bodySmBold"
                        color={colors.textPrimary}
                        style={styles.itemTitle}
                      >
                        {item.title}
                      </AppText>

                      <AppText
                        variant="bodySm"
                        color={colors.textSecondary}
                        style={styles.itemBody}
                      >
                        {item.body}
                      </AppText>
                    </View>

                    <Pressable
                      onPress={() => deleteNotification(item.id)}
                      hitSlop={8}
                      style={styles.itemDeleteBtn}
                      accessibilityRole="button"
                      accessibilityLabel="Delete notification"
                    >
                      <AppIcon name="close" size={16} color={colors.textMuted} />
                    </Pressable>
                  </Pressable>
                );
              })
            )}
          </ScrollView>

          {/* Test Controls Collapsible Footer */}
          <View style={[styles.testSection, { borderTopColor: colors.divider }]}>
            <Pressable
              onPress={() => setShowTestControls((v) => !v)}
              style={styles.testToggleBtn}
            >
              <AppIcon
                name={showTestControls ? 'chevron-down' : 'chevron-up'}
                size={18}
                color={colors.textSecondary}
              />
              <AppText variant="captionSmallMedium" color={colors.textSecondary}>
                {showTestControls ? 'Hide Test Triggers' : 'Simulate & Test Notifications'}
              </AppText>
            </Pressable>

            {showTestControls && (
              <View style={styles.testBtnRow}>
                <AppButton
                  title="Daily Reminder"
                  size="sm"
                  variant="outline"
                  onPress={sendTestDailyReminder}
                  style={styles.testBtn}
                />
                <AppButton
                  title="Budget Warning"
                  size="sm"
                  variant="outline"
                  onPress={sendTestBudgetWarning}
                  style={styles.testBtn}
                />
                <AppButton
                  title="Monthly Summary"
                  size="sm"
                  variant="outline"
                  onPress={sendTestMonthlySummary}
                  style={styles.testBtn}
                />
              </View>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    maxHeight: '85%',
    minHeight: '45%',
    flexDirection: 'column',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badge: {
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: radius.full,
    marginLeft: spacing.xs,
  },
  closeBtn: {
    padding: spacing.xxs,
  },
  actionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs,
    borderBottomWidth: 1,
  },
  actionLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
  },
  scrollView: {
    flex: 1,
  },
  listContent: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  itemCard: {
    flexDirection: 'row',
    borderRadius: radius.lg,
    padding: spacing.sm,
    borderWidth: 1,
    gap: spacing.sm,
  },
  itemIconBox: {
    width: 38,
    height: 38,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  itemContent: {
    flex: 1,
  },
  itemTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  itemTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tagText: {
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  unreadDot: {
    width: 6,
    height: 6,
    borderRadius: radius.full,
  },
  itemTitle: {
    marginTop: 2,
  },
  itemBody: {
    marginTop: 2,
    lineHeight: 18,
  },
  itemDeleteBtn: {
    padding: spacing.xxs,
    alignSelf: 'flex-start',
  },
  testSection: {
    borderTopWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  testToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.xxs,
  },
  testBtnRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.xs,
    justifyContent: 'space-between',
  },
  testBtn: {
    flex: 1,
    minWidth: 100,
  },
});
