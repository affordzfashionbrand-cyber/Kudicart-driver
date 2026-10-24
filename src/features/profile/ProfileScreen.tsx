import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { ScreenContainer } from '../../components/ScreenContainer';
import { spacing } from '../../theme/spacing';
import { colors } from '../../theme/colors';
import { useDriverStore } from '../../store/useDriverStore';
import { useAuthStore } from '../../store/useAuthStore';
import { KudiIcon } from '../../components/KudiIcon';
import { toast } from '../../store/useToastStore';

/**
 * Custom Menu Icon Renderer
 * Produces crisp, authentic icons matching the Zepto content with KudiCart styling
 */
const MenuIcon = ({ id, color }: { id: string; color: string }) => {
  switch (id) {
    case 'store':
      return <KudiIcon name="home" size={19} color={color} />;
    case 'rateCards':
      return <Text style={[styles.currencyGlyph, { color }]}>₹</Text>;
    case 'slotHistory':
      return <KudiIcon name="calendar" size={19} color={color} />;
    case 'orderHistory':
      return <KudiIcon name="clipboard-list" size={19} color={color} />;
    case 'help':
      return <KudiIcon name="help" size={19} color={color} />;
    case 'notifications':
      return <KudiIcon name="notifications" size={19} color={color} />;
    case 'documents':
      return <KudiIcon name="document" size={19} color={color} />;
    case 'about':
      return <Text style={[styles.moreGlyph, { color }]}>•••</Text>;
    default:
      return <KudiIcon name="chevron-right" size={19} color={color} />;
  }
};

export const ProfileScreen = ({ navigation }: any) => {
  const { profile, isOnline } = useDriverStore();
  const { logout } = useAuthStore();

  // Driver Name formatting: "Aman" / "Singh" or store values
  const driverFullName = profile.fullName || profile.name || 'Aman Singh';
  const nameParts = driverFullName.trim().split(' ');
  const firstName = nameParts[0] || 'Aman';
  const lastName = nameParts.slice(1).join(' ') || 'Singh';

  // Focused delivery partner menu items
  const menuItems = [
    { id: 'store', label: 'Your Store' },
    { id: 'rateCards', label: 'My Rate Cards' },
    { id: 'slotHistory', label: 'Slot History' },
    { id: 'orderHistory', label: 'Order History' },
    { id: 'help', label: 'Help & Support' },
    { id: 'notifications', label: 'Notification Center' },
    { id: 'documents', label: 'Documents' },
    { id: 'about', label: 'About' },
  ];


  const handleMenuPress = (id: string, label: string) => {
    if (id === 'notifications') {
      if (navigation?.navigate) {
        navigation.navigate('Notifications');
      } else {
        toast.info('Opening Notification Center...');
      }
      return;
    }

    if (navigation?.navigate) {
      navigation.navigate('ProfileDetailSub', { id, title: label });
    } else {
      toast.info(`Opening ${label}...`);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out of KudiCart Driver?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: () => {
            logout();
            toast.info('Logged out successfully.');
          },
        },
      ]
    );
  };

  return (
    <ScreenContainer edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 1. TOP PROFILE CARD (Zepto Pattern with KudiCart Design) */}
        <View style={styles.profileCard}>
          {/* Partner Since Badge (Top Right) */}
          <View style={styles.badgeRow}>
            <View style={styles.sinceBadge}>
              <Text style={styles.sinceMedal}>🏅</Text>
              <Text style={styles.sinceText}>Partner since Feb 2026</Text>
            </View>
          </View>

          {/* Avatar and Name Details */}
          <View style={styles.profileMainRow}>
            {/* Driver Avatar */}
            <View style={styles.avatarContainer}>
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarInitials}>
                  {firstName.charAt(0)}
                  {lastName.charAt(0)}
                </Text>
              </View>
              {isOnline ? <View style={styles.onlineBadgeDot} /> : null}
            </View>

            {/* Name and ID */}
            <View style={styles.nameCol}>
              <Text style={styles.profileFirstName}>{firstName}</Text>
              <Text style={styles.profileLastName}>{lastName}</Text>
              <View style={styles.roleTag}>
                <Text style={styles.roleTagText}>ID: {profile.id || 'KC-DRV-8492'}</Text>
              </View>
            </View>
          </View>

          {/* View Details Action Button (Bottom Right) */}
          <View style={styles.profileFooter}>
            <TouchableOpacity
              style={styles.viewDetailsBtn}
              onPress={() => {
                if (navigation?.navigate) {
                  navigation.navigate('DriverProfileDetails');
                }
              }}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="View driver details"
            >
              <Text style={styles.viewDetailsText}>View Details</Text>
              <KudiIcon name="chevron-right" size={15} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* 2. NEW UPDATE AVAILABLE BANNER */}
        <View style={styles.updateCard}>
          <View style={styles.updateLeft}>
            <View style={styles.updateIconContainer}>
              <KudiIcon name="phone" size={18} color={colors.primary} />
            </View>
            <View style={styles.updateTextCol}>
              <Text style={styles.updateTitle}>New Update Available</Text>
              <Text style={styles.updateSubtitle}>Get the latest app</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.updateButton}
            onPress={() =>
              toast.info('You are already using the latest KudiCart Driver app (v2.4.1).')
            }
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Update app"
          >
            <Text style={styles.updateButtonText}>Update</Text>
          </TouchableOpacity>
        </View>

        {/* 3. MENU ITEMS LIST (All 17 Zepto Options - Open In Dedicated Separate Screens) */}
        <View style={styles.menuContainer}>
          {menuItems.map((item, index) => {
            const isLast = index === menuItems.length - 1;
            return (
              <TouchableOpacity
                key={item.id}
                style={[styles.menuRow, isLast && styles.menuRowLast]}
                onPress={() => handleMenuPress(item.id, item.label)}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel={item.label}
              >
                {/* Left Circular Icon Container */}
                <View style={styles.iconCircle}>
                  <MenuIcon id={item.id} color="#171716" />
                </View>

                {/* Option Title */}
                <Text style={styles.menuTitle}>{item.label}</Text>

                {/* Right Arrow Chevron */}
                <KudiIcon name="chevron-right" size={16} color="#A8A8A8" />
              </TouchableOpacity>
            );
          })}
        </View>

        {/* 4. LOG OUT BUTTON */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Log Out"
        >
          <Text style={styles.logoutButtonText}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
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
