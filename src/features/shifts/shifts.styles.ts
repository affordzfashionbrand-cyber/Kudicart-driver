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
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 8,
  },

  // Full-time Today's Shift Main Card (Soft-Orange Branded Surface)
  heroShiftCard: {
    backgroundColor: '#FFF0E8',
    borderWidth: 1,
    borderColor: '#FFDAC8',
    borderRadius: 16,
    padding: 18,
    marginBottom: 20,
  },
  heroShiftHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  heroShiftDate: {
    fontSize: 13,
    fontWeight: '500',
    color: '#9E4A24',
  },
  heroShiftTime: {
    fontSize: 18,
    fontWeight: '700',
    color: '#171716',
    marginBottom: 12,
  },
  heroDivider: {
    height: 1,
    backgroundColor: '#FFDAC8',
    marginBottom: 12,
  },
  heroDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  heroDetailIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFE2D5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  heroDetailTextCol: {
    flex: 1,
  },
  heroDetailLabel: {
    fontSize: 13,
    color: '#65635F',
    fontWeight: '400',
  },
  heroDetailValue: {
    color: '#171716',
    fontWeight: '600',
  },
  heroDetailSub: {
    fontSize: 12,
    color: '#65635F',
    marginTop: 2,
  },

  // Section Headers
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#171716',
    marginBottom: 12,
  },

  // Full-time Schedule List Cards (White Cards)
  scheduleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: '#E2DED7',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    minHeight: 60,
    marginBottom: 10,
  },
  scheduleInfo: {
    flex: 1,
  },
  scheduleDay: {
    fontSize: 14,
    fontWeight: '600',
    color: '#171716',
    marginBottom: 2,
  },
  scheduleSub: {
    fontSize: 12,
    fontWeight: '400',
    color: '#65635F',
  },
  scheduleSubOff: {
    color: '#8A8781',
  },

  statusRowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  // Status Badges
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusPillText: {
    fontSize: 12,
    fontWeight: '600',
  },

  // Bottom Sheet In-Screen Overlay
  overlayContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
    elevation: 9999,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'flex-end',
  },
  bottomSheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 24,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 10,
  },
  dragHandle: {
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D3CEC7',
    alignSelf: 'center',
    marginBottom: 16,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  sheetHeaderLeft: {
    flex: 1,
    paddingRight: 12,
  },
  sheetDate: {
    fontSize: 18,
    fontWeight: '700',
    color: '#171716',
    marginBottom: 3,
  },
  sheetSub: {
    fontSize: 13,
    color: '#65635F',
    fontWeight: '400',
  },
  sheetDivider: {
    height: 1,
    backgroundColor: '#F3F1EC',
    marginVertical: 14,
  },

  // Soft-orange Highlight Panel for Shift Time
  sheetTimePanel: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF0E8',
    borderWidth: 1,
    borderColor: '#FFDAC8',
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
  },
  sheetTimeIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFE2D5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  sheetTimeTextCol: {
    flex: 1,
  },
  sheetTimeLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#9E4A24',
    marginBottom: 2,
  },
  sheetTimeValue: {
    fontSize: 17,
    fontWeight: '700',
    color: '#171716',
  },

  // Neutral Card for Hub & Duration
  sheetNeutralCard: {
    backgroundColor: '#F9F8F5',
    borderWidth: 1,
    borderColor: '#E2DED7',
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
  },
  sheetField: {
    marginBottom: 0,
  },
  sheetFieldLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#65635F',
    marginBottom: 3,
  },
  sheetFieldValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#171716',
  },
  sheetFieldSub: {
    fontSize: 12,
    color: '#8A8781',
    marginTop: 2,
  },
  sheetFieldDivider: {
    height: 1,
    backgroundColor: '#EAE7E0',
    marginVertical: 12,
  },
  sheetFieldRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sheetFieldCol: {
    flex: 1,
  },

  dayOffContainer: {
    backgroundColor: '#F3F1EC',
    borderRadius: 12,
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },
  dayOffText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#65635F',
    textAlign: 'center',
  },
  sheetCloseButton: {
    backgroundColor: '#F3F1EC',
    borderWidth: 1,
    borderColor: '#E2DED7',
    borderRadius: 10,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
  sheetCloseButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333333',
  },

  lastCard: {
    marginBottom: 0,
  },
});
