import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { ScreenContainer } from '../../components/ScreenContainer';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { colors } from '../../theme/colors';
import { useNotificationStore, NotificationCategory, NotificationItem } from '../../store/useNotificationStore';
import { KudiIcon } from '../../components/KudiIcon';
import { toast } from '../../store/useToastStore';

type FilterType = 'ALL' | NotificationCategory;

export const NotificationsScreen = ({ navigation }: any) => {
  const { notifications, markAsRead, markAllAsRead } = useNotificationStore();
  const [activeFilter, setActiveFilter] = useState<FilterType>('ALL');

  const unreadCount = notifications.filter((n) => !n.read).length;

  const filteredList = notifications.filter((item) => {
    if (activeFilter === 'ALL') return true;
    return item.category === activeFilter;
  });

  const handleBack = () => {
    if (navigation?.canGoBack && navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation?.navigate('Home');
    }
  };

  const handleNotificationPress = (item: NotificationItem) => {
    if (!item.read) {
      markAsRead(item.id);
    }
    if (item.actionRoute) {
      if (item.actionRoute === 'OrderDetails') {
        navigation?.navigate('OrderDetails', { orderId: 'KC-ORD-8492' });
      } else if (item.actionRoute === 'Slots') {
        navigation?.navigate('Slots');
      } else if (item.actionRoute === 'Earnings') {
        navigation?.navigate('Earnings');
      } else if (item.actionRoute === 'Home') {
        navigation?.navigate('Home');
      }
    }
  };

  const getCategoryIcon = (category: NotificationCategory) => {
    switch (category) {
      case 'ORDER':
        return {
          name: 'package' as const,
          color: '#16805A',
          bg: '#EDFDF5',
        };
      case 'SURGE':
        return {
          name: 'zap' as const,
          color: '#D94B17',
          bg: '#FFF0E8',
        };
      case 'SHIFT':
        return {
          name: 'calendar' as const,
          color: '#0284C7',
          bg: '#E0F2FE',
        };
      case 'PAYOUT':
        return {
          name: 'wallet' as const,
          color: '#16805A',
          bg: '#EDFDF5',
        };
      case 'SYSTEM':
      default:
        return {
          name: 'shield' as const,
          color: '#65635F',
          bg: '#F3F1EC',
        };
    }
  };

  return (
    <ScreenContainer>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBack}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <KudiIcon name="arrow-left" size={20} color={colors.text} />
          </TouchableOpacity>
          <View>
            <Text style={styles.headerTitle}>Notifications</Text>
            <Text style={styles.headerSubtitle}>
              {unreadCount > 0 ? `${unreadCount} unread ${unreadCount === 1 ? 'alert' : 'alerts'}` : 'All caught up'}
            </Text>
          </View>
        </View>

        {unreadCount > 0 && (
          <TouchableOpacity
            style={styles.markAllReadBtn}
            onPress={() => {
              markAllAsRead();
              toast.success('All notifications marked as read.');
            }}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Mark all notifications as read"
          >
            <Text style={styles.markAllReadText}>Mark read</Text>
          </TouchableOpacity>
        )}

      </View>

      {/* Category Filter Chips */}
      <View style={styles.filterBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterContent}>
          <TouchableOpacity
            style={[styles.filterChip, activeFilter === 'ALL' && styles.filterChipActive]}
            onPress={() => setActiveFilter('ALL')}
            activeOpacity={0.7}
          >
            <Text style={[styles.filterChipText, activeFilter === 'ALL' && styles.filterChipTextActive]}>
              All {notifications.length > 0 ? `(${notifications.length})` : ''}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterChip, activeFilter === 'ORDER' && styles.filterChipActive]}
            onPress={() => setActiveFilter('ORDER')}
            activeOpacity={0.7}
          >
            <Text style={[styles.filterChipText, activeFilter === 'ORDER' && styles.filterChipTextActive]}>
              Orders
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterChip, activeFilter === 'SURGE' && styles.filterChipActive]}
            onPress={() => setActiveFilter('SURGE')}
            activeOpacity={0.7}
          >
            <Text style={[styles.filterChipText, activeFilter === 'SURGE' && styles.filterChipTextActive]}>
              Surge & Incentives
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterChip, activeFilter === 'SHIFT' && styles.filterChipActive]}
            onPress={() => setActiveFilter('SHIFT')}
            activeOpacity={0.7}
          >
            <Text style={[styles.filterChipText, activeFilter === 'SHIFT' && styles.filterChipTextActive]}>
              Shifts & Slots
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterChip, activeFilter === 'PAYOUT' && styles.filterChipActive]}
            onPress={() => setActiveFilter('PAYOUT')}
            activeOpacity={0.7}
          >
            <Text style={[styles.filterChipText, activeFilter === 'PAYOUT' && styles.filterChipTextActive]}>
              Payouts
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Notifications List */}
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {filteredList.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconWrap}>
              <KudiIcon name="notifications" size={32} color={colors.textSecondary} />
            </View>
            <Text style={styles.emptyTitle}>No notifications</Text>
            <Text style={styles.emptySubtitle}>
              You don't have any notifications in this section right now. New alerts will show up here.
            </Text>
          </View>
        ) : (
          filteredList.map((item) => {
            const iconConfig = getCategoryIcon(item.category);
            const isUnread = !item.read;
            return (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.card,
                  isUnread && styles.cardUnread,
                ]}
                onPress={() => handleNotificationPress(item)}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel={`${item.title}, ${item.body}`}
              >
                {/* Category Icon */}
                <View
                  style={[
                    styles.iconWrap,
                    { backgroundColor: isUnread ? '#FFFFFF' : iconConfig.bg },
                    isUnread && styles.iconWrapUnread,
                  ]}
                >
                  <KudiIcon name={iconConfig.name} size={18} color={iconConfig.color} />
                </View>

                {/* Content */}
                <View style={styles.cardContent}>
                  <View style={styles.cardHeaderRow}>
                    <Text
                      style={[
                        styles.cardTitle,
                        isUnread && styles.cardTitleUnread,
                      ]}
                      numberOfLines={1}
                    >
                      {item.title}
                    </Text>
                    {isUnread && <View style={styles.unreadDot} />}
                  </View>

                  <Text
                    style={[
                      styles.cardBody,
                      isUnread && styles.cardBodyUnread,
                    ]}
                  >
                    {item.body}
                  </Text>

                  <View style={styles.cardFooter}>
                    <Text style={styles.cardTime}>{item.timestamp}</Text>

                    {item.amount && (
                      <View style={styles.amountPill}>
                        <Text style={styles.amountPillText}>{item.amount}</Text>
                      </View>
                    )}

                    {item.actionLabel && (
                      <View style={styles.actionBtn}>
                        <Text style={styles.actionBtnText}>{item.actionLabel}</Text>
                        <KudiIcon name="chevron-right" size={12} color={colors.primary} />
                      </View>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.l,
    paddingVertical: spacing.m,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F1EC',
    borderWidth: 1,
    borderColor: '#E2DED7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  headerSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 1,
  },
  markAllReadBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: '#F3F1EC',
    borderWidth: 1,
    borderColor: '#E2DED7',
  },
  markAllReadText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
  },
  filterBar: {
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  filterContent: {
    paddingHorizontal: spacing.l,
    paddingVertical: 10,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#F3F1EC',
    borderWidth: 1,
    borderColor: '#E2DED7',
  },
  filterChipActive: {
    backgroundColor: '#171716',
    borderColor: '#171716',
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  filterChipTextActive: {
    color: colors.white,
    fontWeight: '600',
  },
  container: {
    padding: spacing.m,
    paddingBottom: spacing.xxl,
    gap: 12,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2DED7',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  cardUnread: {
    backgroundColor: '#FFF0E8',
    borderColor: '#FFD6C5',
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  iconWrapUnread: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#FFD6C5',
  },
  cardContent: {
    flex: 1,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#171716',
    flex: 1,
    marginRight: 6,
  },
  cardTitleUnread: {
    fontWeight: '600',
    color: '#171716',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF5A1F',
  },
  cardBody: {
    fontSize: 13,
    color: '#65635F',
    lineHeight: 18,
    marginBottom: 8,
  },
  cardBodyUnread: {
    color: '#333333',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
  },
  cardTime: {
    fontSize: 11,
    color: colors.textMuted,
  },
  amountPill: {
    backgroundColor: '#FFF0E8',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#FFDAC8',
  },
  amountPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primaryDark,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 24,
  },
  emptyIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F3F1EC',
    borderWidth: 1,
    borderColor: '#E2DED7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 280,
  },
});
