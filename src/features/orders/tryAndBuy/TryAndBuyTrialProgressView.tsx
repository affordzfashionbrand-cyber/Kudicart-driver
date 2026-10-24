import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Order } from '../../../store/useOrderStore';
import { KudiIcon } from '../../../components/KudiIcon';

interface TryAndBuyTrialProgressViewProps {
  order: Order;
  onSimulateSelection: (selections: { [itemId: string]: 'KEEP' | 'RETURN' }) => void;
  onContactCustomer?: () => void;
  onBack?: () => void;
}

const defaultThumbnails = [
  'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=120&q=80',
  'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=120&q=80',
  'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=120&q=80',
];

export const TryAndBuyTrialProgressView: React.FC<TryAndBuyTrialProgressViewProps> = ({
  order,
  onSimulateSelection,
  onContactCustomer,
  onBack,
}) => {
  const [secondsRemaining, setSecondsRemaining] = useState<number>(() => {
    if (!order.trialEndsAt) return 20 * 60;
    const diff = Math.floor((new Date(order.trialEndsAt).getTime() - Date.now()) / 1000);
    return Math.max(0, diff);
  });

  const totalDurationSeconds = (order.trialDurationMinutes || 20) * 60;

  useEffect(() => {
    const interval = setInterval(() => {
      if (!order.trialEndsAt) return;
      const diff = Math.floor((new Date(order.trialEndsAt).getTime() - Date.now()) / 1000);
      setSecondsRemaining(Math.max(0, diff));
    }, 1000);

    return () => clearInterval(interval);
  }, [order.trialEndsAt]);

  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  const progressPercent = Math.min(100, Math.max(0, ((totalDurationSeconds - secondsRemaining) / totalDurationSeconds) * 100));

  const isExpired = secondsRemaining === 0;

  return (
    <View style={styles.container}>
      {/* 1. TOP BAR */}
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={onBack}
          style={styles.backBtn}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          accessibilityRole="button"
          accessibilityLabel="Back"
        >
          <KudiIcon name="arrow-left" size={20} color="#171716" />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>Trial in progress</Text>
        <Text style={styles.topBarOrderId}>{order.id}</Text>
      </View>

      {/* 2. SCROLL CONTENT */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* TIMER CARD */}
        <View style={styles.timerCard}>
          <Text style={styles.timerSuper}>TIME REMAINING</Text>
          <Text style={[styles.timerDisplay, isExpired && { color: '#DA1E28' }]}>
            {isExpired ? '00:00 (Expired)' : formattedTime}
          </Text>

          {/* Progress bar */}
          <View style={styles.progressBarTrack}>
            <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
          </View>

          <Text style={styles.timerHeadline}>Customer is trying the items</Text>
          <Text style={styles.timerSub}>
            “Wait while the customer checks the products. Their selections will appear here.”
          </Text>
        </View>

        {/* CUSTOMER CONTEXT & GUIDANCE */}
        <View style={styles.card}>
          <Text style={styles.sectionLabel}>Customer & location</Text>
          <View style={styles.customerRow}>
            <View style={{ flex: 1, paddingRight: 10 }}>
              <Text style={styles.customerName}>{order.customerName}</Text>
              <Text style={styles.customerAddress}>{order.customerAddress}</Text>
            </View>
            <TouchableOpacity
              style={styles.actionCircle}
              onPress={onContactCustomer}
              accessibilityRole="button"
              accessibilityLabel="Call customer"
            >
              <KudiIcon name="phone" size={18} color="#FF5A1F" />
            </TouchableOpacity>
          </View>

          <View style={styles.partnerNote}>
            <KudiIcon name="info-circle" size={16} color="#65635F" />
            <Text style={styles.partnerNoteText}>
              Please remain near the delivery point. You will receive an alert as soon as {order.customerName} confirms choices.
            </Text>
          </View>
        </View>

        {/* ITEMS CURRENTLY BEING TRIED */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.sectionLabel}>Items on trial</Text>
            <Text style={styles.cardHeaderMeta}>{order.items?.length || 3} items</Text>
          </View>

          {order.items?.map((item, index) => {
            const isLast = index === order.items!.length - 1;
            return (
              <View
                key={item.id || index}
                style={[styles.productRow, !isLast && styles.productBorder]}
              >
                <Image
                  source={{ uri: defaultThumbnails[index % defaultThumbnails.length] }}
                  style={styles.productThumb}
                  resizeMode="cover"
                />
                <View style={styles.productInfo}>
                  <Text style={styles.productName}>{item.name}</Text>
                  {item.variant ? <Text style={styles.productVariant}>{item.variant}</Text> : null}
                  <Text style={styles.productPrice}>₹{item.price.toLocaleString('en-IN')}</Text>
                </View>
                <View style={styles.evaluatingBadge}>
                  <Text style={styles.evaluatingText}>Trying</Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* SIMULATE CUSTOMER DECISION (NO BACKEND ENABLER) */}
        <View style={[styles.card, styles.simulationCard]}>
          <View style={styles.simulationHeader}>
            <KudiIcon name="clipboard-list" size={16} color="#FF5A1F" />
            <Text style={styles.simulationTitle}>Simulate Customer Selection</Text>
          </View>
          <Text style={styles.simulationSub}>
            (No backend available: Tap a scenario below to test customer confirmation)
          </Text>

          <View style={styles.simulationBtnGrid}>
            <TouchableOpacity
              style={[styles.simBtn, styles.simBtnPrimary]}
              onPress={() =>
                onSimulateSelection({
                  item_1: 'KEEP',
                  item_2: 'RETURN',
                  item_3: 'KEEP',
                })
              }
              activeOpacity={0.85}
            >
              <Text style={styles.simBtnTitle}>Keep 2, Return 1</Text>
              <Text style={styles.simBtnDetail}>T-Shirt & Pants Kept • Jacket Returned</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.simBtn}
              onPress={() =>
                onSimulateSelection({
                  item_1: 'KEEP',
                  item_2: 'KEEP',
                  item_3: 'KEEP',
                })
              }
              activeOpacity={0.85}
            >
              <Text style={styles.simBtnTitle}>Keep All (3 items)</Text>
              <Text style={styles.simBtnDetail}>Branch A: Complete delivery directly</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.simBtn}
              onPress={() =>
                onSimulateSelection({
                  item_1: 'RETURN',
                  item_2: 'RETURN',
                  item_3: 'RETURN',
                })
              }
              activeOpacity={0.85}
            >
              <Text style={styles.simBtnTitle}>Return All (3 items)</Text>
              <Text style={styles.simBtnDetail}>Branch C: Customer returns full order</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F1EC' },
  topBar: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2DED7',
  },
  backBtn: {
    padding: 6,
    marginLeft: -6,
  },
  topBarTitle: { fontSize: 17, fontWeight: '600', color: '#171716', letterSpacing: -0.2 },
  topBarOrderId: { fontSize: 12, fontWeight: '500', color: '#65635F' },

  scrollView: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 32 },

  timerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2DED7',
    padding: 20,
    alignItems: 'center',
    marginBottom: 14,
  },
  timerSuper: {
    fontSize: 11,
    fontWeight: '800',
    color: '#65635F',
    letterSpacing: 1,
    marginBottom: 4,
  },
  timerDisplay: {
    fontSize: 44,
    fontWeight: '900',
    color: '#FF5A1F',
    letterSpacing: -1,
    marginVertical: 4,
  },
  progressBarTrack: {
    width: '100%',
    height: 6,
    borderRadius: 3,
    backgroundColor: '#F3F1EC',
    overflow: 'hidden',
    marginVertical: 14,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#FF5A1F',
    borderRadius: 3,
  },
  timerHeadline: {
    fontSize: 17,
    fontWeight: '700',
    color: '#171716',
    textAlign: 'center',
    marginTop: 2,
  },
  timerSub: {
    fontSize: 13,
    color: '#65635F',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
    paddingHorizontal: 8,
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2DED7',
    padding: 16,
    marginBottom: 14,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardHeaderMeta: { fontSize: 12, fontWeight: '600', color: '#65635F' },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#65635F',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },

  customerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  customerName: { fontSize: 16, fontWeight: '700', color: '#171716' },
  customerAddress: { fontSize: 13, color: '#65635F', marginTop: 4, lineHeight: 18 },
  actionCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2DED7',
    alignItems: 'center',
    justifyContent: 'center',
  },

  partnerNote: {
    flexDirection: 'row',
    backgroundColor: '#F7F6F3',
    padding: 12,
    borderRadius: 10,
    marginTop: 14,
    gap: 8,
    alignItems: 'flex-start',
  },
  partnerNoteText: {
    flex: 1,
    fontSize: 12,
    color: '#65635F',
    lineHeight: 16,
  },

  productRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    gap: 12,
  },
  productBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F0ECE6',
  },
  productThumb: { width: 44, height: 44, borderRadius: 8, backgroundColor: '#E2DED7' },
  productInfo: { flex: 1 },
  productName: { fontSize: 14, fontWeight: '600', color: '#171716' },
  productVariant: { fontSize: 12, color: '#65635F', marginTop: 2 },
  productPrice: { fontSize: 13, fontWeight: '700', color: '#171716', marginTop: 2 },
  evaluatingBadge: {
    backgroundColor: '#F3F1EC',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  evaluatingText: { fontSize: 11, fontWeight: '600', color: '#65635F' },

  simulationCard: {
    borderColor: '#FFD9C7',
    backgroundColor: '#FFFAF7',
  },
  simulationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  simulationTitle: { fontSize: 14, fontWeight: '700', color: '#171716' },
  simulationSub: { fontSize: 12, color: '#65635F', marginBottom: 12 },
  simulationBtnGrid: { gap: 10 },
  simBtn: {
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2DED7',
  },
  simBtnPrimary: {
    borderColor: '#FF5A1F',
    backgroundColor: '#FFF7F2',
  },
  simBtnTitle: { fontSize: 14, fontWeight: '700', color: '#171716' },
  simBtnDetail: { fontSize: 12, color: '#65635F', marginTop: 2 },
});
