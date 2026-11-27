import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  AppState,
  Easing,
  Keyboard,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useToastStore, ToastPayload, ToastType } from '../store/useToastStore';
import { KudiIcon } from './KudiIcon';
import { IconName } from './KudiIcon.types';

interface ToastThemeConfig {
  icon: IconName;
  indicatorColor: string;
  indicatorBg: string;
  accessibilityPrefix: string;
}

const THEMES: Record<ToastType, ToastThemeConfig> = {
  success: {
    icon: 'check-circle',
    indicatorColor: '#15803D',
    indicatorBg: '#DCFCE7',
    accessibilityPrefix: 'Success',
  },
  error: {
    icon: 'error-circle',
    indicatorColor: '#DC2626',
    indicatorBg: '#FEE2E2',
    accessibilityPrefix: 'Error',
  },
  warning: {
    icon: 'warning',
    indicatorColor: '#B45309',
    indicatorBg: '#FEF3C7',
    accessibilityPrefix: 'Warning',
  },
  info: {
    icon: 'info-circle',
    indicatorColor: '#FF5A1F',
    indicatorBg: '#FFEDD5',
    accessibilityPrefix: 'Notice',
  },
};

export const GlobalToast: React.FC = () => {
  const insets = useSafeAreaInsets();
  const currentToast = useToastStore((state) => state.currentToast);
  const hideToast = useToastStore((state) => state.hideToast);

  const [activeToast, setActiveToast] = useState<ToastPayload | null>(null);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const activeToastRef = useRef<ToastPayload | null>(null);

  const translateY = useRef(new Animated.Value(-8)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true));
    const hideSub = Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false));
    const appSub = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') {
        const current = useToastStore.getState().currentToast;
        if (current?.expiresAt && Date.now() >= current.expiresAt) {
          useToastStore.getState().hideToast();
        }
      }
    });

    return () => {
      showSub.remove();
      hideSub.remove();
      appSub.remove();
      translateY.stopAnimation();
      opacity.stopAnimation();
    };
  }, [opacity, translateY]);

  useEffect(() => {
    if (currentToast) {
      activeToastRef.current = currentToast;
      setActiveToast(currentToast);

      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 160,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 140,
          useNativeDriver: Platform.OS !== 'web',
        }),
      ]).start();
    } else if (activeToastRef.current) {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: -6,
          duration: 130,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 120,
          useNativeDriver: Platform.OS !== 'web',
        }),
      ]).start(() => {
        activeToastRef.current = null;
        setActiveToast(null);
      });
    }
  }, [currentToast, opacity, translateY]);

  if (!activeToast) {
    return null;
  }

  const config = THEMES[activeToast.type] || THEMES.info;
  // Compact top safe placement avoids covering bottom nav, CTA buttons, or Android keyboard
  const topOffset = Math.max(insets.top, 8) + (keyboardVisible ? 4 : 6);

  return (
    <View style={styles.overlay} pointerEvents="box-none">
      <Animated.View
        style={[
          styles.toastCard,
          {
            marginTop: topOffset,
            transform: [{ translateY }],
            opacity,
          },
        ]}
      >
        <View
          style={styles.toastRow}
          accessibilityRole="alert"
          accessibilityLiveRegion={activeToast.type === 'error' ? 'assertive' : 'polite'}
          accessibilityLabel={`${config.accessibilityPrefix}: ${activeToast.message}`}
        >
          <View style={[styles.statusIconWrap, { backgroundColor: config.indicatorBg }]}>
            <KudiIcon name={config.icon} size={14} color={config.indicatorColor} />
          </View>

          <View style={styles.textColumn}>
            {Boolean(activeToast.title) && (
              <Text
                style={styles.title}
                numberOfLines={1}
                maxFontSizeMultiplier={1.3}
              >
                {activeToast.title}
              </Text>
            )}
            <Text
              style={styles.message}
              numberOfLines={3}
              maxFontSizeMultiplier={1.3}
            >
              {activeToast.message}
            </Text>
          </View>

          {activeToast.action && (
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: config.indicatorBg }]}
              onPress={() => {
                activeToast.action?.onPress();
                hideToast();
              }}
              activeOpacity={0.75}
              accessibilityRole="button"
              accessibilityLabel={activeToast.action.label}
            >
              <Text
                style={[styles.actionBtnText, { color: config.indicatorColor }]}
                maxFontSizeMultiplier={1.2}
              >
                {activeToast.action.label}
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            onPress={hideToast}
            style={styles.closeBtn}
            activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityRole="button"
            accessibilityLabel="Dismiss notification"
          >
            <KudiIcon name="close" size={13} color="#71717A" />
          </TouchableOpacity>
        </View>
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
    paddingHorizontal: 14,
  },
  toastCard: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2DED7',
    shadowColor: '#171716',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.09,
    shadowRadius: 8,
    elevation: 6,
  },
  toastRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 40,
    paddingVertical: 8,
    paddingHorizontal: 11,
    gap: 9,
  },
  statusIconWrap: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  textColumn: {
    flex: 1,
    gap: 1,
  },
  title: {
    fontSize: 11,
    fontWeight: '700',
    color: '#171716',
  },
  message: {
    fontSize: 12.5,
    fontWeight: '600',
    lineHeight: 17,
    color: '#27272A',
  },
  actionBtn: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 8,
    flexShrink: 0,
  },
  actionBtnText: {
    fontSize: 11.5,
    fontWeight: '700',
  },
  closeBtn: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
});
