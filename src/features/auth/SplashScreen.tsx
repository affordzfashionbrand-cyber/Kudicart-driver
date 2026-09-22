import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { ScreenContainer } from '../../components/ScreenContainer';
import { typography } from '../../theme/typography';
import { colors } from '../../theme/colors';
import logo from '../../assets/logo.png';

export const SplashScreen = () => {
  return (
    <ScreenContainer style={styles.container}>
      <View style={styles.logoContainer}>
        <Image 
          source={logo} 
          style={styles.logo}
          resizeMode="contain"
        />
      </View>
      <View style={styles.footer}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>🛡️ 256-BIT ENCRYPTED SESSION</Text>
        </View>
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  logo: {
    width: 250,
    height: 80,
  },
  footer: {
    marginBottom: 40,
  },
  badge: {
    backgroundColor: colors.surface,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  badgeText: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.textSecondary,
  },
});
