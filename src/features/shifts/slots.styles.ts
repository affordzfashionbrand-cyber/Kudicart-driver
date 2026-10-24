import { StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';

export const styles = StyleSheet.create({
  main: {
    flex: 1,
    backgroundColor: '#F3F1EC', // Warm neutral canvas background
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

  // Top Section: Week Selector + Date Strip + Filters
  topControlSection: {
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: '#E2DED7',
    paddingTop: 10,
  },

  // Week Selector Tabs
  weekTabContainer: {
    flexDirection: 'row',
    backgroundColor: '#F3F1EC',
    borderRadius: 10,
    padding: 3,
    marginHorizontal: 16,
    marginBottom: 8,
  },
  weekTab: {
    flex: 1,
    paddingVertical: 7,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockedTab: {
    flexDirection: 'row',
    gap: 5,
  },
  weekTabActive: {
    backgroundColor: colors.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  weekTabText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#65635F',
  },
  weekTabTextActive: {
    color: '#171716',
    fontWeight: '700',
  },

  // Horizontal Date Strip (Sunday to Saturday)
  dateStripWrapper: {
    paddingTop: 4,
    paddingBottom: 2,
  },
  dateStripScroll: {
    paddingHorizontal: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minWidth: '100%',
  },
  dateItem: {
    alignItems: 'center',
    paddingHorizontal: 10,
    minWidth: 42,
  },
  dateDayText: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 4,
  },
  dateDayTextSelected: {
    color: '#FF5A1F', // Signal orange for active day
    fontWeight: '600',
  },
  dateDayTextUnselected: {
    color: '#65635F',
  },
  dateNumText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#171716',
    marginBottom: 8,
  },
  activeBar: {
    width: 24,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: 'transparent',
  },
  activeBarVisible: {
    backgroundColor: '#FF5A1F', // Signal orange underline
  },

  // Filter Row below dates
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 10,
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3F1EC',
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#F3F1EC',
    borderWidth: 1,
    borderColor: '#E2DED7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterChipActive: {
    backgroundColor: '#171716',
    borderColor: '#171716',
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#65635F',
  },
  filterChipTextActive: {
    color: colors.white,
    fontWeight: '600',
  },

  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },

  // Locked Notice Banner
  lockedNoticeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9F8F5',
    borderWidth: 1,
    borderColor: '#E2DED7',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  lockedIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EAE7E0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  lockedTextCol: {
    flex: 1,
  },
  lockedNoticeTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#171716',
    marginBottom: 1,
  },
  lockedNoticeSub: {
    fontSize: 12,
    color: '#65635F',
  },

  // Section Headers
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#171716',
  },
  sectionDateSub: {
    fontSize: 13,
    fontWeight: '400',
    color: '#65635F',
  },

  // Simplified Slot Cards
  slotCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: '#E2DED7',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    minHeight: 68,
    marginBottom: 10,
  },
  slotInfo: {
    flex: 1,
    paddingRight: 12,
  },
  slotTime: {
    fontSize: 15,
    fontWeight: '700',
    color: '#171716',
    marginBottom: 4,
  },
  demandRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  slotDemand: {
    fontSize: 13,
  },
  slotDemandHigh: {
    color: '#D94B17', // Warm brand secondary
    fontWeight: '500',
  },
  slotDemandNormal: {
    color: '#65635F',
    fontWeight: '400',
  },
  slotDemandLocked: {
    color: '#8A8781',
  },
  slotBonus: {
    fontSize: 13,
    fontWeight: '600',
    color: '#D94B17',
  },

  // Right-hand Actions
  bookButton: {
    backgroundColor: '#FF5A1F',
    paddingHorizontal: 22,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bookButtonText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: 13,
  },
  bookedBadge: {
    backgroundColor: '#EDFDF5',
    borderWidth: 1,
    borderColor: '#C1F2D9',
    paddingHorizontal: 16,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bookedBadgeText: {
    color: '#16805A',
    fontWeight: '600',
    fontSize: 13,
  },
  fullBadge: {
    backgroundColor: '#F3F1EC',
    borderWidth: 1,
    borderColor: '#E2DED7',
    paddingHorizontal: 16,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullBadgeText: {
    color: '#8A8781',
    fontWeight: '600',
    fontSize: 13,
  },
  lockedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F3F1EC',
    borderWidth: 1,
    borderColor: '#E2DED7',
    paddingHorizontal: 14,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
  },
  lockedBadgeText: {
    color: '#8A8781',
    fontWeight: '600',
    fontSize: 13,
  },

  emptyFilterState: {
    padding: 28,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2DED7',
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  emptyFilterTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#171716',
    marginBottom: 4,
  },
  emptyFilterSub: {
    fontSize: 12,
    color: '#65635F',
    textAlign: 'center',
  },

  lastCard: {
    marginBottom: 0,
  },
});
