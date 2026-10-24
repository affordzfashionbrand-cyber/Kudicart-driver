import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { dashboardStyles as styles } from './dashboard.styles';
import { earningsApi, BonusProgressResponse } from '../../../api';

export const DashboardBonusCard: React.FC = () => {
  const [bonusTab, setBonusTab] = useState<'daily' | 'weekly'>('daily');
  const [bonusWidth, setBonusWidth] = useState(0);
  const [bonusData, setBonusData] = useState<BonusProgressResponse | null>(null);

  useEffect(() => {
    earningsApi
      .getBonusProgress()
      .then((data) => setBonusData(data))
      .catch(() => {});
  }, []);

  const daily = bonusData?.dailyBonus;
  const weekly = bonusData?.weeklyBonus;

  const dailyOrdersCompleted = daily?.completedOrders ?? 0;
  const dailyOrdersTarget = daily?.targetOrders ?? 10;
  const dailyOrdersRemaining = daily?.ordersRemaining ?? 2;
  const dailyReward = daily?.nextReward ?? 20;
  const dailyPercent = Math.min(100, Math.round((dailyOrdersCompleted / (dailyOrdersTarget || 1)) * 100));

  const weeklyOrdersCompleted = weekly?.completedOrders ?? 0;
  const weeklyOrdersTarget = weekly?.targetOrders ?? 50;
  const weeklyOrdersRemaining = weekly?.ordersRemaining ?? 11;
  const weeklyReward = weekly?.nextReward ?? 100;
  const weeklyPercent = Math.min(100, Math.round((weeklyOrdersCompleted / (weeklyOrdersTarget || 1)) * 100));

  const earnedText = bonusTab === 'daily'
    ? `₹${daily?.rewardEarned || 0} earned`
    : `₹${weekly?.rewardEarned || 0} earned`;

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
                  <Text style={styles.bonusTargetReward}>{daily?.status || 'IN_PROGRESS'}</Text>
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
                  <Text style={styles.bonusTargetReward}>{weekly?.status || 'IN_PROGRESS'}</Text>
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
          <Text style={styles.inProgressText}>In progress</Text>
        </View>

        <View style={styles.pagerIndicatorContainer}>
          <View style={[styles.pagerDot, bonusTab === 'daily' && styles.pagerDotActive]} />
          <View style={[styles.pagerDot, bonusTab === 'weekly' && styles.pagerDotActive]} />
        </View>

        <TouchableOpacity style={styles.viewDetailsBtn}>
          <Text style={styles.viewDetailsText}>View details →</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
