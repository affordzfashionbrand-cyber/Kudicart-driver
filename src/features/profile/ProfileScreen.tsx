import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, Linking } from 'react-native';
import { ScreenContainer } from '../../components/ScreenContainer';
import { useDriverStore } from '../../store/useDriverStore';
import { useAuthStore } from '../../store/useAuthStore';
import { AppVersionStatus, profileApi } from '../../api';
import { APP_NAME, APP_VERSION } from '../../config/appInfo';
import { KudiIcon } from '../../components/KudiIcon';
import { toast } from '../../store/useToastStore';
import { styles } from './profile.styles';

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
    case 'shiftHistory':
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
  const { profile, isOnline, fetchProfileAsync } = useDriverStore();
  const { logout } = useAuthStore();
  const [versionStatus, setVersionStatus] = useState<AppVersionStatus | null>(null);

  useEffect(() => {
    fetchProfileAsync?.();
    profileApi
      .getAppVersionStatus(APP_VERSION)
      .then((res) => setVersionStatus(res))
      .catch(() => setVersionStatus(null));
  }, [fetchProfileAsync]);

  // Driver Name formatting from authenticated store profile
  const driverFullName = profile.fullName || profile.name || 'Delivery Partner';
  const nameParts = driverFullName.trim().split(/\s+/);
  const firstName = nameParts[0] || 'Delivery';
  const lastName = nameParts.slice(1).join(' ');

  const isFullTime = profile.workPreference === 'FULL_TIME';
  const joinedYear = (() => {
    if (!profile.createdAt) return null;
    const d = new Date(profile.createdAt);
    return Number.isNaN(d.getTime()) ? null : d.getFullYear();
  })();

  // Focused delivery partner menu items
  const menuItems = [
    { id: 'store', label: 'Your Store' },
    { id: 'rateCards', label: 'My Rate Cards' },
    isFullTime
      ? { id: 'shiftHistory', label: 'Shift History' }
      : { id: 'slotHistory', label: 'Slot History' },
    { id: 'orderHistory', label: 'Order History' },
    { id: 'help', label: 'Help & Support' },
    { id: 'notifications', label: 'Notification Center' },
    { id: 'documents', label: 'Documents' },
    { id: 'about', label: 'About' },
  ];

  const handleMenuPress = (id: string, label: string) => {
    if (id === 'notifications') {
      navigation?.navigate?.('Notifications');
      return;
    }

    navigation?.navigate?.('ProfileDetailSub', { id, title: label });
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
          },
        },
      ]
    );
  };

  return (
    <ScreenContainer>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* 1. PROFILE HEADER CARD */}
        <View style={styles.profileCard}>
          <View style={styles.badgeRow}>
            <View style={styles.sinceBadge}>
              <Text style={styles.sinceMedal}>🏅</Text>
              <Text style={styles.sinceText}>
                {joinedYear ? `Partner since ${joinedYear}` : 'Verified Partner'}
              </Text>
            </View>
          </View>

          <View style={styles.profileMainRow}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarInitials}>
                  {firstName.charAt(0)}
                  {lastName ? lastName.charAt(0) : ''}
                </Text>
              </View>
              {isOnline && <View style={styles.onlineBadgeDot} />}
            </View>

            <View style={styles.nameCol}>
              <Text style={styles.profileFirstName}>{firstName}</Text>
              {lastName ? <Text style={styles.profileLastName}>{lastName}</Text> : null}
              <View style={styles.roleTag}>
                <Text style={styles.roleTagText}>DELIVERY PARTNER</Text>
              </View>
            </View>
          </View>

          <View style={styles.profileFooter}>
            <TouchableOpacity
              style={styles.viewDetailsBtn}
              onPress={() => {
                if (navigation?.navigate) {
                  navigation.navigate('DriverProfileDetails');
                }
              }}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="View partner details"
            >
              <Text style={styles.viewDetailsText}>View Details</Text>
              <KudiIcon name="chevron-right" size={14} color="#FF5A1F" />
            </TouchableOpacity>
          </View>
        </View>

        {/* 2. REAL UPDATE AVAILABLE BANNER (only shown when backend reports a newer version) */}
        {versionStatus?.updateAvailable ? (
          <View style={styles.updateCard}>
            <View style={styles.updateLeft}>
              <View style={styles.updateIconContainer}>
                <KudiIcon name="chevron-up" size={18} color="#FF5A1F" />
              </View>
              <View style={styles.updateTextCol}>
                <Text style={styles.updateTitle}>Update Available</Text>
                <Text style={styles.updateSubtitle}>
                  {APP_NAME} v{versionStatus.latestVersion}
                </Text>
              </View>
            </View>

            {versionStatus.updateUrl ? (
              <TouchableOpacity
                style={styles.updateButton}
                onPress={() => {
                  Linking.openURL(versionStatus.updateUrl!).catch(() =>
                    toast.error('Unable to open the update link.', {
                      dedupeKey: 'profile-update-link-err',
                    }),
                  );
                }}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel="Update app"
              >
                <Text style={styles.updateButtonText}>Update</Text>
              </TouchableOpacity>
            ) : (
              <Text style={styles.updateSubtitle}>Available via Ops</Text>
            )}
          </View>
        ) : null}

        {/* 3. MENU ITEMS LIST */}
        <View style={styles.menuContainer}>
          {menuItems.map((item, index) => {
            const isLast = index === menuItems.length - 1;

            return (
              <TouchableOpacity
                key={item.id}
                style={[styles.menuRow, isLast && styles.menuRowLast]}
                onPress={() => handleMenuPress(item.id, item.label)}
                activeOpacity={0.65}
                accessibilityRole="button"
                accessibilityLabel={item.label}
              >
                {/* Clean Rounded Icon Badge */}
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
