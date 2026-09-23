import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { ScreenContainer } from '../../components/ScreenContainer';
import { typography } from '../../theme/typography';
import { colors } from '../../theme/colors';
import logo from '../../assets/logo.png';

export const SplashScreen = () => {
  return (
    <ScreenContainer style={styles.container}>
      <Image 
        source={logo} 
        style={styles.logo}
        resizeMode="contain"
      />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 250,
    height: 80,
    marginLeft: 12, // Visual centering adjustment
  },
});
