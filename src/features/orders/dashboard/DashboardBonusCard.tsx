import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { dashboardStyles as styles } from './dashboard.styles';

export const DashboardBonusCard: React.FC = () => {
  const [bonusTab, setBonusTab] = useState<'daily' | 'weekly'>('daily');
  const [bonusWidth, setBonusWidth] = useState(0);

  return (
    <View style={styles.card}>
      <View style={styles.bonusHeader}>
        <Text style={styles.bonusHeadline}>
          {bonusTab === 'daily' ? 'Daily bonus' : 'Weekly bonus'}
        </Text>
        <Text style={styles.bonusAmount}>{bonusTab === 'daily' ? '₹10 earned' : '₹250 earned'}</Text>
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
                  <Text style={styles.bonusTargetTitle}>Orders 8 / 10</Text>
                  <Text style={styles.bonusTargetReward}>Earn ₹20</Text>
                </View>
                <View style={styles.bonusTargetBarBg}>
                  <View style={[styles.bonusTargetBarFill, { width: '80%' }]} />
                </View>
                <Text style={styles.bonusTargetMeta}>2 more orders</Text>
              </View>

              <View style={styles.bonusTargetRow}>
                <View style={styles.bonusTargetTop}>
                  <Text style={styles.bonusTargetTitle}>Online time 6h 42m / 8h</Text>
                  <Text style={styles.bonusTargetReward}>Earn ₹25</Text>
                </View>
                <View style={styles.bonusTargetBarBg}>
                  <View style={[styles.bonusTargetBarFill, { width: '84%' }]} />
                </View>
                <Text style={styles.bonusTargetMeta}>1h 18m left</Text>
              </View>
            </View>

            {/* WEEKLY PAGE */}
            <View style={{ width: bonusWidth }}>
              <View style={[styles.bonusTargetRow, { marginBottom: 22 }]}>
                <View style={styles.bonusTargetTop}>
                  <Text style={styles.bonusTargetTitle}>Orders 42 / 50</Text>
                  <Text style={styles.bonusTargetReward}>Earn ₹100</Text>
                </View>
                <View style={styles.bonusTargetBarBg}>
                  <View style={[styles.bonusTargetBarFill, { width: '84%' }]} />
                </View>
                <Text style={styles.bonusTargetMeta}>8 more orders</Text>
              </View>

              <View style={styles.bonusTargetRow}>
                <View style={styles.bonusTargetTop}>
                  <Text style={styles.bonusTargetTitle}>Online time 32h / 40h</Text>
                  <Text style={styles.bonusTargetReward}>Earn ₹150</Text>
                </View>
                <View style={styles.bonusTargetBarBg}>
                  <View style={[styles.bonusTargetBarFill, { width: '80%' }]} />
                </View>
                <Text style={styles.bonusTargetMeta}>8h left</Text>
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
