import React, { useEffect, useRef } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, Platform, Animated } from 'react-native';
import { ScreenContainer } from '../../components/ScreenContainer';
import { colors } from '../../theme/colors';
import { KudiIcon } from '../../components/KudiIcon';
import logo from '../../assets/logo.png';
import { useAuthStore } from '../../store/useAuthStore';
import { useDriverStore } from '../../store/useDriverStore';
import { styles } from './verificationPending.styles';

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

