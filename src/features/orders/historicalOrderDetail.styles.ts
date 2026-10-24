import { StyleSheet } from 'react-native';
import { spacing } from '../../theme/spacing';
import { colors } from '../../theme/colors';

export const styles = StyleSheet.create({
  container: {
    padding: spacing.m,
    paddingBottom: spacing.xxl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2DED7',
  },
  backButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
  },
  headerIdBadge: {
    backgroundColor: '#F3F1EC',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  headerIdText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text,
  },

  /* 1. Status & Timestamp Banner */
  statusBannerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: spacing.m,
    borderWidth: 1,
    borderColor: '#E2DED7',
    marginBottom: spacing.m,
  },
  statusBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statusIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E8F4ED',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  statusTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  deliveredPill: {
    backgroundColor: '#E8F4ED',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#C1F2D9',
  },
  deliveredPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#16805A',
  },
  statusSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },

  /* Generic Card Styles */
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: spacing.m,
    borderWidth: 1,
    borderColor: '#E2DED7',
    marginBottom: spacing.m,
  },
  cardSectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.s,
    paddingBottom: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F1EC',
  },

  /* 2. Route Trajectory */
  routeContainer: {
    paddingVertical: 4,
  },
  routePointRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  routeIconStore: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E8F4ED',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  routeIconDest: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFF0E8',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  routeContent: {
    flex: 1,
  },
  routeLabelStore: {
    fontSize: 11,
    fontWeight: '700',
    color: '#16805A',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  routeLabelDest: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  routeStoreName: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 2,
  },
  routeStoreAddress: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 16,
  },
  routeCustomerName: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 2,
  },
  routeCustomerAddress: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 16,
  },
  routeConnectorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingLeft: 15,
    gap: 12,
  },
  routeConnectorLine: {
    width: 2,
    height: 28,
    backgroundColor: '#E2DED7',
  },
  distanceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FAF9F6',
    borderWidth: 1,
    borderColor: '#E2DED7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  distanceBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.text,
  },

  /* 3. Earnings & Payout Breakdown */
  earningsHeroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFF0E8',
    borderRadius: 12,
    padding: spacing.m,
    borderWidth: 1,
    borderColor: '#FFD6C5',
    marginBottom: spacing.m,
  },
  earningsHeroLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
  },
  earningsHeroDistance: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  earningsHeroValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#16805A',
  },
  payoutBreakdownBox: {
    backgroundColor: '#FAF9F6',
    borderRadius: 10,
    padding: spacing.m,
    borderWidth: 1,
    borderColor: '#EFECE6',
    marginBottom: spacing.s,
  },
  breakdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  breakdownRowTotal: {
    borderTopWidth: 1,
    borderTopColor: '#E2DED7',
    marginTop: 6,
    paddingTop: 10,
  },
  breakdownLabel: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  breakdownValue: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
  },
  breakdownTotalLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  breakdownTotalValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#16805A',
  },
  settlementNoticeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#E8F4ED',
    padding: 10,
    borderRadius: 8,
    marginTop: 4,
  },
  settlementNoticeText: {
    flex: 1,
    fontSize: 11,
    color: '#16805A',
    fontWeight: '600',
  },

  /* 4. Package Info Rows */
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F7F6F2',
  },
  infoRowLast: {
    borderBottomWidth: 0,
    paddingBottom: 2,
  },
  infoLabel: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
  },

  /* Actions */
  primaryActionButton: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xs,
    marginBottom: spacing.m,
  },
  primaryActionButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  secondaryHelpBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
  },
  secondaryHelpText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
});
