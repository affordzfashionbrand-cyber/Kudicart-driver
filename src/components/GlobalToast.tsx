import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Easing,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useToastStore, ToastPayload, ToastType } from '../store/useToastStore';
import { KudiIcon } from './KudiIcon';
import { IconName } from './KudiIcon.types';

interface ToastThemeConfig {
  icon: IconName;
  iconColor: string;
  bg: string;
  border: string;
  text: string;
  accessibilityPrefix: string;
}

const THEMES: Record<ToastType, ToastThemeConfig> = {
  success: {
    icon: 'check-circle',
    iconColor: '#22C55E', // Vibrant emerald green
    bg: '#171716', // Dark charcoal pill
    border: 'rgba(34, 197, 94, 0.35)',
    text: '#FFFFFF',
    accessibilityPrefix: 'Success',
  },
  error: {
    icon: 'error-circle',
    iconColor: '#EF4444', // Red
    bg: '#171716',
    border: 'rgba(239, 68, 68, 0.4)',
    text: '#FFFFFF',
    accessibilityPrefix: 'Error',
  },
  warning: {
    icon: 'warning',
    iconColor: '#F59E0B', // Amber
    bg: '#171716',
    border: 'rgba(245, 158, 11, 0.35)',
    text: '#FFFFFF',
    accessibilityPrefix: 'Warning',
  },
  info: {
    icon: 'info-circle',
    iconColor: '#FF5A1F', // KudiCart Signal Orange
    bg: '#171716',
    border: 'rgba(255, 90, 31, 0.35)',
    text: '#FFFFFF',
    accessibilityPrefix: 'Notice',
  },
};

export const GlobalToast: React.FC = () => {
  const insets = useSafeAreaInsets();
  const currentToast = useToastStore((state) => state.currentToast);
  const hideToast = useToastStore((state) => state.hideToast);

  const [activeToast, setActiveToast] = useState<ToastPayload | null>(null);

  const translateY = useRef(new Animated.Value(-10)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  // Track animation state to prevent race conditions
  const isAnimatingRef = useRef(false);

  useEffect(() => {
    if (currentToast) {
      setActiveToast(currentToast);

      isAnimatingRef.current = true;
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 200,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 180,
          useNativeDriver: true,
        }),
      ]).start(() => {
        isAnimatingRef.current = false;
      });
    } else if (activeToast) {
      isAnimatingRef.current = true;
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: -8,
          duration: 160,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start(() => {
        isAnimatingRef.current = false;
        setActiveToast(null);
      });
    }
  }, [currentToast]);

  if (!activeToast) {
    return null;
  }

  const config = THEMES[activeToast.type] || THEMES.info;

  // Position strictly below the sticky header (header height = 64px on home, 56px on sub-screens)
  // Accounting for the device safe area top inset + header + 8px spacing
  const topOffset = Math.max(insets.top, 0) + 64 + 8;

  return (
    <View style={styles.overlay} pointerEvents="box-none">
      <Animated.View
        style={[
          styles.pillContainer,
          {
            marginTop: topOffset,
            backgroundColor: config.bg,
            borderColor: config.border,
            transform: [{ translateY }],
            opacity,
          },
        ]}
      >
        <TouchableOpacity
          style={styles.pillContent}
          onPress={hideToast}
          activeOpacity={0.85}
          accessibilityRole="alert"
          accessibilityLiveRegion={activeToast.type === 'error' ? 'assertive' : 'polite'}
          accessibilityLabel={`${config.accessibilityPrefix}: ${activeToast.message}`}
        >
          {/* Small Status Icon */}
          <View style={styles.iconContainer}>
            <KudiIcon name={config.icon} size={15} color={config.iconColor} />
          </View>

          {/* Single-Line Message */}
          <Text style={[styles.message, { color: config.text }]} numberOfLines={1}>
            {activeToast.title ? `${activeToast.title}: ` : ''}
            {activeToast.message}
          </Text>

          {/* Optional Action Label */}
          {activeToast.action && (
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => {
                activeToast.action?.onPress();
                hideToast();
              }}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel={activeToast.action.label}
            >
              <Text style={[styles.actionBtnText, { color: config.iconColor }]}>
                {activeToast.action.label}
              </Text>
            </TouchableOpacity>
          )}
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 999999,
    elevation: 999999,
    alignItems: 'center',
  },
  pillContainer: {
    alignSelf: 'center',
    maxWidth: '92%',
    borderRadius: 999,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 10,
    elevation: 10,
  },
  pillContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 14,
    gap: 8,
  },
  iconContainer: {
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  message: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: -0.1,
    flexShrink: 1,
  },
  actionBtn: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    marginLeft: 4,
    flexShrink: 0,
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
});
