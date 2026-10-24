import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Order } from '../../../store/useOrderStore';
import { ordersApi } from '../../../api';
import { KudiIcon } from '../../../components/KudiIcon';

interface TryAndBuyWaitingConfirmationViewProps {
  order: Order;
  onCompleteReconciliation: () => void;
  onBack?: () => void;
}

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
          outputRange: [1, 2.8],
        }),
      },
    ],
    opacity: anim.interpolate({
      inputRange: [0, 0.2, 1],
      outputRange: [0, 0.8, 0],
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

export const TryAndBuyWaitingConfirmationView: React.FC<TryAndBuyWaitingConfirmationViewProps> = ({
  order,
  onCompleteReconciliation,
  onBack,
}) => {
  // Developer simulation restricted strictly to development environments (__DEV__)
  const [devConfirmed, setDevConfirmed] = useState(false);
  const isSupervisorConfirmed = order.storeReconciliationStatus === 'RECONCILED' || (__DEV__ && devConfirmed);

  // Real periodic poll of server confirmation status
  useEffect(() => {
    if (isSupervisorConfirmed) return;

    const interval = setInterval(async () => {
      try {
        const details = await ordersApi.getOrderDetails(order.id);
        if (details.storeReconciliationStatus === 'RECONCILED' || details.status === 'DELIVERED') {
          onCompleteReconciliation();
        }
      } catch {}
    }, 5000);

    return () => clearInterval(interval);
  }, [order.id, isSupervisorConfirmed, onCompleteReconciliation]);

  const formattedOrderId = order.id ? (order.id.startsWith('#') ? order.id : `#${order.id}`) : '';

  return (
    <View style={styles.container}>
      {/* 1. COMPACT HEADER */}
      <View style={styles.topBar}>
        {onBack ? (
          <TouchableOpacity
            onPress={onBack}
            style={styles.backBtn}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            accessibilityRole="button"
            accessibilityLabel="Back"
          >
            <KudiIcon name="arrow-left" size={20} color="#171716" />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 36 }} />
        )}
        <Text style={styles.topBarTitle}>Waiting for confirmation</Text>
        <TouchableOpacity
          disabled={!__DEV__}
          onLongPress={() => __DEV__ && setDevConfirmed((prev) => !prev)}
          activeOpacity={__DEV__ ? 0.6 : 1}
        >
          <Text style={styles.topBarOrderId}>{formattedOrderId}</Text>
        </TouchableOpacity>
      </View>

      {/* 2. CENTERED WAITING STATE WITH SCOOTER RADAR PULSE */}
      <View style={styles.content}>
        {!isSupervisorConfirmed ? (
          <RadarPulse>
            <View style={styles.statusIconBg}>
              <KudiIcon name="package" size={24} color="#FF5A1F" />
            </View>
          </RadarPulse>
        ) : (
          <View style={styles.statusIconBgSuccess}>
            <KudiIcon name="check-circle" size={24} color="#16805A" />
          </View>
        )}

        <Text style={styles.heading}>
          {isSupervisorConfirmed ? 'Return confirmed by hub' : 'Waiting for hub confirmation'}
        </Text>

        <Text style={styles.subtext}>
          {isSupervisorConfirmed
            ? 'All returned items have been verified. You can now complete the delivery.'
            : "Your returned items have been handed over. We'll update this screen once the hub team confirms the return."}
        </Text>
      </View>

      {/* 3. COMPLETION ACTION (Appears only once hub confirms return) */}
      {isSupervisorConfirmed && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.completeBtn}
            onPress={onCompleteReconciliation}
            activeOpacity={0.88}
            accessibilityRole="button"
            accessibilityLabel="Complete delivery"
          >
            <Text style={styles.completeBtnText}>Complete delivery</Text>
            <KudiIcon name="arrow-right" size={18} color="#171716" />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F1EC',
  },
  topBar: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: '#F3F1EC',
    borderBottomWidth: 1,
    borderBottomColor: '#E2DED7',
  },
  backBtn: {
    padding: 6,
    marginLeft: -6,
  },
  topBarTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#171716',
  },
  topBarOrderId: {
    fontSize: 13,
    fontWeight: '600',
    color: '#65635F',
  },

  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingBottom: 40,
  },

  // RADAR PULSE & SCOOTER ICON (Matches Online looking-for-orders radar in Dashboard)
  radarContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    width: 56,
    height: 56,
  },
  radarRing: {
    position: 'absolute',
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 90, 31, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 90, 31, 0.25)',
  },
  statusIconBg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFF0E8',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFD9C7',
    zIndex: 2,
  },
  statusIconBgSuccess: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EAF5EF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#C3E6D2',
    marginBottom: 20,
  },

  heading: {
    fontSize: 18,
    fontWeight: '600',
    color: '#171716',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -0.2,
  },
  subtext: {
    fontSize: 14,
    color: '#65635F',
    textAlign: 'center',
    lineHeight: 21,
    maxWidth: 320,
  },

  footer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2DED7',
  },
  completeBtn: {
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FF5A1F',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  completeBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#171716',
  },
});
