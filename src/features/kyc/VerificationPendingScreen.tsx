import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Platform, Animated } from 'react-native';
import { ScreenContainer } from '../../components/ScreenContainer';
import { spacing } from '../../theme/spacing';
import { colors } from '../../theme/colors';
import { KudiIcon } from '../../components/KudiIcon';
import logo from '../../assets/logo.png';
import { useAuthStore } from '../../store/useAuthStore';
import { useDriverStore } from '../../store/useDriverStore';

const RadarPulse = ({ children }: { children: React.ReactNode }) => {
  const anim1 = useRef(new Animated.Value(0)).current;
  const anim2 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const createLoop = (anim: Animated.Value, delay: number) => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(anim, {
            toValue: 1,
            duration: 2500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    };

    createLoop(anim1, 0);
    createLoop(anim2, 1250);
  }, [anim1, anim2]);

  const getAnimatedStyle = (anim: Animated.Value) => ({
    transform: [
      {
        scale: anim.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 2.0],
        }),
      },
    ],
    opacity: anim.interpolate({
      inputRange: [0, 0.2, 1],
      outputRange: [0, 0.75, 0],
    }),
  });

  return (
    <View style={styles.radarContainer}>
      <Animated.View style={[styles.radarRing, getAnimatedStyle(anim1)]} />
      <Animated.View style={[styles.radarRing, getAnimatedStyle(anim2)]} />
      {children}
    </View>
  );
};

export const VerificationPendingScreen = () => {
  const { logout, setKycStatus } = useAuthStore();
  const { profile, vehicle } = useDriverStore();

  // Automatically transition to Verification Failed / Rejected screen after 10 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setKycStatus('REJECTED');
    }, 10000);

    return () => clearTimeout(timer);
  }, [setKycStatus]);

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false} bounces={false}>
        {/* Header with safe-area padding to prevent clipping */}
        <View style={styles.header}>
          <Image source={logo} style={styles.logo} resizeMode="contain" />
        </View>

        <View style={styles.content}>
          {/* Status Illustration with Radar Pulse Loading Animation */}
          <RadarPulse>
            <View style={styles.iconContainer}>
              <KudiIcon name="clock" color={colors.primary} size={42} />
            </View>
          </RadarPulse>
          
          {/* Verification Heading & Natural Copy */}
          <Text style={styles.title}>Verification pending</Text>
          
          <Text style={styles.subtitle}>
            Your documents have been submitted. We're reviewing your profile and will notify you when it's approved.
          </Text>

          {/* Application Details Card */}
          <View style={styles.summaryCard}>
            <View style={styles.summaryHeader}>
              <Text style={styles.summaryTitle}>Application details</Text>
              <View style={styles.statusBadge}>
                <View style={styles.statusDot} />
                <Text style={styles.statusBadgeText}>Under review</Text>
              </View>
            </View>

            <View style={styles.summaryDivider} />

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Partner name</Text>
              <Text style={styles.summaryValue}>{profile.fullName || 'Rahul Sharma'}</Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Partner ID</Text>
              <Text style={styles.summaryValue}>{profile.id || 'KC-DRV-8492'}</Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Vehicle</Text>
              <Text style={styles.summaryValue}>
                {vehicle.make && vehicle.model ? `${vehicle.make} ${vehicle.model}` : 'Honda Activa 6G'}
              </Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Registration</Text>
              <Text style={styles.summaryValue}>{vehicle.registrationNumber || 'KA 05 MJ 4821'}</Text>
            </View>
          </View>

          {/* Information Notice */}
          <View style={styles.infoCard}>
            <KudiIcon name="info-circle" color="#1A2C5B" size={18} />
            <Text style={styles.infoText}>
              Reviews usually take 24–48 hours. We'll notify you by SMS and in the app when your account is approved.
            </Text>
          </View>
        </View>

        {/* Footer Actions */}
        <View style={styles.footer}>
          <TouchableOpacity
            onPress={logout}
            style={styles.logoutBtn}
            activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 16, right: 16 }}
          >
            <Text style={styles.logoutBtnText}>Log out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
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
