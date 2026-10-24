import React, { useEffect, useRef } from 'react';
import { View, Animated } from 'react-native';
import { dashboardStyles as styles } from './dashboard.styles';

export const RadarPulse = ({ children }: { children: React.ReactNode }) => {
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

  const getAnimatedStyle = (anim: Animated.Value) => {
    return {
      transform: [
        {
          scale: anim.interpolate({
            inputRange: [0, 1],
            outputRange: [1, 2.8],
          }),
        },
      ],
      opacity: anim.interpolate({
        inputRange: [0, 0.2, 1],
        outputRange: [0, 0.8, 0],
      }),
    };
  };

  return (
    <View style={styles.radarContainer}>
      <Animated.View style={[styles.radarRing, getAnimatedStyle(anim1)]} />
      <Animated.View style={[styles.radarRing, getAnimatedStyle(anim2)]} />
      {children}
    </View>
  );
};
