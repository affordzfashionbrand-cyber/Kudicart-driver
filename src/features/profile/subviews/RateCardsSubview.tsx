import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { colors } from '../../../theme/colors';
import { KudiIcon } from '../../../components/KudiIcon';
import { subviewStyles as styles } from './profileSubviews.styles';

const DAILY_INCENTIVE_TIERS = [
  { orders: 'Below 15 orders', bonus: '₹0' },
  { orders: '15 orders', bonus: '₹50' },
  { orders: '16 orders', bonus: '₹55' },
  { orders: '17 orders', bonus: '₹60' },
  { orders: '18 orders', bonus: '₹65' },
  { orders: '19 orders', bonus: '₹78' },
  { orders: '20 orders', bonus: '₹86' },
  { orders: '21 orders', bonus: '₹94' },
  { orders: '22 orders', bonus: '₹102' },
  { orders: '23 orders', bonus: '₹110' },
  { orders: '24 orders', bonus: '₹120' },
  { orders: '25 orders', bonus: '₹130' },
  { orders: '26 orders', bonus: '₹140' },
  { orders: '27 orders', bonus: '₹150' },
  { orders: '28 orders', bonus: '₹160' },
  { orders: '29 orders', bonus: '₹170' },
  { orders: '30 orders', bonus: '₹175' },
  { orders: '31+ orders', bonus: '₹175 + ₹5 / addl order' },
];

