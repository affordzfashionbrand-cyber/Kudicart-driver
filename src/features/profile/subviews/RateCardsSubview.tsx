import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { colors } from '../../../theme/colors';
import { KudiIcon } from '../../../components/KudiIcon';
import { earningsApi, RateCardResponse } from '../../../api/earningsApi';
import { getFriendlyErrorMessage } from '../../../utils/errorHandling';
import { subviewStyles as styles } from './profileSubviews.styles';

export const RateCardsSubview: React.FC = () => {
  const [rateCard, setRateCard] = useState<RateCardResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAllDailyTiers, setShowAllDailyTiers] = useState(false);

  const loadRateCard = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await earningsApi.getRateCard();
      setRateCard(data);
    } catch (err: any) {
      setError(getFriendlyErrorMessage(err, 'Unable to load rate card details.'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadRateCard();
  }, [loadRateCard]);

  if (isLoading && !rateCard) {
    return (
      <View style={[styles.card, { alignItems: 'center', paddingVertical: 32, gap: 10 }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.smallSubtext}>Loading rate card & incentive structure...</Text>
      </View>
    );
  }

  if (error && !rateCard) {
    return (
      <View style={[styles.card, { alignItems: 'center', paddingVertical: 28, gap: 10 }]}>
        <KudiIcon name="error-circle" size={30} color="#DC2626" />
        <Text style={styles.rowLabelBold}>Could not load rate card</Text>
        <Text style={styles.smallSubtext}>{error}</Text>
        <TouchableOpacity
          style={[styles.primaryActionButton, { paddingHorizontal: 20 }]}
          onPress={() => void loadRateCard()}
        >
          <Text style={styles.primaryActionButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const basePayout = rateCard?.basePayoutPerOrder ?? 0;
  const dailyMilestones = rateCard?.dailyMilestones || [];
  const weeklyMilestones = rateCard?.weeklyMilestones || [];
  const activeSurges = rateCard?.activeSurges || [];

  return (
    <>
      <View style={styles.policyHeaderCard}>
        <View style={styles.policyHeaderRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.policyTitle}>KudiCart Delivery Partner Rate Card</Text>
            <Text style={styles.policySubtitle}>
              Base Payout ₹{basePayout}/order • Floating Cash Limit ₹
              {(rateCard?.floatingCashLimit ?? 0).toLocaleString('en-IN')}
            </Text>
          </View>
          <View style={styles.pilotBadge}>
            <Text style={styles.pilotBadgeText}>Active</Text>
          </View>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardSectionTitle}>Delivery Order Payouts</Text>
        {(rateCard?.payoutRules || []).map((rule, idx, arr) => (
          <View key={rule.id} style={[styles.row, idx === arr.length - 1 && styles.rowLast]}>
            <View style={{ flex: 1, paddingRight: 8 }}>
              <Text style={styles.rowLabelBold}>{rule.title}</Text>
              <Text style={styles.smallSubtext}>{rule.description}</Text>
            </View>
            <Text style={styles.highlightValue}>{rule.amountLabel}</Text>
          </View>
        ))}
      </View>

      {dailyMilestones.length > 0 ? (
        <View style={styles.card}>
          <Text style={styles.cardSectionTitle}>Daily Performance Incentive</Text>
          <Text style={styles.bodyText}>
            Earned once you reach the daily completed delivery milestone:
          </Text>

          <View style={styles.tierGrid}>
            {dailyMilestones.map((tier) => (
              <View key={tier.orders} style={styles.tierPill}>
                <Text style={styles.tierPillOrders}>{tier.orders} orders</Text>
                <Text style={styles.tierPillBonusHighlight}>₹{tier.bonus}</Text>
              </View>
            ))}
          </View>

          <TouchableOpacity
            style={styles.expandTiersButton}
            onPress={() => setShowAllDailyTiers(!showAllDailyTiers)}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Toggle daily performance tier list"
          >
            <Text style={styles.expandTiersText}>
              {showAllDailyTiers ? 'Hide Detailed Breakdown' : 'View Weekly Milestone Tiers'}
            </Text>
            <KudiIcon
              name={showAllDailyTiers ? 'chevron-up' : 'chevron-down'}
              size={15}
              color={colors.primary}
            />
          </TouchableOpacity>

          {showAllDailyTiers && weeklyMilestones.length > 0 ? (
            <View style={styles.fullTierTable}>
              {weeklyMilestones.map((tier, idx) => (
                <View
                  key={tier.orders}
                  style={[
                    styles.tierRow,
                    idx === weeklyMilestones.length - 1 && styles.rowLast,
                  ]}
                >
                  <Text style={styles.tierRowLabel}>{tier.orders} weekly orders</Text>
                  <Text style={styles.tierRowValue}>₹{tier.bonus}</Text>
                </View>
              ))}
            </View>
          ) : null}
        </View>
      ) : null}

      {activeSurges.length > 0 ? (
        <View style={styles.card}>
          <Text style={styles.cardSectionTitle}>Active Zone Surges</Text>
          {activeSurges.map((s, idx) => (
            <View
              key={s.id}
              style={[styles.row, idx === activeSurges.length - 1 && styles.rowLast]}
            >
              <View style={{ flex: 1, paddingRight: 8 }}>
                <Text style={styles.rowLabelBold}>{s.title}</Text>
                <Text style={styles.smallSubtext}>
                  {s.area} · {s.timeWindow}
                </Text>
              </View>
              <Text style={[styles.highlightValue, { color: '#16805A' }]}>
                +₹{s.bonusAmount}/order
              </Text>
            </View>
          ))}
        </View>
      ) : null}
    </>
  );
};
