import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { dashboardStyles as styles } from './dashboard.styles';
import { earningsApi, BonusProgressResponse } from '../../../api';
import { getFriendlyErrorMessage } from '../../../utils/errorHandling';

interface DashboardBonusCardProps {
  navigation?: any;
}

export const DashboardBonusCard: React.FC<DashboardBonusCardProps> = ({ navigation }) => {
  const [bonusTab, setBonusTab] = useState<'daily' | 'weekly'>('daily');
  const [bonusWidth, setBonusWidth] = useState(0);
  const [bonusData, setBonusData] = useState<BonusProgressResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadBonusProgress = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const data = await earningsApi.getBonusProgress();
      setBonusData(data);
    } catch (err: any) {
      setLoadError(getFriendlyErrorMessage(err, 'Unable to load incentives right now.'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadBonusProgress();
  }, [loadBonusProgress]);

  const daily = bonusData?.dailyBonus;
  const weekly = bonusData?.weeklyBonus;

  const dailyOrdersCompleted = daily?.completedOrders ?? 0;
  const dailyOrdersTarget = daily?.targetOrders ?? 0;
  const dailyOrdersRemaining = daily?.ordersRemaining ?? 0;
  const dailyReward = daily?.nextReward ?? 0;
  const dailyPercent = dailyOrdersTarget > 0
    ? Math.min(100, Math.round((dailyOrdersCompleted / dailyOrdersTarget) * 100))
    : 0;

  const weeklyOrdersCompleted = weekly?.completedOrders ?? 0;
  const weeklyOrdersTarget = weekly?.targetOrders ?? 0;
  const weeklyOrdersRemaining = weekly?.ordersRemaining ?? 0;
  const weeklyReward = weekly?.nextReward ?? 0;
  const weeklyPercent = weeklyOrdersTarget > 0
    ? Math.min(100, Math.round((weeklyOrdersCompleted / weeklyOrdersTarget) * 100))
    : 0;

  const currentTier = bonusTab === 'daily' ? daily : weekly;
  const statusLabel =
    String(currentTier?.status || '').toUpperCase() === 'COMPLETED'
      ? 'Completed'
      : 'In progress';

  const earnedText = bonusTab === 'daily'
    ? `₹${daily?.rewardEarned ?? 0} earned`
    : `₹${weekly?.rewardEarned ?? 0} earned`;

  const handleViewDetails = () => {
    navigation?.navigate?.('IncentiveDetails', {
      mode: bonusTab,
    });
  };

  if (isLoading && !bonusData) {
    return (
      <View style={styles.card}>
        <View style={styles.bonusHeader}>
          <Text style={styles.bonusHeadline}>Incentives</Text>
          <ActivityIndicator size="small" color="#FF5A1F" />
        </View>
        <Text style={styles.bonusTargetMeta}>Loading your live daily & weekly targets...</Text>
      </View>
    );
  }

  if (loadError && !bonusData) {
    return (
      <View style={styles.card}>
        <View style={styles.bonusHeader}>
          <Text style={styles.bonusHeadline}>Incentives</Text>
          <TouchableOpacity onPress={() => void loadBonusProgress()} style={styles.viewDetailsBtn}>
            <Text style={styles.viewDetailsText}>Retry →</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.bonusTargetMeta}>{loadError}</Text>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <View style={styles.bonusHeader}>
        <Text style={styles.bonusHeadline}>
          {bonusTab === 'daily' ? 'Daily bonus' : 'Weekly bonus'}
        </Text>
        <Text style={styles.bonusAmount}>{earnedText}</Text>
      </View>

      <View
        style={{ flex: 1, minHeight: 120 }}
        onLayout={(e) => setBonusWidth(e.nativeEvent.layout.width)}
      >
        {bonusWidth > 0 && (
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={(e) => {
              const page = Math.round(e.nativeEvent.contentOffset.x / bonusWidth);
              const newTab = page === 0 ? 'daily' : 'weekly';
              if (bonusTab !== newTab) setBonusTab(newTab);
            }}
            scrollEventThrottle={16}
          >
            {/* DAILY PAGE */}
            <View style={{ width: bonusWidth }}>
              <View style={[styles.bonusTargetRow, { marginBottom: 22 }]}>
                <View style={styles.bonusTargetTop}>
                  <Text style={styles.bonusTargetTitle}>Orders {dailyOrdersCompleted} / {dailyOrdersTarget}</Text>
                  <Text style={styles.bonusTargetReward}>Earn ₹{dailyReward}</Text>
                </View>
                <View style={styles.bonusTargetBarBg}>
                  <View style={[styles.bonusTargetBarFill, { width: `${dailyPercent}%` }]} />
                </View>
                <Text style={styles.bonusTargetMeta}>{dailyOrdersRemaining} more orders</Text>
              </View>

              <View style={styles.bonusTargetRow}>
                <View style={styles.bonusTargetTop}>
                  <Text style={styles.bonusTargetTitle}>Daily incentive status</Text>
                  <Text style={styles.bonusTargetReward}>{statusLabel}</Text>
                </View>
                <View style={styles.bonusTargetBarBg}>
                  <View style={[styles.bonusTargetBarFill, { width: `${dailyPercent}%` }]} />
                </View>
                <Text style={styles.bonusTargetMeta}>Tracked automatically per shift</Text>
              </View>
            </View>

            {/* WEEKLY PAGE */}
            <View style={{ width: bonusWidth }}>
              <View style={[styles.bonusTargetRow, { marginBottom: 22 }]}>
                <View style={styles.bonusTargetTop}>
                  <Text style={styles.bonusTargetTitle}>Orders {weeklyOrdersCompleted} / {weeklyOrdersTarget}</Text>
                  <Text style={styles.bonusTargetReward}>Earn ₹{weeklyReward}</Text>
                </View>
                <View style={styles.bonusTargetBarBg}>
                  <View style={[styles.bonusTargetBarFill, { width: `${weeklyPercent}%` }]} />
                </View>
                <Text style={styles.bonusTargetMeta}>{weeklyOrdersRemaining} more orders</Text>
              </View>

              <View style={styles.bonusTargetRow}>
                <View style={styles.bonusTargetTop}>
                  <Text style={styles.bonusTargetTitle}>Weekly target status</Text>
                  <Text style={styles.bonusTargetReward}>{statusLabel}</Text>
                </View>
                <View style={styles.bonusTargetBarBg}>
                  <View style={[styles.bonusTargetBarFill, { width: `${weeklyPercent}%` }]} />
                </View>
                <Text style={styles.bonusTargetMeta}>Working days: {weekly?.workingDays || 0} / {weekly?.targetWorkingDays || 6} days</Text>
              </View>
            </View>
          </ScrollView>
        )}
      </View>

      <View style={styles.bonusFooter}>
        <View style={styles.inProgressPill}>
          <Text style={styles.inProgressText}>{statusLabel}</Text>
        </View>

        <View style={styles.pagerIndicatorContainer}>
          <View style={[styles.pagerDot, bonusTab === 'daily' && styles.pagerDotActive]} />
          <View style={[styles.pagerDot, bonusTab === 'weekly' && styles.pagerDotActive]} />
        </View>

        <TouchableOpacity
          style={styles.viewDetailsBtn}
          onPress={handleViewDetails}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="View incentive details"
        >
          <Text style={styles.viewDetailsText}>View details →</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
