import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { ScreenContainer } from '../../components/ScreenContainer';
import { useDriverStore } from '../../store/useDriverStore';
import { useAuthStore } from '../../store/useAuthStore';
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
              <Text style={styles.sinceText}>Partner since 2024</Text>
            </View>
          </View>

          <View style={styles.profileMainRow}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarInitials}>
                  {firstName.charAt(0)}
                  {lastName.charAt(0)}
                </Text>
              </View>
              {isOnline && <View style={styles.onlineBadgeDot} />}
            </View>

            <View style={styles.nameCol}>
              <Text style={styles.profileFirstName}>{firstName}</Text>
              <Text style={styles.profileLastName}>{lastName}</Text>
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
                  navigation.navigate('ProfileDetailSub', {
                    id: 'driverDetails',
                    title: 'Driver Details',
                  });
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

        {/* 2. UPDATE AVAILABLE BANNER */}
        <View style={styles.updateCard}>
          <View style={styles.updateLeft}>
            <View style={styles.updateIconContainer}>
              <KudiIcon name="arrow-up" size={18} color="#FF5A1F" />
            </View>
            <View style={styles.updateTextCol}>
              <Text style={styles.updateTitle}>Update Available</Text>
              <Text style={styles.updateSubtitle}>KudiCart Driver v2.4.1</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.updateButton}
            onPress={() => toast.info('Checking Play Store for updates...')}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Update app"
          >
            <Text style={styles.updateButtonText}>Update</Text>
          </TouchableOpacity>
        </View>

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
