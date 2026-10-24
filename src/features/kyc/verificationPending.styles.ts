import { StyleSheet, Platform } from 'react-native';
import { spacing } from '../../theme/spacing';
import { colors } from '../../theme/colors';

export const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: spacing.l,
    paddingTop: Platform.OS === 'web' ? 24 : 16,
    paddingBottom: 24,
  },
  header: {
    alignItems: 'center',
    paddingTop: 12,
    marginBottom: 16,
  },
  logo: {
    width: 140,
    height: 38,
  },
  content: {
    alignItems: 'center',
  },
  radarContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    width: 120,
    height: 120,
  },
  radarRing: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 90, 31, 0.12)', // brand orange #FF5A1F
    borderWidth: 1,
    borderColor: 'rgba(255, 90, 31, 0.22)',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFF0E8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1A2C5B',
    marginBottom: 6,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 18,
    paddingHorizontal: 8,
  },

  // Application Details Card
  summaryCard: {
    width: '100%',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: '#E2DED7',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 14,
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1A2C5B',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#D97706',
    marginRight: 6,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#B45309',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: '#F3F1EC',
    marginVertical: 10,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 3.5,
  },
  summaryLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '400',
  },
  summaryValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1A2C5B',
    textAlign: 'right',
  },

  // Information Notice Card
  infoCard: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    padding: 12,
    borderRadius: 12,
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: '#E2DED7',
    width: '100%',
    marginBottom: 16,
  },
  infoText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginLeft: 10,
    flex: 1,
    lineHeight: 18,
  },

  footer: {
    marginTop: 12,
    alignItems: 'center',
    width: '100%',
    paddingBottom: 16,
  },
  logoutBtn: {
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: spacing.l,
  },
  logoutBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
});
