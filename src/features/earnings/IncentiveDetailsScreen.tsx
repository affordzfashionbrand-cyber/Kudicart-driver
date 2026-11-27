import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { ScreenContainer } from '../../components/ScreenContainer';
import { KudiIcon } from '../../components/KudiIcon';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { BonusProgressResponse, earningsApi } from '../../api';
import { getFriendlyErrorMessage } from '../../utils/errorHandling';

function formatShortDate(iso?: string): string {
  if (!iso) return 'Active now';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return 'Active now';
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function formatStatusLabel(status?: string): string {
  const s = String(status || '').toUpperCase();
  if (s === 'COMPLETED' || s === 'ELIGIBLE') return 'Completed';
  return 'In progress';
}

export const IncentiveDetailsScreen = ({ navigation, route }: any) => {
  const { mode = 'daily', opportunity: initialOpportunity } = route?.params || {};
  const [selectedTab, setSelectedTab] = useState<'daily' | 'weekly' | 'opportunity'>(
    mode === 'weekly' ? 'weekly' : mode === 'opportunity' ? 'opportunity' : 'daily',
  );
  const [bonusData, setBonusData] = useState<BonusProgressResponse | null>(null);
  const [opportunities, setOpportunities] = useState<any[]>(
    initialOpportunity ? [initialOpportunity] : [],
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [bonusRes, oppRes] = await Promise.all([
        earningsApi.getBonusProgress(),
        earningsApi.getOpportunities().catch(() => null),
      ]);
      setBonusData(bonusRes);
      if (Array.isArray(oppRes)) {
        setOpportunities(oppRes);
      }
    } catch (err: any) {
      setError(getFriendlyErrorMessage(err, 'Unable to load incentive details.'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const handleBack = () => {
    if (navigation?.canGoBack?.()) {
      navigation.goBack();
    } else {
      navigation?.navigate?.('MainApp');
    }
  };

  const activeTier =
    selectedTab === 'weekly' ? bonusData?.weeklyBonus : bonusData?.dailyBonus;
  const activeOpportunity = initialOpportunity || opportunities[0] || null;

  const progressPercent = activeTier
    ? Math.min(100, Math.round((activeTier.completedOrders / (activeTier.targetOrders || 1)) * 100))
    : 0;

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <KudiIcon name="arrow-left" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Incentive Details</Text>
      </View>

      <View style={styles.tabsRow}>
        {(['daily', 'weekly', 'opportunity'] as const).map((tab) => {
          const active = selectedTab === tab;
          const label =
            tab === 'daily' ? 'Daily Bonus' : tab === 'weekly' ? 'Weekly Bonus' : 'Zone Offers';
          return (
            <TouchableOpacity
              key={tab}
              style={[styles.tabPill, active && styles.tabPillActive]}
              onPress={() => setSelectedTab(tab)}
              activeOpacity={0.75}
            >
              <Text style={[styles.tabText, active && styles.tabTextActive]}>{label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {isLoading ? (
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading incentive program details...</Text>
        </View>
      ) : error ? (
        <View style={styles.centerBox}>
          <KudiIcon name="error-circle" size={36} color="#DC2626" />
          <Text style={styles.errorTitle}>Could not load incentives</Text>
          <Text style={styles.errorSubtitle}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => void loadData()}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : selectedTab === 'opportunity' ? (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={<RefreshControl refreshing={isLoading} onRefresh={loadData} />}
        >
          {opportunities.length === 0 && !activeOpportunity ? (
            <View style={styles.emptyCard}>
              <KudiIcon name="zap" size={28} color="#9CA3AF" />
              <Text style={styles.emptyTitle}>No active zone offers right now</Text>
              <Text style={styles.emptySubtitle}>
                Special surge incentives in your area will appear here automatically.
              </Text>
            </View>
          ) : (
            (opportunities.length > 0 ? opportunities : [activeOpportunity]).map((opp, idx) => (
              <View key={opp.id || idx} style={styles.card}>
                <View style={styles.cardHeaderRow}>
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{opp.urgency || 'HIGH DEMAND'}</Text>
                  </View>
                  <Text style={styles.statusCompleted}>Active</Text>
                </View>

                <Text style={styles.cardTitle}>{opp.title}</Text>
                <Text style={styles.cardRewardHighlight}>
                  {opp.bonusAmount != null ? `+₹${opp.bonusAmount} per delivery` : opp.bonusText}
                </Text>
                <Text style={styles.cardDescription}>
                  {opp.description || opp.bonusText}
                </Text>

                <View style={styles.metaGrid}>
                  <View style={styles.metaRow}>
                    <Text style={styles.metaLabel}>Applicable Zone</Text>
                    <Text style={styles.metaValue}>{opp.zone || 'Assigned Darkstore Zone'}</Text>
                  </View>
                  <View style={styles.metaRow}>
                    <Text style={styles.metaLabel}>Time Window</Text>
                    <Text style={styles.metaValue}>{opp.timeWindow || 'Active Shift'}</Text>
                  </View>
                  <View style={[styles.metaRow, styles.metaRowLast]}>
                    <Text style={styles.metaLabel}>Eligibility</Text>
                    <Text style={styles.metaValue}>
                      {opp.eligibility || 'Approved partners delivering in this zone.'}
                    </Text>
                  </View>
                </View>
              </View>
            ))
          )}
        </ScrollView>
      ) : !activeTier ? (
        <View style={styles.centerBox}>
          <Text style={styles.emptyTitle}>No incentive data available</Text>
          <Text style={styles.emptySubtitle}>Check back after completing your first shift.</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={<RefreshControl refreshing={isLoading} onRefresh={loadData} />}
        >
          <View style={styles.card}>
            <View style={styles.cardHeaderRow}>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {selectedTab === 'weekly' ? 'WEEKLY INCENTIVE' : 'DAILY INCENTIVE'}
                </Text>
              </View>
              <Text
                style={
                  String(activeTier.status).toUpperCase() === 'COMPLETED'
                    ? styles.statusCompleted
                    : styles.statusProgress
                }
              >
                {formatStatusLabel(activeTier.status)}
              </Text>
            </View>

            <Text style={styles.cardTitle}>
              {activeTier.title ||
                (selectedTab === 'weekly' ? 'Weekly Consistency Bonus' : 'Daily Delivery Bonus')}
            </Text>
            <Text style={styles.cardDescription}>
              {activeTier.description ||
                bonusData?.description ||
                'Complete target deliveries to earn bonus payouts.'}
            </Text>

            <View style={styles.summaryStatsRow}>
              <View style={styles.summaryStatBox}>
                <Text style={styles.statLabel}>Earned So Far</Text>
                <Text style={styles.statValue}>₹{activeTier.rewardEarned}</Text>
              </View>
              <View style={styles.summaryStatBox}>
                <Text style={styles.statLabel}>Next Milestone</Text>
                <Text style={styles.statValue}>₹{activeTier.nextReward}</Text>
              </View>
              <View style={styles.summaryStatBox}>
                <Text style={styles.statLabel}>Remaining</Text>
                <Text style={styles.statValue}>{activeTier.ordersRemaining} orders</Text>
              </View>
            </View>

            <View style={styles.progressSection}>
              <View style={styles.progressTopRow}>
                <Text style={styles.progressLabel}>
                  Deliveries: {activeTier.completedOrders} / {activeTier.targetOrders}
                </Text>
                <Text style={styles.progressPct}>{progressPercent}%</Text>
              </View>
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
              </View>
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Milestone Slabs</Text>
            {(activeTier.milestones || []).map((m, idx) => (
              <View
                key={`${m.orders}-${idx}`}
                style={[
                  styles.milestoneRow,
                  idx === activeTier.milestones.length - 1 && styles.metaRowLast,
                ]}
              >
                <View style={styles.milestoneLeft}>
                  <View style={[styles.milestoneDot, m.reached && styles.milestoneDotReached]}>
                    {m.reached ? <KudiIcon name="check" size={12} color="#FFFFFF" /> : null}
                  </View>
                  <View>
                    <Text style={styles.milestoneOrders}>Complete {m.orders} deliveries</Text>
                    <Text style={styles.milestoneSub}>
                      {m.reached
                        ? 'Target achieved'
                        : `${Math.max(0, m.orders - activeTier.completedOrders)} more needed`}
                    </Text>
                  </View>
                </View>
                <Text style={[styles.milestoneBonus, m.reached && { color: '#15803D' }]}>
                  ₹{m.bonus}
                </Text>
              </View>
            ))}
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Program Schedule & Eligibility</Text>
            <View style={styles.metaGrid}>
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Period</Text>
                <Text style={styles.metaValue}>{activeTier.periodLabel || 'Current cycle'}</Text>
              </View>
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Start Date</Text>
                <Text style={styles.metaValue}>{formatShortDate(activeTier.startsAt)}</Text>
              </View>
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>End Date</Text>
                <Text style={styles.metaValue}>{formatShortDate(activeTier.endsAt)}</Text>
              </View>
              {selectedTab === 'weekly' && bonusData?.weeklyBonus ? (
                <View style={styles.metaRow}>
                  <Text style={styles.metaLabel}>Active Working Days</Text>
                  <Text style={styles.metaValue}>
                    {bonusData.weeklyBonus.workingDays} / {bonusData.weeklyBonus.targetWorkingDays} days
                  </Text>
                </View>
              ) : null}
              <View style={[styles.metaRow, styles.metaRowLast]}>
                <Text style={styles.metaLabel}>Eligibility</Text>
                <Text style={styles.metaValue}>
                  {activeTier.eligibility || 'Approved KudiCart delivery partners with active KYC.'}
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
      )}
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.m,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2DED7',
    gap: 10,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  tabsRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: spacing.m,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2DED7',
  },
  tabPill: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 20,
    alignItems: 'center',
    backgroundColor: '#F3F1EC',
  },
  tabPillActive: {
    backgroundColor: '#171716',
  },
  tabText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#65635F',
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  scrollContent: {
    padding: spacing.m,
    gap: 14,
    paddingBottom: 32,
  },
  centerBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 10,
  },
  loadingText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  errorTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
  },
  errorSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 8,
    paddingHorizontal: 22,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: colors.primary,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2DED7',
    gap: 10,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badge: {
    backgroundColor: '#FFF0E8',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
  },
  statusProgress: {
    fontSize: 12,
    fontWeight: '700',
    color: '#B45309',
  },
  statusCompleted: {
    fontSize: 12,
    fontWeight: '700',
    color: '#15803D',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#171716',
  },
  cardRewardHighlight: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.primary,
  },
  cardDescription: {
    fontSize: 13,
    lineHeight: 19,
    color: '#65635F',
  },
  summaryStatsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  summaryStatBox: {
    flex: 1,
    backgroundColor: '#F8F7F4',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E2DED7',
  },
  statLabel: {
    fontSize: 11,
    color: '#65635F',
    fontWeight: '600',
  },
  statValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#171716',
    marginTop: 2,
  },
  progressSection: {
    marginTop: 4,
    gap: 6,
  },
  progressTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#171716',
  },
  progressPct: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
  },
  progressTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ECE9E2',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#171716',
    marginBottom: 4,
  },
  milestoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F1EC',
  },
  milestoneLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  milestoneDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: '#D1CCC4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  milestoneDotReached: {
    backgroundColor: '#15803D',
    borderColor: '#15803D',
  },
  milestoneOrders: {
    fontSize: 14,
    fontWeight: '600',
    color: '#171716',
  },
  milestoneSub: {
    fontSize: 12,
    color: '#65635F',
  },
  milestoneBonus: {
    fontSize: 15,
    fontWeight: '700',
    color: '#171716',
  },
  metaGrid: {
    gap: 2,
  },
  metaRow: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F1EC',
    gap: 2,
  },
  metaRowLast: {
    borderBottomWidth: 0,
  },
  metaLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#65635F',
  },
  metaValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#171716',
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 28,
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#E2DED7',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#171716',
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#65635F',
    textAlign: 'center',
  },
});
