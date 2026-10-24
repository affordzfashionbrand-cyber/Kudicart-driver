import { StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';

export const styles = StyleSheet.create({
  main: {
    flex: 1,
    backgroundColor: '#F3F1EC', // Warm neutral page background
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E2DED7',
    backgroundColor: colors.white,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'flex-start',
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#171716',
    flex: 1,
    textAlign: 'left',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 8,
  },

  // Week Selector
  weekSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 8,
    backgroundColor: colors.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2DED7',
    marginBottom: 16,
  },
  weekArrow: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  weekLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#171716',
  },

  // Weekly Hero Card
  heroCard: {
    backgroundColor: '#FFF0E8', // Soft orange-tinted surface
    borderWidth: 1,
    borderColor: '#FFD6C4', // Harmonious subtle orange border
    borderRadius: 16,
    padding: 20,
    marginBottom: 18,
  },
  heroSub: {
    fontSize: 13,
    fontWeight: '600',
    color: '#9E4A24', // Warm secondary text
    marginBottom: 6,
  },
  heroAmount: {
    fontSize: 28,
    fontWeight: '700',
    color: '#171716',
    letterSpacing: -0.5,
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#F5DCD0', // Soft divider
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: '#F5DCD0',
  },
  statValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#171716',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '400',
    color: '#8A583C', // Warm secondary
  },

  // Daily Breakdown
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#171716',
    marginBottom: 12,
  },
  dayCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: '#E2DED7',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    minHeight: 64,
    marginBottom: 10,
  },
  lastCard: {
    marginBottom: 0,
  },
  dayInfo: {
    flex: 1,
  },
  dayName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#171716',
    marginBottom: 2,
  },
  dayDate: {
    fontSize: 12,
    fontWeight: '400',
    color: colors.textSecondary,
  },
  dayAmount: {
    fontSize: 15,
    fontWeight: '600',
    color: '#171716',
    textAlign: 'right',
    marginRight: 10,
  },

  // Daily Detail Order Transactions
  transactionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: '#E2DED7',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
  },
  transactionIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F1EC',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#171716',
    marginBottom: 2,
  },
  transactionTime: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  transactionAmount: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.success,
  },

  emptyState: {
    padding: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2DED7',
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: 13,
  },
});