export const RateCardsSubview: React.FC = () => {
  const [rateCardTier, setRateCardTier] = useState<'fullTime' | 'partTime'>('fullTime');
  const [showAllDailyTiers, setShowAllDailyTiers] = useState(false);

  return (
    <>
      {/* Affordz Pilot Policy Header Card */}
      <View style={styles.policyHeaderCard}>
        <View style={styles.policyHeaderRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.policyTitle}>Affordz Delivery Partner Policy</Text>
            <Text style={styles.policySubtitle}>Pilot Version • Chennai Launch</Text>
          </View>
          <View style={styles.pilotBadge}>
            <Text style={styles.pilotBadgeText}>Pilot v1.0</Text>
          </View>
        </View>
      </View>

      {/* 1. Distance & Base Payout */}
      <View style={styles.card}>
        <Text style={styles.cardSectionTitle}>Delivery Distance & Base Payout</Text>

        <View style={styles.row}>
          <View>
            <Text style={styles.rowLabelBold}>0 – 1 km</Text>
            <Text style={styles.smallSubtext}>Short-distance order</Text>
          </View>
          <Text style={styles.highlightValue}>₹20 / order</Text>
        </View>

        <View style={styles.row}>
          <View>
            <Text style={styles.rowLabelBold}>Above 1 km – 2 km</Text>
            <Text style={styles.smallSubtext}>Mid-range delivery</Text>
          </View>
          <Text style={styles.highlightValue}>₹25 / order</Text>
        </View>

        <View style={styles.row}>
          <View>
            <Text style={styles.rowLabelBold}>Above 2 km – 3 km</Text>
            <Text style={styles.smallSubtext}>Outer radius delivery</Text>
          </View>
          <Text style={styles.highlightValue}>₹30 / order</Text>
        </View>

        <View style={styles.radiusNoteBox}>
          <KudiIcon name="info-circle" size={15} color="#65635F" />
          <Text style={styles.radiusNoteText}>
            Maximum standard delivery radius during the pilot is 3 km. Distances are calculated via GPS verification.
          </Text>
        </View>
      </View>

      {/* 2. Partner Category & Weekly Bonus */}
      <View style={styles.card}>
        <View style={styles.cardHeaderWithTabs}>
          <Text style={styles.cardSectionTitle}>Working Category & Weekly Bonus</Text>
        </View>

        <View style={styles.categoryToggleContainer}>
          <TouchableOpacity
            style={[
              styles.categoryTab,
              rateCardTier === 'fullTime' && styles.categoryTabActive,
            ]}
            onPress={() => setRateCardTier('fullTime')}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="View Full-Time category"
          >
            <Text
              style={[
                styles.categoryTabText,
                rateCardTier === 'fullTime' && styles.categoryTabTextActive,
              ]}
            >
              Full-Time (8 hrs)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.categoryTab,
              rateCardTier === 'partTime' && styles.categoryTabActive,
            ]}
            onPress={() => setRateCardTier('partTime')}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="View Part-Time category"
          >
            <Text
              style={[
                styles.categoryTabText,
                rateCardTier === 'partTime' && styles.categoryTabTextActive,
              ]}
            >
              Part-Time (5 hrs)
            </Text>
          </TouchableOpacity>
        </View>

        {rateCardTier === 'fullTime' ? (
          <>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Working Schedule</Text>
              <Text style={styles.rowValue}>8 hrs/day • 6 days/week</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Weekly Rest Day</Text>
              <Text style={styles.rowValue}>1 scheduled day off</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Weekly Order Target</Text>
              <Text style={styles.rowValue}>119 completed orders (~20/day)</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Attendance & Bonus</Text>
              <Text style={[styles.highlightValue, { color: '#16805A' }]}>₹1,100 / week</Text>
            </View>
            <View style={styles.illustrativeBox}>
              <View style={styles.illustrativeHeader}>
                <Text style={styles.illustrativeTitle}>Illustrative Weekly Total</Text>
                <Text style={styles.illustrativeAmount}>~₹4,523 / week</Text>
              </View>
              <Text style={styles.illustrativeBreakdown}>
                Base payout (~₹2,915) + Daily incentives (~₹508) + Attendance bonus (₹1,100). Customer tips & surge extra.
              </Text>
            </View>
          </>
        ) : (
          <>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Working Schedule</Text>
              <Text style={styles.rowValue}>5 hrs/day • 6 days/week</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Weekly Rest Day</Text>
              <Text style={styles.rowValue}>1 scheduled day off</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Weekly Order Target</Text>
              <Text style={styles.rowValue}>75 completed orders (~12.5/day)</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Attendance & Bonus</Text>
              <Text style={[styles.highlightValue, { color: '#16805A' }]}>₹500 / week</Text>
            </View>
            <View style={styles.illustrativeBox}>
              <View style={styles.illustrativeHeader}>
                <Text style={styles.illustrativeTitle}>Illustrative Weekly Total</Text>
                <Text style={styles.illustrativeAmount}>~₹2,337.50 / week</Text>
              </View>
              <Text style={styles.illustrativeBreakdown}>
                Base payout (~₹1,837.50) + Attendance bonus (₹500). Customer tips & surge extra.
              </Text>
            </View>
          </>
        )}
      </View>

      {/* 3. Daily Performance Incentive */}
      <View style={styles.card}>
        <Text style={styles.cardSectionTitle}>Daily Performance Incentive</Text>
        <Text style={styles.bodyText}>
          Total daily bonus earned for that day's eligible completed order count:
        </Text>

        <View style={styles.tierGrid}>
          <View style={styles.tierPill}>
            <Text style={styles.tierPillOrders}>Below 15</Text>
            <Text style={styles.tierPillBonus}>₹0</Text>
          </View>
          <View style={styles.tierPill}>
            <Text style={styles.tierPillOrders}>15 orders</Text>
            <Text style={styles.tierPillBonusHighlight}>₹50</Text>
          </View>
          <View style={styles.tierPill}>
            <Text style={styles.tierPillOrders}>20 orders</Text>
            <Text style={styles.tierPillBonusHighlight}>₹86</Text>
          </View>
          <View style={styles.tierPill}>
            <Text style={styles.tierPillOrders}>25 orders</Text>
            <Text style={styles.tierPillBonusHighlight}>₹130</Text>
          </View>
          <View style={styles.tierPill}>
            <Text style={styles.tierPillOrders}>30 orders</Text>
            <Text style={styles.tierPillBonusHighlight}>₹175</Text>
          </View>
          <View style={styles.tierPill}>
            <Text style={styles.tierPillOrders}>31+ orders</Text>
            <Text style={styles.tierPillBonusHighlight}>+₹5 / order</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.expandTiersButton}
          onPress={() => setShowAllDailyTiers(!showAllDailyTiers)}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Toggle daily performance tier list"
        >
          <Text style={styles.expandTiersText}>
            {showAllDailyTiers ? 'Hide Detailed Tier List' : 'View Complete Tier List (15–31+)'}
          </Text>
          <KudiIcon
            name={showAllDailyTiers ? 'chevron-up' : 'chevron-down'}
            size={15}
            color={colors.primary}
          />
        </TouchableOpacity>

        {showAllDailyTiers && (
          <View style={styles.fullTierTable}>
            {DAILY_INCENTIVE_TIERS.map((tier, idx) => (
              <View
                key={idx}
                style={[
                  styles.tierRow,
                  idx === DAILY_INCENTIVE_TIERS.length - 1 && styles.rowLast,
                ]}
              >
                <Text style={styles.tierRowLabel}>{tier.orders}</Text>
                <Text style={styles.tierRowValue}>{tier.bonus}</Text>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* 4. Peak-Hour Incentive & Customer Tips */}
      <View style={styles.card}>
        <Text style={styles.cardSectionTitle}>Peak Incentive & Customer Tips</Text>

        <View style={styles.row}>
          <View style={{ flex: 1, paddingRight: 8 }}>
            <Text style={styles.rowLabelBold}>Peak-Hour Incentive</Text>
            <Text style={styles.smallSubtext}>When officially activated during high demand</Text>
          </View>
          <Text style={styles.highlightValue}>+₹5 / order</Text>
        </View>

        <View style={[styles.row, styles.rowLast]}>
          <View style={{ flex: 1, paddingRight: 8 }}>
            <Text style={styles.rowLabelBold}>Customer Tips</Text>
            <Text style={styles.smallSubtext}>100% to partner — Affordz retains 0%</Text>
          </View>
          <Text style={[styles.highlightValue, { color: '#16805A' }]}>100% Partner</Text>
        </View>
      </View>

      {/* 5. Customer Delivery Fee Reference */}
      <View style={styles.card}>
        <Text style={styles.cardSectionTitle}>Customer Delivery Fee Structure</Text>
        <Text style={styles.bodyText}>
          Paid by customer according to order value (separate from your partner payout):
        </Text>

        <View style={styles.row}>
          <Text style={styles.rowLabel}>Below ₹400</Text>
          <Text style={styles.rowValue}>₹49 delivery fee</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.rowLabel}>₹400 – ₹699</Text>
          <Text style={styles.rowValue}>₹49 delivery fee</Text>
        </View>

        <View style={[styles.row, styles.rowLast]}>
          <Text style={styles.rowLabel}>₹700 and above</Text>
          <Text style={[styles.highlightValue, { color: '#16805A' }]}>FREE delivery</Text>
        </View>
      </View>

      {/* 6. Settlement & Operational Guidelines */}
      <View style={styles.card}>
        <Text style={styles.cardSectionTitle}>Settlement & Operational Rules</Text>

        <View style={styles.guidelineRow}>
          <KudiIcon name="calendar" size={16} color={colors.primary} />
          <View style={{ flex: 1 }}>
            <Text style={styles.guidelineTitle}>Weekly Payout Schedule</Text>
            <Text style={styles.guidelineDesc}>
              Earnings are processed weekly following automated verification of completed orders, distance, and attendance.
            </Text>
          </View>
        </View>

        <View style={styles.guidelineRow}>
          <KudiIcon name="check-circle" size={16} color="#16805A" />
          <View style={{ flex: 1 }}>
            <Text style={styles.guidelineTitle}>Scheduled Rest Day</Text>
            <Text style={styles.guidelineDesc}>
              1 scheduled weekly day off is not treated as an absence and does not reduce attendance bonus eligibility.
            </Text>
          </View>
        </View>

        <View style={[styles.guidelineRow, styles.rowLast]}>
          <KudiIcon name="shield" size={16} color="#0284C7" />
          <View style={{ flex: 1 }}>
            <Text style={styles.guidelineTitle}>Safety First Priority</Text>
            <Text style={styles.guidelineDesc}>
              Safety takes absolute priority over delivery targets. Partners must never compromise road safety.
            </Text>
          </View>
        </View>
      </View>
    </>
  );
};
