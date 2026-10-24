import { StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';

export const styles = StyleSheet.create({
  scrollContent: {
    padding: 16,
    paddingBottom: 12,
    backgroundColor: '#F3F1EC', // KudiCart warm neutral canvas
  },

  /* 1. Profile Header Card */
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2DED7',
    marginBottom: 12,
  },
  badgeRow: {
    alignItems: 'flex-end',
    marginBottom: 4,
  },
  sinceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF9F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EFECE6',
    gap: 4,
  },
  sinceMedal: {
    fontSize: 12,
  },
  sinceText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#65635F',
  },
  profileMainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatarCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#EAE6DD',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  avatarInitials: {
    fontSize: 22,
    fontWeight: '700',
    color: '#171716',
    letterSpacing: 0.5,
  },
  onlineBadgeDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#16805A',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  nameCol: {
    flex: 1,
    justifyContent: 'center',
  },
  profileFirstName: {
    fontSize: 22,
    fontWeight: '800',
    color: '#171716',
    lineHeight: 26,
  },
  profileLastName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#65635F',
    lineHeight: 20,
    marginBottom: 4,
  },
  roleTag: {
    alignSelf: 'flex-start',
    backgroundColor: '#F3F1EC',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  roleTagText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#65635F',
  },
  profileFooter: {
    alignItems: 'flex-end',
    marginTop: 6,
  },
  viewDetailsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF0E8',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    gap: 4,
  },
  viewDetailsText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
  },

  /* 2. Update Available Banner */
  updateCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E2DED7',
    marginBottom: 12,
  },
  updateLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  updateIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFF0E8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  updateTextCol: {
    flex: 1,
  },
  updateTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#171716',
  },
  updateSubtitle: {
    fontSize: 11,
    color: '#65635F',
    marginTop: 1,
  },
  updateButton: {
    backgroundColor: '#FFF0E8',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFD6C5',
  },
  updateButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },

  /* 3. Menu List Container */
  menuContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2DED7',
    marginBottom: 10,
    overflow: 'hidden',
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F1EC',
  },
  menuRowLast: {
    borderBottomWidth: 0,
  },
  iconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#FAF9F6',
    borderWidth: 1,
    borderColor: '#EFECE6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  menuTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#171716',
  },

  /* Glyphs for specialized menu items */
  currencyGlyph: {
    fontSize: 15,
    fontWeight: '700',
  },
  moreGlyph: {
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: -1,
  },

  /* 4. Log Out Button */
  logoutButton: {
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#FED7D7',
    paddingVertical: 9,
    paddingHorizontal: 26,
    borderRadius: 10,
    marginTop: 4,
    marginBottom: 8,
  },
  logoutButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#DA1E28',
  },
});
