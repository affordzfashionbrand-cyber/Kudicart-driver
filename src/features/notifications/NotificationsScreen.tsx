import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { ScreenContainer } from '../../components/ScreenContainer';
import { colors } from '../../theme/colors';
import {
  useNotificationStore,
  NotificationCategory,
  NotificationItem,
} from '../../store/useNotificationStore';
import { KudiIcon } from '../../components/KudiIcon';
import { toast } from '../../store/useToastStore';
import { styles } from './notifications.styles';

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
            {unreadCount > 0 && (
              <Text style={styles.headerSubtitle}>{unreadCount} unread update{unreadCount > 1 ? 's' : ''}</Text>
            )}
          </View>
        </View>

        {unreadCount > 0 && (
          <TouchableOpacity
            style={styles.markAllReadBtn}
            onPress={() => {
              markAllAsRead();
              toast.info('All notifications marked as read.');
            }}
            accessibilityRole="button"
            accessibilityLabel="Mark all notifications as read"
          >
            <Text style={styles.markAllReadText}>Mark all read</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Horizontal Bar */}
      <View style={styles.filterBar}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterContent}
        >
          {(
            [
              { key: 'ALL', label: 'All' },
              { key: 'ORDER', label: 'Orders' },
              { key: 'SURGE', label: 'Surge' },
              { key: 'SHIFT', label: 'Shifts' },
              { key: 'PAYOUT', label: 'Earnings' },
              { key: 'SYSTEM', label: 'Account' },
            ] as { key: FilterType; label: string }[]
          ).map((tab) => {
            const isActive = activeFilter === tab.key;
            return (
              <TouchableOpacity
                key={tab.key}
                style={[styles.filterChip, isActive && styles.filterChipActive]}
                onPress={() => setActiveFilter(tab.key)}
                accessibilityRole="tab"
                accessibilityLabel={`Filter ${tab.label}`}
                accessibilityState={{ selected: isActive }}
              >
                <Text style={[styles.filterChipText, isActive && styles.filterChipTextActive]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Notifications List */}
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {filteredList.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconWrap}>
              <KudiIcon name="bell-off" size={28} color="#8A8781" />
            </View>
            <Text style={styles.emptyTitle}>No notifications</Text>
            <Text style={styles.emptySubtitle}>
              You're all caught up! Updates regarding your orders, shifts, and payouts will appear here.
            </Text>
          </View>
        ) : (
          filteredList.map((item) => {
            const iconConfig = getCategoryIcon(item.category);
            const isUnread = !item.read;
            return (
              <TouchableOpacity
                key={item.id}
                style={[styles.card, isUnread && styles.cardUnread]}
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
                      style={[styles.cardTitle, isUnread && styles.cardTitleUnread]}
                      numberOfLines={1}
                    >
                      {item.title}
                    </Text>
                    {isUnread && <View style={styles.unreadDot} />}
                  </View>

                  <Text style={[styles.cardBody, isUnread && styles.cardBodyUnread]}>
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
